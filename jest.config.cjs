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
	moduleNameMapper: {
		'^\$lib/(.*)$': '<rootDir>/src/lib/$1',
	},
	testEnvironment: "jsdom"
};
