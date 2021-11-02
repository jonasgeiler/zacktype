import TypingGame from '$lib/core/TypingGame';
import type { Readable } from 'svelte/store';

describe('providing text', () => {

	test('it uses the provided text', () => {
		const tg = new TypingGame({
			text: 'Hello World!',
		});

		const { text } = tg.getStores();

		expect(text.get()).toEqual('Hello World!');
	});

});

describe('generating text', () => {

	test('it generates random text when no text was provided', () => {
		const tg = new TypingGame({
			text:                      null,
			approximateTextLength:     1000,
			generateSpecialCharacters: true,
			generateUppercaseLetters:  true,
		});

		const { text } = tg.getStores();

		expect(text.get()).toEqual(expect.any(String));
		expect(text.get().length).toBeGreaterThan(10);
		expect(text.get()).toMatch(/^[a-zA-Z.,?!\- ]+$/);
	});

	test('it doesn\'t have special characters in the generated text when disabling the generateSpecialCharacters option', () => {
		const tg = new TypingGame({
			text:                      null,
			approximateTextLength:     1000,
			generateSpecialCharacters: false,
			generateUppercaseLetters:  true,
		});

		const { text } = tg.getStores();

		expect(text.get()).toMatch(/^[^.,?!\-]+$/);
	});

	test('it doesn\'t have uppercase letters in the generated text when disabling the generateUppercaseLetters option', () => {
		const tg = new TypingGame({
			text:                      null,
			approximateTextLength:     1000,
			generateSpecialCharacters: true,
			generateUppercaseLetters:  false,
		});

		const { text } = tg.getStores();

		expect(text.get()).toMatch(/^[^A-Z]+$/);
	});

	test('it doesn\'t have uppercase letters or special characters in the generated text when disabling both the generateUppercaseLetters and the generateSpecialCharacters options', () => {
		const tg = new TypingGame({
			text:                      null,
			approximateTextLength:     1000,
			generateSpecialCharacters: false,
			generateUppercaseLetters:  false,
		});

		const { text } = tg.getStores();

		expect(text.get()).toMatch(/^[^A-Z.,?!\-]+$/);
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

		const { characterStates } = tg.getStores();
		testReadableStore(characterStates);
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

	test('cursorCharacter holds the current character', () => {
		const tg = new TypingGame({
			text: 'Hello World!',
		});

		const { cursorCharacter } = tg.getStores();

		const subscriber = jest.fn();
		cursorCharacter.subscribe(subscriber);

		expect(subscriber).toHaveBeenCalledWith('H');
	});

});
