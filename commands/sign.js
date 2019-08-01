const {
    AsymmetricFile,
    Keyring
} = require('dhole-crypto');
const fs = require('fs');
const fsp = fs.promises;
const homedir = require('os').homedir();
const LibValenceUtility = require('libvalence').Utility;
const util = require('../util');

module.exports = {
    configToObjects: async function(obj) {
        let kr = new Keyring();
        return {
            "directory": obj.directory,
            "secret-key": kr.loadAsymmetricSecretKey(obj['secret-key']),
            "public-key": kr.loadAsymmetricPublicKey(obj['public-key'])
        };
    },

    selectKey: async function(config) {
        let candidates = [];
        let cwd = process.cwd();
        if (config.keys.length < 1) {
            console.error("No signing keys configured. Please run keygen.");
             process.exit(0);
             return null;
        }

        for (let i = 0; i < config.keys.length; i++) {
            if (config.keys[i].directory === cwd) {
                candidates.push(i);
            }
        }
        let key = '';
        let choice = -1;
        if (candidates.length === 1) {
            // We only have one possible candidate.
            return await this.configToObjects(config.keys[candidates[0]]);
        } else if (candidates.length === 0) {
            // We have no candidates, prompt for all possible keys.
            for (let i = 0; i < config.keys.length; i++) {
                key = config.keys[i];
                console.log(`${i + 1} ${key['public-key']}\n`);
            }
            choice = parseInt(
                await util.prompt("Please select a key from this list above:"),
                10
            );
            if (choice < 1 || choice > config.keys.length) {
                console.error("Invalid choice.");
                process.exit(0);
                return null;
            }
            return await this.configToObjects(config.keys[choice - 1]);
        } else {
            // Select from the available candidates.
            for (let i = 0; i < candidates.length; i++) {
                key = config.keys[candidates[i]];
                console.log(`${i + 1} ${key['public-key']}\n`);
            }
            choice = parseInt(
                await util.prompt("Please select a key from this list above:"),
                10
            );
            if (choice < 1 || choice > candidates.length) {
                console.error("Invalid choice.");
                process.exit(0);
                return null;
            }
            return await this.configToObjects(config.keys[candidates[choice - 1]]);
        }
    },

    run: async function(args = []) {
        let config = await util.readJson(homedir + "/.valence/keyring.json");
        let keypair = await this.selectKey(config);
        if (typeof (keypair['secret-key']) === 'undefined') {
            process.exit(1);
            return;
        }

        let sig = '';
        let kr = new Keyring();
        for (let i = 0; i < args.length; i++) {
            try {
                sig = await AsymmetricFile.sign(
                    await fsp.open(args[i], 'r'),
                    keypair['secret-key']
                );
            } catch (e) {
                console.log(args[i]);
                throw e;
            }
            await util.writeJson(args[i] + '.sig', {
                'public-key': kr.save(keypair['secret-key'].getPublicKey()),
                'public-key-id': LibValenceUtility.getPublicKeyId(
                    keypair['secret-key'].getPublicKey()
                ),
                'signature': sig
            });
            // await fsp.writeFile(args[i] + '.sig', sig);
            console.log(`${args[i]} => ${args[i]}.sig\n`);
        }
    }
};
