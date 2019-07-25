const del = require('del');
const {
    DholeUtil
} = require('dhole-crypto');
const fs = require('fs');
const fsp = fs.promises;
const homedir = require('os').homedir();
const util = require('../util');

module.exports = {
    ensureStagingIsEmpty: async function (activeDir) {
        let adHash = await util.hash(activeDir);
        // Deletes the staging directory if it already exists:
        if (await util.exists(homedir + "/.valence/" + adHash)) {
            let prompt = await util.prompt('Staging directory exists. Overwrite? [y/N] ');
            switch (prompt.toLowerCase()) {
                case 'y':
                case 'yes':
                    await del(
                        [homedir + "/.valence/" + adHash + "/**"],
                        {"force": true}
                    );
                    await fsp.rmdir(homedir + "/.valence/" + adHash);
                    break;
                default:
                    console.log("Aborted due to user decision");
                    process.exit(0);
            }
        }
        // The directory does not exist. Create it.
        await fsp.mkdir(homedir + "/.valence/" + adHash);
        // Create a staging.json directory.
        await util.writeJson(
            homedir + "/.valence/" + adHash + "/staging.json",
            {"files": []}
        );
    },

    run: async function(args = []) {
        let activeDir = await fsp.realpath(process.cwd());
        await this.ensureStagingIsEmpty(activeDir);
    }
};
