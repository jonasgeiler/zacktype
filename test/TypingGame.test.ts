import type { Readable } from 'svelte/store';
import TypingGame from '$lib/core/TypingGame';

const testReadableStore = (store: Readable<any>) => {
	expect(store).toHaveProperty('subscribe');
	expect(store).not.toHaveProperty('set');
	expect(store).not.toHaveProperty('update');

	const subscriber = jest.fn();
	store.subscribe(subscriber);

	expect(subscriber).toHaveBeenCalled();
}

describe('using the stores', () => {

	test('it correctly provides a readable characters store', () => {
		const tg = new TypingGame();

		const { characters } = tg.getStores();
		testReadableStore(characters);
	});

	test('it correctly provides a readable gameState store', () => {
		const tg = new TypingGame();

		const { gameState } = tg.getStores();
		testReadableStore(gameState);
	});

	test('it correctly provides a readable cps store', () => {
		const tg = new TypingGame();

		const { cps } = tg.getStores();
		testReadableStore(cps);
	});

	test('it correctly provides a readable wpm store', () => {
		const tg = new TypingGame();

		const { wpm } = tg.getStores();
		testReadableStore(wpm);
	});

	test('it correctly provides a readable accuracy store', () => {
		const tg = new TypingGame();

		const { accuracy } = tg.getStores();
		testReadableStore(accuracy);
	});

});
