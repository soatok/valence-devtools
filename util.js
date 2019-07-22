const fs = require('fs');
const fsp = require('fs').promises;
const inquirer = require('inquirer');

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
     *
     * @param {string} filename
     * @returns {Promise<Object>}
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
