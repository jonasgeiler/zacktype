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
		const text = 'hey';
		const tg = new TypingGame({
			text,
		});
		const { characterStates } = tg.getStores();

		// Shorthands
		const none = TypingGame.CharacterState.None;
		const correct = TypingGame.CharacterState.Correct;
		const wrong = TypingGame.CharacterState.Incorrect;

		testReadableStore<TypingGame.CharacterState[]>(
			characterStates, expect.arrayContaining([ none, none, none ]),
		);

		expect(characterStates.get().length).toEqual(text.length);
		expect(characterStates.get()).toEqual(expect.arrayContaining([ none, none, none ]));
		tg.backspace(); // These do nothing
		tg.backspace();
		expect(characterStates.get()).toEqual(expect.arrayContaining([ none, none, none ])); // Shouldn't be affected
		tg.insert('h'); // Insert first character
		expect(characterStates.get()).toEqual(expect.arrayContaining([ correct, none, none ]));
		tg.insert('i'); // Insert wrong character
		expect(characterStates.get()).toEqual(expect.arrayContaining([ correct, wrong, none ]));
		tg.backspace(); // Remove wrong character
		expect(characterStates.get()).toEqual(expect.arrayContaining([ correct, none, none ]));
		tg.insert('e'); // Insert second character
		expect(characterStates.get()).toEqual(expect.arrayContaining([ correct, correct, none ]));
		tg.insert('y'); // Insert last character
		expect(characterStates.get()).toEqual(expect.arrayContaining([ correct, correct, correct ])); // All should be correct at the end
		tg.insert('!'); // Insert character, although we're at the end
		expect(characterStates.get()).toEqual(expect.arrayContaining([ correct, correct, correct ])); // Inserting a character at the end shouldn't affect characterStates
		tg.backspace(); // Remove last character, although we're at the end
		expect(characterStates.get()).toEqual(expect.arrayContaining([ correct, correct, correct ])); // Removing a character at the end shouldn't affect characterStates
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

	// Here we test two stores at once, because "mistakes" is just the length of mistakePositions
	test('mistakePositions contains all mistake positions and mistakes contains the amount of those mistakes', () => {
		const text = 'Hello World!';
		const tg = new TypingGame({
			text,
		});
		const { mistakePositions, mistakes } = tg.getStores();

		testReadableStore<number[]>(mistakePositions, expect.arrayContaining([]));
		testReadableStore<number>(mistakes, 0);

		expect(mistakePositions.get()).toEqual(expect.arrayContaining([]));
		expect(mistakes.get()).toEqual(0);
		tg.insert('H');
		tg.insert('i'); // Wrong character
		expect(mistakePositions.get()).toEqual(expect.arrayContaining([ 1 ])); // Contains mistake
		expect(mistakes.get()).toEqual(1); // One mistake
		tg.backspace(); // Remove wrong character
		tg.insert('e'); // Insert right character
		tg.insert('l');
		expect(mistakePositions.get()).toEqual(expect.arrayContaining([ 1 ])); // Shouldn't change
		expect(mistakes.get()).toEqual(1); // Still one mistake
		tg.insert('o'); // Wrong character
		expect(mistakePositions.get()).toEqual(expect.arrayContaining([ 1, 3 ])); // Another mistake
		expect(mistakes.get()).toEqual(2); // Two mistakes
		tg.insert('k'); // Wrong character
		expect(mistakePositions.get()).toEqual(expect.arrayContaining([ 1, 3, 4 ])); // ANOTHER mistake
		expect(mistakes.get()).toEqual(3); // Three mistakes
		tg.backspace(); // Remove k
		tg.backspace(); // Remove o
		for (let char of text.substr(3)) {
			tg.insert(char); // Insert remaining characters
		}
		expect(mistakePositions.get()).toEqual(expect.arrayContaining([ 1, 3, 4 ])); // Should be the same mistakes at the end
		expect(mistakes.get()).toEqual(3); // Still three mistakes
		tg.insert('r'); // Insert wrong character, even though we're at the end
		expect(mistakePositions.get()).toEqual(expect.arrayContaining([ 1, 3, 4 ])); // Inserting wrong characters at the end shouldn't affect mistakePositions
		expect(mistakes.get()).toEqual(3); // Still three mistakes
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
		const firstCharTimeStart = Date.now(); // Store time before inserting first character
		tg.insert('H'); // Insert first character
		const firstCharTimeEnd = Date.now(); // Store time after inserting first character
		expect(startTime.get()).toBeGreaterThanOrEqual(firstCharTimeStart);
		expect(startTime.get()).toBeLessThanOrEqual(firstCharTimeEnd);
		tg.insert('e'); // Insert second character
		await wait(100); // Wait a bit
		tg.insert('l'); // Insert third character
		expect(startTime.get()).toBeGreaterThanOrEqual(firstCharTimeStart); // Insert more characters shouldn't affect startTime
		expect(startTime.get()).toBeLessThanOrEqual(firstCharTimeEnd);
	});

	test('endTime contains the time when user finished typing', async () => {
		const text = 'Hello World!';
		const tg = new TypingGame({
			text,
		});
		const { endTime } = tg.getStores();

		testReadableStore<number | null>(endTime, null);

		expect(endTime.get()).toBeNull();
		tg.insert('H'); // Insert first character
		expect(endTime.get()).toBeNull(); // Inserting the first character shouldn't affect endTime
		for (let char of text.slice(1, -1)) {
			tg.insert(char); // Insert the rest of the characters, but not the last one
			await wait(10); // Wait a little bit
		}
		expect(endTime.get()).toBeNull(); // User didn't finished typing yet
		const lastCharTimeStart = Date.now(); // Store time before inserting last character
		tg.insert('!'); // Insert last character
		const lastCharTimeEnd = Date.now(); // Store time after inserting last character
		expect(endTime.get()).toBeGreaterThanOrEqual(lastCharTimeStart);
		expect(endTime.get()).toBeLessThanOrEqual(lastCharTimeEnd);
	});

	test('cursorPosition contains the current cursor position', () => {
		const text = 'Hello World!';
		const tg = new TypingGame({
			text,
		});
		const { cursorPosition } = tg.getStores();

		testReadableStore<number>(cursorPosition, 0);

		expect(cursorPosition.get()).toEqual(0);
		tg.backspace(); // These shouldn't affect cursorPosition
		tg.backspace();
		tg.backspace();
		expect(cursorPosition.get()).toEqual(0); // Can't do backspace if cursor is at beginning
		tg.insert('H'); // Insert first character
		expect(cursorPosition.get()).toEqual(1); // Cursor should have move forward
		tg.insert('e'); // Insert second character
		expect(cursorPosition.get()).toEqual(2); // Cursor should have moved forward again
		tg.insert('y'); // Wrong character
		expect(cursorPosition.get()).toEqual(3); // Wrong characters should still move the cursor forward
		tg.backspace(); // Remove wrong character
		expect(cursorPosition.get()).toEqual(2); // Using backspace should move the character backwards
		tg.backspace(); // Remove remaining characters
		tg.backspace();
		tg.backspace(); // One extra just for fun
		expect(cursorPosition.get()).toEqual(0);
		let pos = 0; // Keeps track of cursor position
		for (let char of text) {
			tg.insert(char); // Insert all characters
			pos++;
			expect(cursorPosition.get()).toEqual(pos); // Test position for each character
		}
		expect(cursorPosition.get()).toEqual(text.length);
		tg.insert('s'); // Insert an extra character at the end
		expect(cursorPosition.get()).toEqual(text.length); // Cursor shouldn't move forward when it has reached the end
		tg.backspace(); // Remove extra character
		expect(cursorPosition.get()).toEqual(text.length);
	});

	test('cursorCharacter contains the character at cursor position', () => {
		const text = 'Hello World!';
		const tg = new TypingGame({
			text,
		});
		const { cursorCharacter } = tg.getStores();

		testReadableStore<string>(cursorCharacter, 'H');

		expect(cursorCharacter.get()).toEqual('H');
		tg.insert('H'); // Insert first character
		expect(cursorCharacter.get()).toEqual('e'); // Should be the second character
		tg.insert('e'); // Insert second character
		expect(cursorCharacter.get()).toEqual('l'); // Should be the third character
		tg.insert('y'); // Insert wrong character
		expect(cursorCharacter.get()).toEqual('l'); // Should be the fourth character, unaffected by the wrong input
		tg.insert('!'); // Insert another wrong character
		expect(cursorCharacter.get()).toEqual('o'); // Should be the fifth character, again, unaffected by the wrong input
		tg.backspace(); // Remove !
		expect(cursorCharacter.get()).toEqual('l'); // Should be back to the fourth character
		tg.backspace(); // Remove y
		expect(cursorCharacter.get()).toEqual('l'); // Should be back to the third character
		tg.backspace(); // Remove e
		expect(cursorCharacter.get()).toEqual('e'); // Should be back to the second character
		let pos = 1; // Keeps track of character position
		for (let char of text.substr(1)) {
			tg.insert(char); // Insert the remaining characters
			pos++;
			expect(cursorCharacter.get()).toEqual(text[pos]); // Check each character
		}
		expect(cursorCharacter.get()).toBeUndefined(); // Cursor character will be undefined at the end
		tg.insert('!'); // Insert character, although we're at the end
		expect(cursorCharacter.get()).toBeUndefined(); // Cursor character shouldn't be affected
		tg.backspace(); // Remove last character, although we're at the end
		expect(cursorCharacter.get()).toBeUndefined(); // Cursor character shouldn't be affected
	});

	test('it correctly provides a readable cps store', () => {
		const tg = new TypingGame();
		const { cps } = tg.getStores();

		testReadableStore<number>(cps, 0);
	});

	test('it correctly provides a readable wpm store', () => {
		const tg = new TypingGame();
		const { wpm } = tg.getStores();

		testReadableStore<number>(wpm, 0);
	});

	test('it correctly provides a readable accuracy store', () => {
		const tg = new TypingGame();
		const { accuracy } = tg.getStores();

		testReadableStore<number>(accuracy, 0);
	});

});
