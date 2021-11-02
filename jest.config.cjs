const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.json');

const esModules = [ 'nanostores' ].join('|');

module.exports = {
	transform:               {
		'^.+\\.svelte$':            [
			'svelte-jester',
			{
				'preprocess': true,
			},
		],
		'^.+\\.ts$':                'ts-jest',
		[`(${esModules}).+\\.js$`]: 'babel-jest',
	},
	transformIgnorePatterns: [ `/node_modules/(?!.*${esModules})` ],
	moduleFileExtensions:    [ 'js', 'ts', 'svelte' ],
	moduleNameMapper:        pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
	testEnvironment:         'jsdom',
};
