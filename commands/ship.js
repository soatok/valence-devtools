const help = require('./help');
const pkg = require('./package');
const sh = require('run-sh');
const sign = require('./sign');
const upload = require('./upload');

module.exports = {
    run: async function(args = []) {
        try {
            if (args.length < 2) {
                return help.run(['ship']);
            }
            await pkg.run();
            await sign.run([await pkg.run()]);
            await upload.run(args);
        } catch (e) {
            console.log(e);
        }
    }
};
