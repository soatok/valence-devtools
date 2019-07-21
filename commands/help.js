module.exports = {
    run: function(args = []) {
        if (args.length > 0) {
            switch (args[0]) {
                case 'keygen':
                    console.log(
                        `Usage: ${process.argv[0]} keygen \n\n` +
                        "Generates a new signing key."
                    );
                    break;
                case 'sign':
                    console.log(
                        `Usage: ${process.argv[0]} sign [file.zip] \n\n` +
                        "Signs a file, stores the result in filename.sig"
                    );
                    break;
                case 'token':
                    console.log(
                        `Usage: ${process.argv[0]} token [publisher-id] [token] \n\n` +
                        "Saves an authentication token to publish new releases"
                    );
                    break;
            }
            process.exit(0);
            return;
        }
        console.log(
            `Usage: ${process.argv[0]} [command]\n\n` +
            "Commands: help, keygen, sign, token"
        );
    }
};
