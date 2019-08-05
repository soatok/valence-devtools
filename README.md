# Valence Dev Tools

[![Support on Patreon](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fsoatok&style=flat)](https://patreon.com/soatok)
[![npm version](https://img.shields.io/npm/v/valence-devtools.svg)](https://npm.im/valence-devtools)

Developer tools for [Valence](https://soatok.com/projects/valence) projects.

## Installing Valence Dev Tools

```
npm install -g valence-devtools
```

## Using Valence Dev Tools

### Setup

First, you'll need to setup your access token for a
[Valence Update Server](https://github.com/soatok/valence-updateserver).

Once you have a token from the server, run this command to configure it locally:

```
covalence token replaceThisStringWithTheToken
```

### Key Management

Next, you're going to need a keypair. Keypairs consist of a **signing key**
(also known as a "private key" or "secret key" in cryptography), and a 
**verification key** (also known as a "public key").

```
covalence keygen
```

By default, this will only generate a keypair and store it locally. 

> The default behavior was chosen so that, if you would like to generate your 
> signing keys offline and then shepherd the verification key to an Internet-connected
> computer, you can.

Run `covalence export FILENAME` to get the verification key, and `covalence associate FILENAME`
it with your publisher account. These commands do not need to be run on the same
machine, but the file created by the `export` command is necessary for the `associate`
command.

You may also run `covalence backup` and `covalence restore` to make copies of your
signing keys.

## Command Line Interface

### init (`covalence init`)

Creates an empty `valence.json` file. Useful for converting existing Electron apps
to use the Valence auto-update framework.

### begin (`covalence begin`)

Run this whenever you want to start building a new release.

### since (`covalence since TAG`)

Adds all of the files changed since a particular `git` tag. Useful for quickly
creating a release file.

### add (`covalence add FILE`) 

Run this command to add a file to the release package.

### ship (`covalence ship VERSION CHANNEL`)

Builds, signs, and uploads your package. Note that this can be broken up
into separate atomic steps:

1. `covalence package`
2. `covalence sign path/to/package.zip`
3. `covalence upload VERSION CHANNEL`
