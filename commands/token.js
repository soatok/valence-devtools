const {
    AsymmetricSecretKey,
    Keyring
} = require('dhole-crypto');
const fsp = require('fs').promises;
const homedir = require('os').homedir();
const util = require('../util');

module.exports = {
    run: async function(args = []) {
        if (args.length < 2) {
            console.log(
                `Usage: ${process.argv[0]} token [publisher-id] [publisher-token-goes-here]\n`
            );
            process.exit(0);
        }

        let config = await util.readJson(homedir + "/.valence/keyring.json");
        let dir = await fsp.realpath(process.cwd());
        if (typeof (config.tokens) === 'undefined') {
            config.tokens = [];
        }
        let found = -1;
        let token;

        // Search for existing tokens.
        for (let i = 0; i < config.tokens.length; i++) {
            token = config.tokens[i];
            if (await fsp.realpath(token.directory) === dir) {
                found = i;
                break;
            }
        }

        if (found >= 0) {
            let user = await util.prompt('Token already exists. Overwrite [y/N]?');
            user = user.toLowerCase();
            switch (user) {
                case 'y':
                case 'yes':
                    let tokens = [];
                    for (let i = 0; i < config.tokens.length; i++) {
                        if (i !== found) {
                            tokens.push(config.tokens[i]);
                        }
                    }
                    config.tokens = tokens;
                    break;
                default:
                    return;
            }
        }

        let id = parseInt(args[0], 10);
        let tokenValue = args[1];

        config.tokens.push({
            "directory": dir,
            "publisher-id": id,
            "access-token": tokenValue
        });

        if (await util.writeJson(
            homedir + "/.valence/keyring.json",
            config
        )) {
            console.log(`Token saved.\n`);
            process.exit(0);
        } else {
            console.error(`Could not save token.`);
            process.exit(1);
        }
    }
};
