const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
	transform:            {
		'^.+\\.svelte$': [
			'svelte-jester',
			{
				'preprocess': true,
			},
		],
		'^.+\\.ts$':     'ts-jest',
		'^.+\\.js$':     'babel-jest',
	},
	moduleFileExtensions: [ 'js', 'ts', 'svelte' ],
	moduleNameMapper:     pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
	testEnvironment:      'jsdom',
};
