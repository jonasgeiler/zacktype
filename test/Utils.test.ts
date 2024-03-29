import { Utils } from '$lib/Utils';
import { get, writable } from 'svelte/store';

test('randomInteger', () => {
	// Run 100 times
	for (let i = 0; i < 100; i++) {
		const randInt = Utils.randomInteger(10, 20);

		expect(randInt).toBeGreaterThanOrEqual(10);
		expect(randInt).toBeLessThanOrEqual(20);
	}
});

test('withProbability', () => {
	// I'm using a very over-complicated testing method here, which confirms the function is working by calculating the cumulative distribution and checking the average value

	let results: number[] = [];
	let total = 0;

	// Run 10000 times
	for (let i = 0; i < 10000; i++) {
		const result = Utils.withProbability(50);

		results.push(+result);
		total += +result;
	}

	let cumulativeDistribution: number[] = [ (results[0] / total) ];

	for (let i = 1; i < results.length; i++) {
		cumulativeDistribution[i] = cumulativeDistribution[i - 1] + (results[i] / total);
	}

	expect(
		+(cumulativeDistribution.reduce((a, b) => a + b, 0) / cumulativeDistribution.length).toFixed(1)
	).toEqual(0.5);
});

test('makeReadable', () => {
	const writableStore = writable('Hello World!');

	expect(writableStore).toHaveProperty('subscribe');
	expect(writableStore).toHaveProperty('set');
	expect(writableStore).toHaveProperty('update');

	const readableStore = Utils.makeReadable(writableStore);

	expect(readableStore).toHaveProperty('subscribe');
	expect(readableStore).not.toHaveProperty('set');
	expect(readableStore).not.toHaveProperty('update');

	writableStore.set('Hi There!'); // Update writable version of the store

	expect(get(readableStore)).toEqual('Hi There!'); // The readable version of the store should also update
});

test('findDifferences', () => {
	// No differences
	expect(Utils.findDifferences('Hello', 'Hello')).toEqual({
		added:   [],
		removed: [],
		changed: [],
	});

	// Added a character
	expect(Utils.findDifferences('Hello', 'Hello!')).toEqual({
		added:   [ 5 ],
		removed: [],
		changed: [],
	});

	// Added multiple characters
	expect(Utils.findDifferences('Hello', 'Hello!!!')).toEqual({
		added:   [ 5, 6, 7 ],
		removed: [],
		changed: [],
	});

	// Removed a character
	expect(Utils.findDifferences('Hello', 'Hell')).toEqual({
		added:   [],
		removed: [ 4 ],
		changed: [],
	});

	// Removed multiple characters
	expect(Utils.findDifferences('Hello', 'He')).toEqual({
		added:   [],
		removed: [ 2, 3, 4 ],
		changed: [],
	});

	// Changed a character
	expect(Utils.findDifferences('Hello!', 'Hello?')).toEqual({
		added:   [],
		removed: [],
		changed: [ 5 ],
	});

	// Changed multiple characters
	expect(Utils.findDifferences('Hello World', 'Hello Jest!')).toEqual({
		added:   [],
		removed: [],
		changed: [ 6, 7, 8, 9, 10 ],
	});

	// Changed and added a character
	expect(Utils.findDifferences('Hello!', 'Hello?!')).toEqual({
		added:   [ 6 ],
		removed: [],
		changed: [ 5 ],
	});

	// Changed and added multiple characters
	expect(Utils.findDifferences('Hello', 'Hey There')).toEqual({
		added:   [ 5, 6, 7, 8 ],
		removed: [],
		changed: [ 2, 3, 4 ],
	});

	// Changed and removed a character
	expect(Utils.findDifferences('Hello!!', 'Hello?')).toEqual({
		added:   [],
		removed: [ 6 ],
		changed: [ 5 ],
	});

	// Changed and removed multiple characters
	expect(Utils.findDifferences('Hey There', 'Hello')).toEqual({
		added:   [],
		removed: [ 5, 6, 7, 8 ],
		changed: [ 2, 3, 4 ],
	});
});
