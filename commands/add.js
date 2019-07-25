const fs = require('fs');
const fsp = fs.promises;
const homedir = require('os').homedir();
const util = require('../util');

// Maximum recursion depth.
const MAX_DEPTH = 16;

module.exports = {
    /**
     * @param {object} staging
     * @param {string[]} args
     * @param {string} subPath
     * @param {Number} depth
     * @returns {Promise<*>}
     */
    addFiles: async function (staging, args, subPath = '', depth = 0) {
        if (depth > MAX_DEPTH) {
            return staging;
        }
        let piece;
        for (let i = 0; i < args.length; i++) {
            if (subPath.length > 0) {
                piece = subPath + "/" + args[i];
            } else {
                piece = args[i];
            }
            if (await util.isDir(piece)) {
                staging = await this.addFiles(
                    staging,
                    await fsp.readdir(piece),
                    piece,
                    depth + 1
                );
            } else if (staging.files.indexOf(piece) < 0) {
                staging.files.push(piece);
            }
        }
        return staging;
    },

    run: async function(args = []) {
        let activeDir = await fsp.realpath(process.cwd());
        let adHash = await util.hash(activeDir);
        let staging = await util.readJson(
            homedir + "/.valence/" + adHash + "/staging.json"
        );
        await util.writeJson(
            homedir + "/.valence/" + adHash + "/staging.json",
            await this.addFiles(staging, args)
        );
    }
};
