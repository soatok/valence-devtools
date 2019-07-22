const {
    AsymmetricSecretKey,
    Keyring
} = require('dhole-crypto');
const fsp = require('fs').promises;
const homedir = require('os').homedir();
const util = require('../util');

module.exports = {
    run: async function() {
        let kr = new Keyring();
        let config = {};

        // Make sure the directory exists.
        if (!await util.exists(homedir + "/.valence")) {
            try {
                await fsp.mkdir(homedir + "/.valence");
            } catch (e) {
                console.error(`Could not create directory ${homedir}/.valence`);
                process.exit(255);
            }
        }

        // Load the existing config
        if (await util.exists(homedir + "/.valence/keyring.json")) {
            config = await util.readJson(homedir + "/.valence/keyring.json");
        }
        if (typeof(config['keys']) === 'undefined') {
            config['keys'] = [];
        }

        // Generate the new Ed25519 keypair
        let key = AsymmetricSecretKey.generate();
        let publicKey = kr.save(key.getPublicKey());
        config.keys.push({
            "directory": await fsp.realpath(process.cwd()),
            "public-key": publicKey,
            "secret-key": kr.save(key)
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
