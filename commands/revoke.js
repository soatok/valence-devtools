const fs = require('fs');
const fsp = fs.promises;
const { Keyring } = require('dhole-crypto');
const homedir = require('os').homedir();
const http = require('request-promise-native');
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

    /**
     * Gets the publisher token for the active project directory.
     *
     * @param {object} config
     * @param {string} dir
     * @returns {Object<string, string>}
     */
    async getPublisherToken(config, dir) {
        let found = -1;
        let token;
        for (let i = 0; i < config.tokens.length; i++) {
            token = config.tokens[i];
            if (await fsp.realpath(token.directory) === dir) {
                found = i;
                break;
            }
        }
        if (found < 0) {
            console.error("Publisher token not found for current project.");
            process.exit(4);
        }

        return config.tokens[found];
    },

    /**
     * @param config
     * @returns {{"secret-key", "public-key", directory}}
     */
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

    /**
     * @param {Object} config
     * @param {string} publicKey
     * @returns {Object}
     */
    sendRevocation: async function (config, publicKey) {
        let activeDir = await fsp.realpath(process.cwd());
        // Get the active publisher token:
        let token = await this.getPublisherToken(config, activeDir);
        // Load/validate the valence.json file for a given project...
        let valenceData = await this.getValenceConfig(activeDir);
        return await http({
            'method': 'POST',
            'form': {
                'publickey': publicKey
            },
            'headers': {
                'Valence-Publisher': token['access-token']
            },
            'uri': valenceData.server + '/publickey/revoke'
        });
    },

    run: async function (args = []) {
        if (args.length < 1) {
            console.error("No file passed");
            process.exit(1);
        }
        let config = await util.readJson(homedir + "/.valence/keyring.json");
        let whichPublicKey = this.selectKey(config);

        let response = JSON.parse(
            await this.sendRevocation(config, whichPublicKey)
        );

        if (typeof response.error !== 'undefined') {
            console.error(response.error);
            process.exit(4);
        } else if (typeof response.message !== 'undefined') {
            console.log(response.message);
            process.exit(0);
        }
    }
};
