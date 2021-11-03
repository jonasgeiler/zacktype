import TypingGame from '$lib/game/TypingGame';
import type { ReadableAtom } from 'nanostores';

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

function testReadableStore<T extends any>(store: ReadableAtom<T>, expectValue?: T) {
	expect(store).toHaveProperty('subscribe');
	expect(store).toHaveProperty('get');
	expect(store).not.toHaveProperty('set');
	expect(store).not.toHaveProperty('update');

	const subscriber = jest.fn();
	store.subscribe(subscriber);

	expect(subscriber).toHaveBeenCalled();

	if (expectValue !== undefined) {
		expect(store.get()).toEqual(expectValue);
		expect(subscriber).toHaveBeenCalledWith(expectValue);
	}
}

function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

describe('TypingGame', () => {

	test('setting custom text', () => {
		const tg = new TypingGame({
			text: 'Hello World!',
		});
		const { text } = tg.getStores();

		testReadableStore<string>(text, 'Hello World!');
	});

	test('inputText contains current user input', () => {
		const tg = new TypingGame({
			text: 'Hello World!',
		});
		const { inputText } = tg.getStores();

		testReadableStore<string>(inputText, '');

		expect(inputText.get()).toEqual('');
		tg.backspace(); // Should do nothing
		tg.backspace();
		tg.backspace();
		expect(inputText.get()).toEqual('');
		tg.insert('H'); // Insert first character
		expect(inputText.get()).toEqual('H');
		tg.insert('i'); // Insert wrong character
		expect(inputText.get()).toEqual('Hi'); // Wrong character shouldn't affect inputText
		tg.insert(' '); // Insert space
		expect(inputText.get()).toEqual('Hi '); // inputText should also contain spaces obviously
		tg.backspace(); // Remove space
		expect(inputText.get()).toEqual('Hi'); // Check if space was removed in inputText
		tg.insert('!'); // Insert new character instead of the space
		expect(inputText.get()).toEqual('Hi!'); // inputText should contain replacement character
	});

	test('characterStates contains state for each character', () => {
		const text = 'Hello World!';
		const tg = new TypingGame({
			text,
		});
		const { characterStates } = tg.getStores();

		testReadableStore<TypingGame.CharacterState[]>(
			characterStates,
			expect.arrayContaining(
				new Array(text.length).fill(TypingGame.CharacterState.None), // [0, 0, 0, ...]
			),
		);

		expect(characterStates.get().length).toEqual(text.length);

	});

	test('gameState represents current game state', () => {
		const text = 'Hello World!';
		const tg = new TypingGame({
			text,
		});
		const { gameState } = tg.getStores();

		testReadableStore<TypingGame.GameState>(gameState, TypingGame.GameState.NotStarted);

		expect(gameState.get()).toEqual(TypingGame.GameState.NotStarted);
		tg.insert('H'); // First character starts the game
		expect(gameState.get()).toEqual(TypingGame.GameState.Started);
		tg.backspace(); // Remove first character again
		for (let char of text) {
			tg.insert(char); // Insert all characters
		}
		expect(gameState.get()).toEqual(TypingGame.GameState.Ended); // Game ends when all characters entered
	});

	test('mistakePositions contains all mistake positions', () => {
		const tg = new TypingGame({
			text: 'Hello World!',
		});
		const { mistakePositions } = tg.getStores();

		testReadableStore<number[]>(mistakePositions, expect.arrayContaining([]));

		expect(mistakePositions.get()).toEqual(expect.arrayContaining([]));
		tg.insert('H');
		tg.insert('i'); // Wrong character
		expect(mistakePositions.get()).toEqual(expect.arrayContaining([ 1 ])); // Contains mistake
		tg.backspace(); // Remove wrong character
		tg.insert('e'); // Insert right character
		tg.insert('l');
		expect(mistakePositions.get()).toEqual(expect.arrayContaining([ 1 ])); // Shouldn't change
		tg.insert('o'); // Wrong character
		expect(mistakePositions.get()).toEqual(expect.arrayContaining([ 1, 3 ])); // Another mistake
		tg.insert('k'); // Wrong character
		expect(mistakePositions.get()).toEqual(expect.arrayContaining([ 1, 3, 4 ])); // ANOTHER mistake
	});

	test('correctedMistakePositions contains all corrected mistake positions', () => {
		const tg = new TypingGame({
			text: 'Hello World!',
		});
		const { correctedMistakePositions } = tg.getStores();

		testReadableStore<number[]>(correctedMistakePositions, expect.arrayContaining([]));

		expect(correctedMistakePositions.get()).toEqual(expect.arrayContaining([]));
		tg.insert('H');
		tg.insert('i'); // Wrong character
		expect(correctedMistakePositions.get()).toEqual(expect.arrayContaining([]));
		tg.backspace(); // Remove wrong character
		tg.insert('e'); // Insert right character
		expect(correctedMistakePositions.get()).toEqual(expect.arrayContaining([ 1 ]));
		tg.backspace(); // Remove right character again
		expect(correctedMistakePositions.get()).toEqual(expect.arrayContaining([ 1 ]));
		tg.insert('e'); // Insert right character again
		expect(correctedMistakePositions.get()).toEqual(expect.arrayContaining([ 1 ]));
		tg.insert('l');
		tg.insert('o'); // Wrong character
		expect(correctedMistakePositions.get()).toEqual(expect.arrayContaining([ 1 ]));
		tg.backspace(); // Remove wrong character
		tg.insert('l'); // Insert right character
		expect(correctedMistakePositions.get()).toEqual(expect.arrayContaining([ 1, 3 ]));
	});

	test('typedCharacters contains the amount of typed characters', () => {
		const text = 'Hello World!';
		const tg = new TypingGame({
			text,
		});
		const { typedCharacters } = tg.getStores();

		testReadableStore<number>(typedCharacters, 0);

		expect(typedCharacters.get()).toEqual(0);
		tg.insert('H');
		expect(typedCharacters.get()).toEqual(1);
		tg.insert('e');
		expect(typedCharacters.get()).toEqual(2);
		tg.insert('f'); // Wrong character
		expect(typedCharacters.get()).toEqual(3); // Wrong character should also increase typedCharacters
		tg.insert(' '); // Space
		expect(typedCharacters.get()).toEqual(4); // Space should also increase typeCharacters
		tg.backspace(); // Remove space
		tg.backspace(); // Remove wrong character
		expect(typedCharacters.get()).toEqual(4); // Removing characters shouldn't affect typedCharacters
		tg.insert('l');
		tg.insert('l');
		expect(typedCharacters.get()).toEqual(6);
		for (let char of text.substr(4)) {
			tg.insert(char); // Insert the rest of the characters
		}
		expect(typedCharacters.get()).toEqual(14); // At the end it should be 14 characters
		tg.insert('s'); // Insert character, even though we're finished
		expect(typedCharacters.get()).toEqual(14); // Inserting character after game was finished shouldn't affect typedCharacters
		tg.backspace(); // Remove last character
		expect(typedCharacters.get()).toEqual(14); // Removing the last character shouldn't affect typedCharacters
	});

	test('startTime contains the time when user started typing', async () => {
		const tg = new TypingGame({
			text: 'Hello World!',
		});
		const { startTime } = tg.getStores();

		testReadableStore<number | null>(startTime, null);

		expect(startTime.get()).toBeNull();
		const firstCharTimeStart = Date.now(); // Store time before inserting first char
		tg.insert('H'); // Insert first character
		const firstCharTimeEnd = Date.now(); // Store time after inserting first char
		expect(startTime.get()).toBeGreaterThanOrEqual(firstCharTimeStart);
		expect(startTime.get()).toBeLessThanOrEqual(firstCharTimeEnd);
		tg.insert('e'); // Insert second character
		await wait(100); // Wait a bit
		tg.insert('l'); // Insert third character
		expect(startTime.get()).toBeGreaterThanOrEqual(firstCharTimeStart); // Insert more characters shouldn't affect startTime
		expect(startTime.get()).toBeLessThanOrEqual(firstCharTimeEnd);
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
