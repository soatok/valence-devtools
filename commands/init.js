const fs = require('fs');
const fsp = fs.promises;
const util = require('../util');
module.exports = {
    run: async function(args = []) {
        let activeDir = await fsp.realpath(process.cwd());
        if (await util.exists(activeDir + "/valence.json")) {
            console.error("valence.json already exists");
            process.exit(1);
        }
        if (await util.writeJson(
            activeDir + "/valence.json",
            {
                "name": args[0] || "UNNAMED PROJECT PLEASE CHANGE ME",
                "server": "http://localhost/change-me"
            }
        )) {
            console.log(activeDir + "/valence.json");
        } else {
            console.error("Error writing to " + activeDir + "/valence.json");
        }
    }
};
