const fs = require('fs');
const fsp = fs.promises;
const homedir = require('os').homedir();
const util = require('../util');
const sh = require("run-sh");

// Maximum recursion depth.
const MAX_DEPTH = 16;

module.exports = {
    /**
     * @param {string} tag
     * @returns {string[]}
     */
    getFilesSince: async function (tag) {
        let response = await sh(
            "git diff --name-only " +
            tag.replace(/[^A-Za-z0-9\\.\-_]+/, '') +
            " HEAD"
        );
        return response.stdout.split("\n");
    },

    run: async function(args = []) {
        if (args.length < 1) {
            console.error("You must provide a version tag.");
            process.exit(1);
            return;
        }

        let activeDir = await fsp.realpath(process.cwd());
        let adHash = await util.hash(activeDir);
        let staging = await util.readJson(
            homedir + "/.valence/" + adHash + "/staging.json"
        );

        let tag = args.shift();
        let filesToAdd = await this.getFilesSince(tag);

        for (let i = 0; i < filesToAdd.length; i++) {
            if (filesToAdd.length === 0) {
                continue;
            }
            if (staging.files.indexOf(filesToAdd[i]) < 0) {
                staging.files.push(filesToAdd[i]);
            }
        }
        await util.writeJson(
            homedir + "/.valence/" + adHash + "/staging.json",
            staging
        );
    }
};
