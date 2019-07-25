const fs = require('fs');
const fsp = fs.promises;
const http = require('request-promise-native');
const homedir = require('os').homedir();
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

    /**
     * Gets the release information (signature, public key)
     *
     * @param {string} packageFile
     * @returns {object<string, string>}
     */
    getReleaseInfo: async function (packageFile) {
        // Ensures files exist...
        if (!await util.exists(packageFile)) {
            console.error("Release file not found");
            process.exit(2);
        }
        if (!await util.exists(packageFile + ".sig")) {
            console.error("Release signature not found");
            process.exit(3);
        }
        return await util.readJson(packageFile + ".sig");
    },

    /**
     * Load/parse the valence.json file in the active project directory.
     *
     * @param {string} activeDir
     * @returns {object}
     */
    getValenceConfig: async function (activeDir) {
        // Load/validate the valence.json file for a given project...
        if (!await util.exists(activeDir + "/valence.json")) {
            throw new Error("Could not find a valid valence.json file.");
        }
        let valenceData = await util.readJson(
            util.exists(activeDir + "/valence.json")
        );
        if (typeof valenceData.name === 'undefined') {
            throw new Error("There is no 'name' key in valence.json");
        }
        if (typeof valenceData.server === 'undefined') {
            throw new Error("There is no 'server' key in valence.json");
        }
        return valenceData;
    },

    /**
     *
     * @param {string} version
     * @param {string} channel
     * @returns {object}
     */
    uploadFile: async function(version, channel) {
        let activeDir = await fsp.realpath(process.cwd());
        let adHash = await util.hash(activeDir);
        let packageFile = homedir + "/.valence/" + adHash + "/release.zip";

        // Load keyring.json (global config file):
        let config = await util.readJson(homedir + "/.valence/keyring.json");

        // Get the active publisher token:
        let token = await this.getPublisherToken(config, activeDir);

        // Get the release info from the .sig file:
        let releaseInfo = await this.getReleaseInfo(packageFile);

        // Load/validate the valence.json file for a given project...
        let valenceData = await this.getValenceConfig(activeDir);

        // Upload it.
        return await http({
            'method': 'POST',
            'file': {
                value: fs.createReadStream(packageFile),
                options: {
                    filename: 'release-' + version + '-' + channel + '.zip',
                    contentType: 'application/zip'
                }
            },
            'form': {
                'channel': channel,
                'project': valenceData.name,
                'publickey': releaseInfo['public-key'],
                'signature': releaseInfo['signature'],
                'version': version
            },
            'headers': {
                'Valence-Publisher': token['access-token']
            },
            'uri': valenceData.server + '/publish'
        });
    },

    run: async function(args = []) {
        // Argument processing...
        if (args.length < 1) {
            console.error("You must specify a version");
            process.exit(1);
        }
        let channel = 'public';
        let version = args.shift();
        if (args.length > 0) {
            channel = args.shift();
        }
        let response = JSON.parse(
            await this.uploadFile(version, channel)
        );

        if (typeof response.error !== 'undefined') {
            console.error(response.error);
            process.exit(1);
        } else if (typeof response.message !== 'undefined') {
            console.log(response.message);
            process.exit(0);
        }
    }
};
