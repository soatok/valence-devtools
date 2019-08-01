const fs = require('fs');
const fsp = fs.promises;
const homedir = require('os').homedir();
const http = require('request-promise-native');
const util = require('../util');

module.exports = {
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

    sendPublicKey: async function (publicKey) {
        // Load keyring.json (global config file):
        let config = await util.readJson(homedir + "/.valence/keyring.json");
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
            'uri': valenceData.server + '/publickey/add'
        });
    },

    run: async function (args = []) {
        if (args.length < 1) {
            console.error("No file passed");
            process.exit(1);
        }

        let publicKeyFile = await util.readJson(args[0]);
        if (typeof (publicKeyFile['public-key']) === 'undefined') {
            console.error("Invalid public key file");
            process.exit(2);
        }

        let response = JSON.parse(
            await this.sendPublicKey(publicKeyFile['public-key'])
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
