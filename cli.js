#!/usr/bin/env node
const [,, ... args] = process.argv;
let command;

if (args.length < 1 || args.indexOf('--help') >= 0) {
     command = require('./commands/help');
} else {
    switch (args[0]) {
        case 'add':
        case 'begin':
        case 'help':
        case 'keygen':
        case 'package':
        case 'ship':
        case 'sign':
        case 'since':
        case 'token':
        case 'upload':
            command = require('./commands/' + args[0]);
            break;
        default:
            throw new Error("Unknown command: " + args[0]);
    }
}

if (typeof(command) === 'undefined') {
    throw new Error("Unknown command: " + args);
}
command.run(args.slice(1));
