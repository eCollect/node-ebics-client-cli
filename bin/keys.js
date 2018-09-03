#!/usr/bin/env node

'use strict';

const fs = require('fs');

const chalk = require('chalk');
const packageJSON = require('../package');
const defaultEncryptor = require('./../encryption/defaultKeyEncryptor');

const usage = {
	cli: chalk.grey('USAGE : ') + chalk.white('keys') + chalk.yellow(' expand|combine ') + chalk.white('passphrase source destination'),
	expand: chalk.grey('USAGE : ') + chalk.white('keys') + chalk.yellow(' expand ') + chalk.white('passphrase source destination'),
	combine: chalk.grey('USAGE : ') + chalk.white('keys') + chalk.yellow(' combine ') + chalk.white('passphrase source destination'),
};
const [, , command, passphrase, source, destination, ...others] = process.argv;

const end = (...errors) => {
	if (!errors || !errors.length)
		process.exit(0);

	errors.forEach(e => console.log(e));
	process.exit(1);
};
const error = param => chalk.red('[ERROR] : ') + param;
const parameterMissingError = param => error(chalk.red('Parameter ') + chalk.white(`[${param}]`) + chalk.red(' is missing!'));

console.log('🔑  ' + chalk.white('eCollect Simple keys tool CLI') + chalk.grey(` - ${packageJSON.version}`)); // eslint-disable-line
console.log(chalk.grey('--------------------------------')); // eslint-disable-line

// No command is given
if (!command) {
	console.log(usage.cli);
	return end();
}

// The given command is unknown
if (!Object.keys(usage).includes(command))
	return end(error(`Unknow command ${command}`));

// No passphrase given
if (!passphrase)
	return end(usage.expand, parameterMissingError('passphrase'));

// No source file given
if (!source)
	return end(usage.expand, parameterMissingError('source'));

// No destination is given
if (!destination)
	return end(usage.expand, parameterMissingError('destination'));

// Given source doesn't exist
if (!fs.existsSync(source))
	return end(error(`Source ${chalk.yellow(source)} doesn't exist.`));

// Given destination doesn't exist
if (!fs.existsSync(destination))
	return end(error(`Destination ${chalk.yellow(destination)} doesn't exist.`));

// Prepare the encryptor
const encryptor = defaultEncryptor({ passphrase });

// Expand is commanded
if (command === 'expand') {
	// Read the content of the source file
	const keysString = fs.readFileSync(source).toString();
	const keys = JSON.parse(encryptor.decrypt(keysString));

	Object.keys(keys).map((key) => {
		const path = `${destination}/${key}.key`;

		fs.writeFileSync(path, keys[key]);
		console.log(`${chalk.green('SUCCESS :')} File ${chalk.yellow(path)} has been saved!`);

		return key;
	});
	end();
}

end();
