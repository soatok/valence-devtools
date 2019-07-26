module.exports = {
    run: function(args = []) {
        if (args.length > 0) {
            switch (args[0]) {
                case 'add':
                    console.log(
                        `Usage: ${process.argv[0]} add file[, file2, ...] \n\n` +
                        "Stages files for inclusion in the new release.\n" +
                        "Must be run after the begin command."
                    );
                    break;
                case 'begin':
                    console.log(
                        `Usage: ${process.argv[0]} begin \n\n` +
                        "Starts a clean slate for packaging a new release."
                    );
                    break;
                case 'init':
                    console.log(
                        `Usage: ${process.argv[0]} init \n\n` +
                        "Creates a basic valence.json file in the active project directory."
                    );
                    break;
                case 'keygen':
                    console.log(
                        `Usage: ${process.argv[0]} keygen \n\n` +
                        "Generates a new signing key."
                    );
                    break;
                case 'package':
                    console.log(
                        `Usage: ${process.argv[0]} package \n\n` +
                        "Zips up all the staged files for signing and releasing."
                    );
                    break;
                case 'ship':
                    console.log(
                        `Usage: ${process.argv[0]} ship [version] [channel] \n\n` +
                        "Build, sign, and publish a new release in one go.\n" +
                        "Must be run after the begin command."
                    );
                    break;
                case 'sign':
                    console.log(
                        `Usage: ${process.argv[0]} sign [file.zip] \n\n` +
                        "Signs a file, stores the result in filename.sig"
                    );
                    break;
                case 'since':
                    console.log(
                        `Usage: ${process.argv[0]} since [version] [channel]\n\n` +
                        "Adds all files changed since a specific version.\n" +
                        "Depends on git (and git tags) for this information.\n" +
                        "Must be run after the begin command."
                    );
                    break;
                case 'token':
                    console.log(
                        `Usage: ${process.argv[0]} token [publisher-id] [token] \n\n` +
                        "Saves an authentication token to publish new releases"
                    );
                    break;
                case 'upload':
                    console.log(
                        `Usage: ${process.argv[0]} upload [version] [channel] \n\n` +
                        "Uploads the new release to the update server."
                    );
                    break;
            }
            process.exit(0);
            return;
        }
        console.log(
            `Usage: ${process.argv[0]} [command]\n\n` +
            "Commands: add, begin, help, keygen, package, sign, ship, since, token, upload"
        );
    }
};
