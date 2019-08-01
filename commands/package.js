const fs = require('fs');
const fsp = fs.promises;
const JSZip = require('jszip');
const homedir = require('os').homedir();
const util = require('../util');

module.exports = {
    buildZip: async function (staging, activeDir) {
        let zip = new JSZip();
        let dirsHit = [];
        let dir;
        for (let i = 0; i < staging.files.length; i++) {
            if (staging.files[i].length < 1) {
                continue;
            }
            // Add directory if it doesn't exist already in the archive.
            dir = this.getDirFromFilename(staging.files[i]);
            if (dir.length > 0) {
                if (dirsHit.indexOf(dir) < 0) {
                    zip.folder(dir);
                    dirsHit.push(dir);
                }
            }

            // Add this file...
            zip.file(
                staging.files[i],
                await fsp.readFile(activeDir + "/" + staging.files[i])
            );
        }
        return await zip.generateAsync({type: 'uint8array'});
    },

    /**
     *
     * @param {string} filename
     * @returns {string}
     */
    getDirFromFilename: function(filename) {
        let pieces = filename.split('/');
        pieces.pop();
        return pieces.join('/');
    },

    run: async function() {
        let activeDir = await fsp.realpath(process.cwd());
        let adHash = await util.hash(activeDir);
        let staging = await util.readJson(
            homedir + "/.valence/" + adHash + "/staging.json"
        );
        if (staging.files.length < 1) {
            console.error("No files staged to be packaged");
            return;
        }

        await fsp.writeFile(
            homedir + "/.valence/" + adHash + "/release.zip",
            await this.buildZip(staging, activeDir)
        );
        return homedir + "/.valence/" + adHash + "/release.zip";
    }
};
