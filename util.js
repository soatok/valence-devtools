const fs = require('fs');
const fsp = fs.promises;
const inquirer = require('inquirer');
const DholeUtil = require('dhole-crypto').DholeUtil;
const sodium = require('dhole-crypto')._sodium;

module.exports = {
    exists: async function(target) {
        try {
            let access = await fsp.access(
                target,
                fs.constants.F_OK,
                (err) => {
                    return !err
                }
            );
            return !access;
        } catch (e) {
            return false;
        }
    },

    /**
     * @param {string|Buffer} inputString
     * @param {boolean} raw
     * @returns {Promise<string|Buffer>}
     */
    hash: async function (inputString, raw = false) {
        let out = Buffer.alloc(32);
        sodium.crypto_generichash(out, DholeUtil.stringToBuffer(inputString));
        if (raw) {
            return out;
        }
        return out.toString('hex');
    },

    /**
     *
     * @param {string} path
     * @returns {boolean}
     */
    isDir: async function (path) {
        if (!await this.exists(path)) {
            return false;
        }
        let stat = await fsp.stat(path);
        return stat.isDirectory();
    },

    /**
     * @param {string} question
     * @returns {string}
     */
    prompt: async function(question) {
        return await inquirer.prompt({
            'type': 'input',
            'name': 'response',
            'message': question
        }).then(async function(response) {
            return response['response'];
        });
    },

    /**
     * @param {string} filename
     * @returns {Object}
     */
    readJson: async function(filename) {
        try {
            return JSON.parse(
                await fsp.readFile(
                    filename,
                    {"encoding": "UTF-8", "flag": "r"},
                    (err, data) => {
                        if (err) throw err;
                        return data.toString();
                    }
                )
            );
        } catch (e) {
            return {};
        }
    },

    /**
     * @param path
     * @param obj
     * @returns {boolean}
     */
    async writeJson(path, obj) {
        try {
            await fsp.writeFile(
                path,
                JSON.stringify(obj, null, 4)
            );
            return true;
        } catch (e) {
            return false;
        }
    }
};
