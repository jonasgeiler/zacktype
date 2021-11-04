import { CharacterState, GameState, TypingGame } from '$lib/TypingGame';
import { get, Writable } from 'svelte/store';
import type { Readable } from 'svelte/store';

function expectReadable<T extends any>(store: Readable<T>, expectValue?: T) {
	expect(store).toHaveProperty('subscribe');
	expect(store).not.toHaveProperty('set');
	expect(store).not.toHaveProperty('update');

	const subscriber = jest.fn();
	store.subscribe(subscriber);

	expect(subscriber).toHaveBeenCalled();
	if (expectValue !== undefined) expect(subscriber).toHaveBeenCalledWith(expectValue);
}

function expectWritable<T extends any>(store: Writable<T>, expectValue?: T) {
	expect(store).toHaveProperty('subscribe');
	expect(store).toHaveProperty('set');
	expect(store).toHaveProperty('update');

	const subscriber = jest.fn();
	store.subscribe(subscriber);

	expect(subscriber).toHaveBeenCalled();
	if (expectValue !== undefined) expect(subscriber).toHaveBeenCalledWith(expectValue);
}

function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

describe('TypingGame', () => {

	test('initiating without parameters', () => {
		const tg = new TypingGame();
		const { text } = tg;

		expectReadable<string>(text);

		const $text = get(text);
		expect($text).toEqual(expect.any(String));
		expect($text.length).toBeGreaterThan(0);
	});

	test('initiating with custom text', () => {
		const tg = new TypingGame('Hello World!');
		const { text } = tg;

		expectReadable<string>(text, 'Hello World!');
	});

	test('initiating with minimum length', () => {
		const tg = new TypingGame(500);
		const { text } = tg;

		expectReadable<string>(text);

		const $text = get(text);
		expect($text).toEqual(expect.any(String));
		expect($text.length).toBeGreaterThanOrEqual(500);
	});

	test('using inputText store', () => {
		const tg = new TypingGame('Hello World!');
		const { inputText } = tg;

		expectWritable<string>(inputText, '');

		inputText.set('Hey');
		expect(get(inputText)).toEqual('Hey');

		inputText.set('Hello');
		expect(get(inputText)).toEqual('Hello');

		tg.reset();

		expect(get(inputText)).toEqual('');
	});

	test('using characterStates store', () => {
		const tg = new TypingGame('hey');
		const { characterStates, inputText } = tg;

		// Shorthands
		const none = CharacterState.None;
		const correct = CharacterState.Correct;
		const wrong = CharacterState.Incorrect;

		expectReadable<CharacterState[]>(characterStates, expect.arrayContaining([ none, none, none ]));

		inputText.set(''); // Set inputText to empty string
		expect(get(characterStates)).toEqual(expect.arrayContaining([ none, none, none ])); // Shouldn't be changed

		inputText.set('h'); // Insert first character
		expect(get(characterStates)).toEqual(expect.arrayContaining([ correct, none, none ]));

		inputText.set('hi'); // Insert wrong character
		expect(get(characterStates)).toEqual(expect.arrayContaining([ correct, wrong, none ]));

		inputText.set('h'); // Remove wrong character
		expect(get(characterStates)).toEqual(expect.arrayContaining([ correct, none, none ]));

		inputText.set('he'); // Insert second character
		expect(get(characterStates)).toEqual(expect.arrayContaining([ correct, correct, none ]));

		inputText.set('hey'); // Insert last character, so game ends
		expect(get(characterStates)).toEqual(expect.arrayContaining([ correct, correct, correct ])); // All should be correct at the end

		inputText.set('hey!'); // Insert character, although the game ended
		expect(get(characterStates)).toEqual(expect.arrayContaining([ correct, correct, correct ])); // Inserting a character when the game ended should be ignored

		inputText.set('hey'); // Remove last character, although the game ended
		expect(get(characterStates)).toEqual(expect.arrayContaining([ correct, correct, correct ])); // Removing a character when the game ended should be ignored

		tg.reset();

		expect(get(characterStates)).toEqual(expect.arrayContaining([ none, none, none ])); // Should have been reset
	});

	test('using gameState store', () => {
		const tg = new TypingGame('Hello World!');
		const { gameState, inputText } = tg;

		expectReadable<GameState>(gameState, GameState.Idle);

		expect(get(gameState)).toEqual(GameState.Idle);

		inputText.set('H'); // First character starts the game
		expect(get(gameState)).toEqual(GameState.Started);

		inputText.set('He');
		expect(get(gameState)).toEqual(GameState.Started); // A second character shouldn't affect gameState

		inputText.set('Hello World!'); // Finish text
		expect(get(gameState)).toEqual(GameState.Finished); // Game ends when all characters entered

		inputText.set(''); // Remove all input
		expect(get(gameState)).toEqual(GameState.Finished); // Changes to input should be ignored once the game ended

		inputText.set('Hey'); // Set to some text
		expect(get(gameState)).toEqual(GameState.Finished); // Changes to input should be ignored once the game ended

		tg.reset();

		expect(get(gameState)).toEqual(GameState.Idle); // gameState should go back to idle on reset
	});

	// Here we test two stores at once, because "mistakes" is just the length of mistakePositions
	test('using mistakePositions and mistakes stores', () => {
		const tg = new TypingGame('Hello World!');
		const { mistakePositions, mistakes } = tg;

		expectReadable<number[]>(mistakePositions, expect.arrayContaining([]));
		expectReadable<number>(mistakes, 0);

		expect(get(mistakePositions)).toEqual(expect.arrayContaining([]));
		expect(get(mistakes)).toEqual(0);
		tg.insert('H');
		tg.insert('i'); // Wrong character
		expect(get(mistakePositions)).toEqual(expect.arrayContaining([ 1 ])); // Contains mistake
		expect(get(mistakes)).toEqual(1); // One mistake
		tg.backspace(); // Remove wrong character
		tg.insert('e'); // Insert right character
		tg.insert('l');
		expect(get(mistakePositions)).toEqual(expect.arrayContaining([ 1 ])); // Shouldn't change
		expect(get(mistakes)).toEqual(1); // Still one mistake
		tg.insert('o'); // Wrong character
		expect(get(mistakePositions)).toEqual(expect.arrayContaining([ 1, 3 ])); // Another mistake
		expect(get(mistakes)).toEqual(2); // Two mistakes
		tg.insert('k'); // Wrong character
		expect(get(mistakePositions)).toEqual(expect.arrayContaining([ 1, 3, 4 ])); // ANOTHER mistake
		expect(get(mistakes)).toEqual(3); // Three mistakes
		tg.backspace(); // Remove k
		tg.backspace(); // Remove o
		for (let char of text.substr(3)) {
			tg.insert(char); // Insert remaining characters
		}
		expect(get(mistakePositions)).toEqual(expect.arrayContaining([ 1, 3, 4 ])); // Should be the same mistakes at the end
		expect(get(mistakes)).toEqual(3); // Still three mistakes
		tg.insert('r'); // Insert wrong character, even though we're at the end
		expect(get(mistakePositions)).toEqual(expect.arrayContaining([ 1, 3, 4 ])); // Inserting wrong characters at the end shouldn't affect mistakePositions
		expect(get(mistakes)).toEqual(3); // Still three mistakes
	});

	test('correctedMistakePositions contains all corrected mistake positions', () => {
		const tg = new TypingGame({
			text: 'Hello World!',
		});
		const { correctedMistakePositions } = tg.getStores();

		expectReadable<number[]>(correctedMistakePositions, expect.arrayContaining([]));

		expect(get(correctedMistakePositions)).toEqual(expect.arrayContaining([]));
		tg.insert('H');
		tg.insert('i'); // Wrong character
		expect(get(correctedMistakePositions)).toEqual(expect.arrayContaining([]));
		tg.backspace(); // Remove wrong character
		tg.insert('e'); // Insert right character
		expect(get(correctedMistakePositions)).toEqual(expect.arrayContaining([ 1 ]));
		tg.backspace(); // Remove right character again
		expect(get(correctedMistakePositions)).toEqual(expect.arrayContaining([ 1 ]));
		tg.insert('e'); // Insert right character again
		expect(get(correctedMistakePositions)).toEqual(expect.arrayContaining([ 1 ]));
		tg.insert('l');
		tg.insert('o'); // Wrong character
		expect(get(correctedMistakePositions)).toEqual(expect.arrayContaining([ 1 ]));
		tg.backspace(); // Remove wrong character
		tg.insert('l'); // Insert right character
		expect(get(correctedMistakePositions)).toEqual(expect.arrayContaining([ 1, 3 ]));
	});

	test('totalTypedCharacters contains the amount of typed characters', () => {
		const text = 'Hello World!';
		const tg = new TypingGame({
			text,
		});
		const { totalTypedCharacters } = tg.getStores();

		expectReadable<number>(totalTypedCharacters, 0);

		expect(get(totalTypedCharacters)).toEqual(0);
		tg.insert('H');
		expect(get(totalTypedCharacters)).toEqual(1);
		tg.insert('e');
		expect(get(totalTypedCharacters)).toEqual(2);
		tg.insert('f'); // Wrong character
		expect(get(totalTypedCharacters)).toEqual(3); // Wrong character should also increase totalTypedCharacters
		tg.insert(' '); // Space
		expect(get(totalTypedCharacters)).toEqual(4); // Space should also increase typeCharacters
		tg.backspace(); // Remove space
		tg.backspace(); // Remove wrong character
		expect(get(totalTypedCharacters)).toEqual(4); // Removing characters shouldn't affect totalTypedCharacters
		tg.insert('l');
		tg.insert('l');
		expect(get(totalTypedCharacters)).toEqual(6);
		for (let char of text.substr(4)) {
			tg.insert(char); // Insert the rest of the characters
		}
		expect(get(totalTypedCharacters)).toEqual(14); // At the end it should be 14 characters
		tg.insert('s'); // Insert character, even though we're finished
		expect(get(totalTypedCharacters)).toEqual(14); // Inserting character after game was finished shouldn't affect totalTypedCharacters
		tg.backspace(); // Remove last character
		expect(get(totalTypedCharacters)).toEqual(14); // Removing the last character shouldn't affect totalTypedCharacters
	});

	test('startTime contains the time when user started typing', async () => {
		const tg = new TypingGame({
			text: 'Hello World!',
		});
		const { startTime } = tg.getStores();

		expectReadable<number | null>(startTime, null);

		expect(get(startTime)).toBeNull();
		const firstCharTimeStart = Date.now(); // Store time before inserting first character
		tg.insert('H'); // Insert first character
		const firstCharTimeEnd = Date.now(); // Store time after inserting first character
		expect(get(startTime)).toBeGreaterThanOrEqual(firstCharTimeStart);
		expect(get(startTime)).toBeLessThanOrEqual(firstCharTimeEnd);
		tg.insert('e'); // Insert second character
		await wait(100); // Wait a bit
		tg.insert('l'); // Insert third character
		expect(get(startTime)).toBeGreaterThanOrEqual(firstCharTimeStart); // Insert more characters shouldn't affect startTime
		expect(get(startTime)).toBeLessThanOrEqual(firstCharTimeEnd);
	});

	test('endTime contains the time when user finished typing', async () => {
		const text = 'Hello World!';
		const tg = new TypingGame({
			text,
		});
		const { endTime } = tg.getStores();

		expectReadable<number | null>(endTime, null);

		expect(get(endTime)).toBeNull();
		tg.insert('H'); // Insert first character
		expect(get(endTime)).toBeNull(); // Inserting the first character shouldn't affect endTime
		for (let char of text.slice(1, -1)) {
			tg.insert(char); // Insert the rest of the characters, but not the last one
			await wait(10); // Wait a little bit
		}
		expect(get(endTime)).toBeNull(); // User didn't finished typing yet
		const lastCharTimeStart = Date.now(); // Store time before inserting last character
		tg.insert('!'); // Insert last character
		const lastCharTimeEnd = Date.now(); // Store time after inserting last character
		expect(get(endTime)).toBeGreaterThanOrEqual(lastCharTimeStart);
		expect(get(endTime)).toBeLessThanOrEqual(lastCharTimeEnd);
	});

	test('cursorPosition contains the current cursor position', () => {
		const text = 'Hello World!';
		const tg = new TypingGame({
			text,
		});
		const { cursorPosition } = tg.getStores();

		expectReadable<number>(cursorPosition, 0);

		expect(get(cursorPosition)).toEqual(0);
		tg.backspace(); // These shouldn't affect cursorPosition
		tg.backspace();
		tg.backspace();
		expect(get(cursorPosition)).toEqual(0); // Can't do backspace if cursor is at beginning
		tg.insert('H'); // Insert first character
		expect(get(cursorPosition)).toEqual(1); // Cursor should have move forward
		tg.insert('e'); // Insert second character
		expect(get(cursorPosition)).toEqual(2); // Cursor should have moved forward again
		tg.insert('y'); // Wrong character
		expect(get(cursorPosition)).toEqual(3); // Wrong characters should still move the cursor forward
		tg.backspace(); // Remove wrong character
		expect(get(cursorPosition)).toEqual(2); // Using backspace should move the character backwards
		tg.backspace(); // Remove remaining characters
		tg.backspace();
		tg.backspace(); // One extra just for fun
		expect(get(cursorPosition)).toEqual(0);
		let pos = 0; // Keeps track of cursor position
		for (let char of text) {
			tg.insert(char); // Insert all characters
			pos++;
			expect(get(cursorPosition)).toEqual(pos); // Test position for each character
		}
		expect(get(cursorPosition)).toEqual(text.length);
		tg.insert('s'); // Insert an extra character at the end
		expect(get(cursorPosition)).toEqual(text.length); // Cursor shouldn't move forward when it has reached the end
		tg.backspace(); // Remove extra character
		expect(get(cursorPosition)).toEqual(text.length);
	});

	test('cursorCharacter contains the character at cursor position', () => {
		const text = 'Hello World!';
		const tg = new TypingGame({
			text,
		});
		const { cursorCharacter } = tg.getStores();

		expectReadable<string>(cursorCharacter, 'H');

		expect(get(cursorCharacter)).toEqual('H');
		tg.insert('H'); // Insert first character
		expect(get(cursorCharacter)).toEqual('e'); // Should be the second character
		tg.insert('e'); // Insert second character
		expect(get(cursorCharacter)).toEqual('l'); // Should be the third character
		tg.insert('y'); // Insert wrong character
		expect(get(cursorCharacter)).toEqual('l'); // Should be the fourth character, unaffected by the wrong input
		tg.insert('!'); // Insert another wrong character
		expect(get(cursorCharacter)).toEqual('o'); // Should be the fifth character, again, unaffected by the wrong input
		tg.backspace(); // Remove !
		expect(get(cursorCharacter)).toEqual('l'); // Should be back to the fourth character
		tg.backspace(); // Remove y
		expect(get(cursorCharacter)).toEqual('l'); // Should be back to the third character
		tg.backspace(); // Remove e
		expect(get(cursorCharacter)).toEqual('e'); // Should be back to the second character
		let pos = 1; // Keeps track of character position
		for (let char of text.substr(1)) {
			tg.insert(char); // Insert the remaining characters
			pos++;
			expect(get(cursorCharacter)).toEqual(text[pos]); // Check each character
		}
		expect(get(cursorCharacter)).toBeUndefined(); // Cursor character will be undefined at the end
		tg.insert('!'); // Insert character, although we're at the end
		expect(get(cursorCharacter)).toBeUndefined(); // Cursor character shouldn't be affected
		tg.backspace(); // Remove last character, although we're at the end
		expect(get(cursorCharacter)).toBeUndefined(); // Cursor character shouldn't be affected
	});

	test('it correctly provides a readable cps store', () => {
		const tg = new TypingGame();
		const { cps } = tg.getStores();

		expectReadable<number>(cps, 0);
	});

	test('it correctly provides a readable wpm store', () => {
		const tg = new TypingGame();
		const { wpm } = tg.getStores();

		expectReadable<number>(wpm, 0);
	});

	test('it correctly provides a readable accuracy store', () => {
		const tg = new TypingGame();
		const { accuracy } = tg.getStores();

		expectReadable<number>(accuracy, 0);
	});

});
