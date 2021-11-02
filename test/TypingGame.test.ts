import TypingGame from '$lib/core/TypingGame';
import type { Readable } from 'svelte/store';

describe('providing text', () => {

	test('it uses the provided text', () => {
		const tg = new TypingGame({
			text: 'Hello World!'
		});

		expect(tg.text).toEqual('Hello World!');
	});

});

describe('generating text', () => {

	test('it generates random text when no text was provided', () => {
		const tg = new TypingGame({
			text: null,
			approximateTextLength:     1000,
			generateSpecialCharacters: true,
			generateUppercaseLetters:  true,
		});

		expect(tg.text).toEqual(expect.any(String));
		expect(tg.text.length).toBeGreaterThan(10);
		expect(tg.text).toMatch(/^[a-zA-Z.,?!\- ]+$/);
	});

	test('it doesn\'t have special characters in the generated text when disabling the generateSpecialCharacters option', () => {
		const tg = new TypingGame({
			text: null,
			approximateTextLength:     1000,
			generateSpecialCharacters: false,
			generateUppercaseLetters:  true,
		});

		expect(tg.text).toMatch(/^[^.,?!\-]+$/);
	});

	test('it doesn\'t have uppercase letters in the generated text when disabling the generateUppercaseLetters option', () => {
		const tg = new TypingGame({
			text: null,
			approximateTextLength:     1000,
			generateSpecialCharacters: true,
			generateUppercaseLetters:  false,
		});

		expect(tg.text).toMatch(/^[^A-Z]+$/);
	});

	test('it doesn\'t have uppercase letters or special characters in the generated text when disabling both the generateUppercaseLetters and the generateSpecialCharacters options', () => {
		const tg = new TypingGame({
			text: null,
			approximateTextLength:     1000,
			generateSpecialCharacters: false,
			generateUppercaseLetters:  false,
		});

		expect(tg.text).toMatch(/^[^A-Z.,?!\-]+$/);
	});

});

const testReadableStore = (store: Readable<any>) => {
	expect(store).toHaveProperty('subscribe');
	expect(store).not.toHaveProperty('set');
	expect(store).not.toHaveProperty('update');

	const subscriber = jest.fn();
	store.subscribe(subscriber);

	expect(subscriber).toHaveBeenCalled();
};

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
