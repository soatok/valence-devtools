const fs = require('fs');
const fsp = fs.promises;
const { Keyring } = require('dhole-crypto');
const homedir = require('os').homedir();
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
        if (args.length < 1) {
            console.error("No file passed");
            process.exit(1);
        }
        let config = await util.readJson(homedir + "/.valence/keyring.json");
        let importFile = await util.readJson(args[0]);
        let currentDir = await fsp.realpath(process.cwd());

        let curr;
        for (let k in config.keys) {
            if (!config.keys.hasOwnProperty(k)) {
                continue;
            }
            curr = config.keys[k];
            if (currentDir !== curr.direction) {
                continue;
            }
            if (curr['public-key'] !== importFile['public-key']) {
                continue;
            }
            if (curr['secret-key'] !== importFile['secret-key']) {
                continue;
            }

            console.error("Key has already been imported.");
            process.exit(1);
        }

        config.keys.push({
            "directory": currentDir,
            "public-key": importFile['public-key'],
            "secret-key": importFile['secret-key']
        });

        // Write the new config file
        if (await util.writeJson(
            homedir + "/.valence/keyring.json",
            config
        )) {
            console.log(`Public key added:\n${publicKey}\n`);
            process.exit(0);
        } else {
            console.error(`Could not save new key to keyring`);
            process.exit(1);
        }
    }
};
