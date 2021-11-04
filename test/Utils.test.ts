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

test('subscribeAll', () => {
	const testStore1 = writable('Hello');
	const testStore2 = writable('World');

	const subscriber = jest.fn();
	const unsubscribeAll = Utils.subscribeAll([ testStore1, testStore2 ], subscriber);

	expect(subscriber).toHaveBeenCalledTimes(1);
	expect(subscriber).toHaveBeenCalledWith([ 'Hello', 'World' ]);

	testStore1.set('Hey');

	expect(subscriber).toHaveBeenCalledTimes(2);
	expect(subscriber).toHaveBeenCalledWith([ 'Hey', 'World' ]);

	testStore2.set('There');

	expect(subscriber).toHaveBeenCalledTimes(3);
	expect(subscriber).toHaveBeenCalledWith([ 'Hey', 'There' ]);

	unsubscribeAll(); // Unsubscribe from all stores

	testStore1.set('Hi');

	expect(subscriber).toHaveBeenCalledTimes(3); // Shouldn't be called again after unsubscribe

	testStore2.set('JavaScript');

	expect(subscriber).toHaveBeenCalledTimes(3); // Shouldn't be called again after unsubscribe
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
