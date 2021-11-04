import { CharacterState, GameState, TypingGame } from '$lib/TypingGame';
import { get } from 'svelte/store';
import type { Readable, Writable } from 'svelte/store';

/** Shorthand for getting store value */
const $ = get;

/**
 * Expect store to be a readable store, with optionally a specific value.
 * @param store
 * @param expectValue
 */
function expectReadable<T extends any>(store: Readable<T>, expectValue?: T) {
	expect(store).toHaveProperty('subscribe');
	expect(store).not.toHaveProperty('set');
	expect(store).not.toHaveProperty('update');

	const subscriber = jest.fn();
	store.subscribe(subscriber);

	expect(subscriber).toHaveBeenCalled();

	if (expectValue !== undefined) {
		expect($(store)).toEqual(expectValue);
		expect(subscriber).toHaveBeenCalledWith(expectValue);
	}
}

/**
 * Expect store to be a readable store, with optionally a specific value.
 * @param store
 * @param expectValue
 */
function expectWritable<T extends any>(store: Writable<T>, expectValue?: T) {
	expect(store).toHaveProperty('subscribe');
	expect(store).toHaveProperty('set');
	expect(store).toHaveProperty('update');

	const subscriber = jest.fn();
	store.subscribe(subscriber);

	expect(subscriber).toHaveBeenCalled();
	if (expectValue !== undefined) expect(subscriber).toHaveBeenCalledWith(expectValue);
}

/**
 * Wait for `ms` milliseconds.
 * @param ms
 */
function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

test('initiating without parameters', () => {
	const tg = new TypingGame();
	const { text } = tg;

	expectReadable<string>(text);

	// Text should be generated with the default minimum length
	expect($(text)).toEqual(expect.any(String));
	expect($(text).length).toBeGreaterThan(0);
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

	// Text should be generated with the specified minimum length
	expect($(text)).toEqual(expect.any(String));
	expect($(text).length).toBeGreaterThanOrEqual(500);
});

test('inputText store', () => {
	const tg = new TypingGame('Hello World!');
	const { inputText } = tg;

	expectWritable<string>(inputText, '');

	inputText.set('Hey');
	expect($(inputText)).toEqual('Hey');

	inputText.set('Hello');
	expect($(inputText)).toEqual('Hello');

	tg.reset();

	expect($(inputText)).toEqual(''); // Should be empty again after reset
});

test('characterStates store', () => {
	const tg = new TypingGame('hey');
	const { characterStates, inputText } = tg;

	// Shorthands
	const none = CharacterState.None;
	const correct = CharacterState.Correct;
	const incorrect = CharacterState.Incorrect;

	expectReadable<CharacterState[]>(characterStates, [ none, none, none ]);

	inputText.set(''); // Set inputText to empty string
	expect($(characterStates)).toEqual([ none, none, none ]); // Shouldn't be changed

	inputText.set('h'); // Insert first character
	expect($(characterStates)).toEqual([ correct, none, none ]);

	inputText.set('hi'); // Insert wrong character
	expect($(characterStates)).toEqual([ correct, incorrect, none ]);

	inputText.set('h'); // Remove wrong character
	expect($(characterStates)).toEqual([ correct, none, none ]);

	inputText.set('he'); // Insert second character
	expect($(characterStates)).toEqual([ correct, correct, none ]);

	inputText.set('hey'); // Insert last character, so game ends
	expect($(characterStates)).toEqual([ correct, correct, correct ]); // All should be correct at the end

	inputText.set('hey!'); // Insert character, although the game ended
	expect($(characterStates)).toEqual([ correct, correct, correct ]); // Inserting a character when the game ended should be ignored

	inputText.set('hey'); // Remove last character, although the game ended
	expect($(characterStates)).toEqual([ correct, correct, correct ]); // Removing a character when the game ended should be ignored

	tg.reset();

	expect($(characterStates)).toEqual([ none, none, none ]); // Should have been reset
});

test('gameState store', () => {
	const tg = new TypingGame('Hello World!');
	const { gameState, inputText } = tg;

	expectReadable<GameState>(gameState, GameState.Idle);

	expect($(gameState)).toEqual(GameState.Idle);

	inputText.set('H'); // First character starts the game
	expect($(gameState)).toEqual(GameState.Started);

	inputText.set('He');
	expect($(gameState)).toEqual(GameState.Started); // A second character shouldn't affect gameState

	inputText.set('Hello World!'); // Finish text
	expect($(gameState)).toEqual(GameState.Finished); // Game ends when all characters entered

	inputText.set(''); // Remove all input
	expect($(gameState)).toEqual(GameState.Finished); // Changes to input should be ignored once the game ended

	inputText.set('Hey'); // Set to some text
	expect($(gameState)).toEqual(GameState.Finished); // Changes to input should be ignored once the game ended

	tg.reset();

	expect($(gameState)).toEqual(GameState.Idle); // gameState should go back to idle after reset
});

// Here we test two stores at once, because "mistakes" is just the length of mistakePositions
test('mistakePositions store and mistakes store', () => {
	const tg = new TypingGame('Hello World!');
	const { mistakePositions, mistakes, inputText } = tg;

	expectReadable<number[]>(mistakePositions, []);
	expectReadable<number>(mistakes, 0);

	inputText.set('Hi'); // Insert wrong character
	expect($(mistakePositions)).toEqual([ 1 ]); // Contains first mistake
	expect($(mistakes)).toEqual(1); // One mistake

	inputText.set('He'); // Replace with right character
	expect($(mistakePositions)).toEqual([ 1 ]); // Shouldn't change
	expect($(mistakes)).toEqual(1); // Still one mistake

	inputText.set('Hey'); // Insert another wrong character
	expect($(mistakePositions)).toEqual([ 1, 2 ]); // Contains all mistakes
	expect($(mistakes)).toEqual(2); // Two mistakes

	inputText.set('Hey!'); // Insert another mistake
	expect($(mistakePositions)).toEqual([ 1, 2, 3 ]); // Contains all mistakes
	expect($(mistakes)).toEqual(3); // Three mistakes

	inputText.set('Hello World!'); // Finish typing
	expect($(mistakePositions)).toEqual([ 1, 2, 3 ]); // Should be the same mistakes at the end
	expect($(mistakes)).toEqual(3); // Still three mistakes

	inputText.set('Hello World?'); // Replace last character with a wrong character, even though the game ended
	expect($(mistakePositions)).toEqual([ 1, 2, 3 ]); // Updating inputText when the game ended should be ignored
	expect($(mistakes)).toEqual(3); // Still three mistakes

	tg.reset();

	expect($(mistakePositions)).toEqual([]); // Should be empty after reset
	expect($(mistakes)).toEqual(0); // Should be zero after reset
});

test('correctedMistakePositions store', () => {
	const tg = new TypingGame('Hello World!');
	const { correctedMistakePositions, inputText } = tg;

	expectReadable<number[]>(correctedMistakePositions, []);

	inputText.set('Hi'); // Insert wrong character
	expect($(correctedMistakePositions)).toEqual([]); // Should not contain anything (yet)

	inputText.set('He'); // Replace with right character
	expect($(correctedMistakePositions)).toEqual([ 1 ]); // Should contain the corrected character position

	inputText.set('H'); // Remove right character again
	expect($(correctedMistakePositions)).toEqual([ 1 ]); // Should still contain the corrected character position

	inputText.set('He'); // Add right character again
	expect($(correctedMistakePositions)).toEqual([ 1 ]); // Shouldn't be affected

	inputText.set('Helo'); // Insert another wrong character
	expect($(correctedMistakePositions)).toEqual([ 1 ]);

	inputText.set('Hell'); // Replace with right character
	expect($(correctedMistakePositions)).toEqual([ 1, 3 ]); // Should contain the other corrected character position

	inputText.set('Hello World!'); // Finish typing
	expect($(correctedMistakePositions)).toEqual([ 1, 3 ]); // Should be the same at the end

	inputText.set('Hello World?'); // Replace last character with a wrong character, even though game ended
	expect($(correctedMistakePositions)).toEqual([ 1, 3 ]);

	inputText.set('Hello World!'); // Correct the last character again
	expect($(correctedMistakePositions)).toEqual([ 1, 3 ]); // Correcting characters should be ignored when game ended

	tg.reset();

	expect($(correctedMistakePositions)).toEqual([]); // Should be empty after reset
});

test('totalTypedCharacters store', () => {
	const tg = new TypingGame('Hello World!');
	const { totalTypedCharacters, inputText } = tg;

	expectReadable<number>(totalTypedCharacters, 0);

	inputText.set('H'); // Add first character
	expect($(totalTypedCharacters)).toEqual(1);

	inputText.set('He'); // Add second character
	expect($(totalTypedCharacters)).toEqual(2);

	inputText.set('Hey'); // Add wrong character
	expect($(totalTypedCharacters)).toEqual(3); // Wrong character should also increase totalTypedCharacters

	inputText.set('Hel'); // Immediately replace the last character
	expect($(totalTypedCharacters)).toEqual(4); // Replacing characters should also increase totalTypedCharacters

	inputText.set('Hello '); // Add multiple characters at once
	expect($(totalTypedCharacters)).toEqual(7); // All new characters should also increase totalTypedCharacters

	inputText.set('Hell'); // Remove some characters
	expect($(totalTypedCharacters)).toEqual(7); // Removing characters shouldn't affect totalTypedCharacters

	inputText.set('Hello World!'); // Finish typing
	expect($(totalTypedCharacters)).toEqual(15); // At the end it should be 14 characters

	inputText.set('Hello World!?'); // Add character, even though the game ended
	expect($(totalTypedCharacters)).toEqual(15); // Inserting character after game was finished shouldn't affect totalTypedCharacters

	tg.reset();

	expect($(totalTypedCharacters)).toEqual(0); // Should be back to zero after reset
});

test('startTime store', async () => {
	const tg = new TypingGame('Hello World!');
	const { startTime, inputText } = tg;

	expectReadable<number | null>(startTime, null);

	const firstCharTimeStart = Date.now(); // Store time before inserting first character
	inputText.set('H'); // Insert first character
	const firstCharTimeEnd = Date.now(); // Store time after inserting first character

	expect($(startTime)).toBeGreaterThanOrEqual(firstCharTimeStart);
	expect($(startTime)).toBeLessThanOrEqual(firstCharTimeEnd);

	inputText.set('He'); // Insert second character
	await wait(1000); // Wait a second

	expect($(startTime)).toBeGreaterThanOrEqual(firstCharTimeStart); // Adding more characters shouldn't affect startTime
	expect($(startTime)).toBeLessThanOrEqual(firstCharTimeEnd);

	tg.reset();

	expect($(startTime)).toBeNull(); // startTime should be null after reset
});

test('endTime store', async () => {
	const tg = new TypingGame('Hello World!');
	const { endTime, inputText } = tg;

	expectReadable<number | null>(endTime, null);

	inputText.set('H'); // Insert first character
	expect($(endTime)).toBeNull(); // Inserting the first character shouldn't affect endTime

	inputText.set('Hello World'); // Insert all characters except the last one
	expect($(endTime)).toBeNull(); // User didn't finished typing yet, so no endTime

	const lastCharTimeStart = Date.now(); // Store time before inserting last character
	inputText.set('Hello World!'); // Insert last character
	const lastCharTimeEnd = Date.now(); // Store time after inserting last character

	expect($(endTime)).toBeGreaterThanOrEqual(lastCharTimeStart);
	expect($(endTime)).toBeLessThanOrEqual(lastCharTimeEnd);

	tg.reset();

	expect($(endTime)).toBeNull(); // endTime should be null after reset
});

test('cursorPosition store', () => {
	const tg = new TypingGame('Hello World!');
	const { cursorPosition, inputText } = tg;

	expectReadable<number>(cursorPosition, 0);

	inputText.set('');
	expect($(cursorPosition)).toEqual(0); // This shouldn't affect cursorPosition

	inputText.set('H'); // Add first character
	expect($(cursorPosition)).toEqual(1); // Cursor should have move forward

	inputText.set('He'); // Add second character
	expect($(cursorPosition)).toEqual(2); // Cursor should have moved forward again

	inputText.set('Hey'); // Add wrong character
	expect($(cursorPosition)).toEqual(3); // Wrong characters should still move the cursor forward

	inputText.set('He'); // Remove wrong character
	expect($(cursorPosition)).toEqual(2); // Removing characters should move the cursor backwards

	inputText.set(''); // Reset inputText
	expect($(cursorPosition)).toEqual(0);

	inputText.set('Hello World!'); // Finish typing
	expect($(cursorPosition)).toEqual(12); // Should match the inputText length at the end

	inputText.set('Hello World'); // Remove a character, even though the game ended
	expect($(cursorPosition)).toEqual(12); // Cursor shouldn't move backwards when the game ended

	inputText.set('Hello World!?'); // Add a character, even though the game ended
	expect($(cursorPosition)).toEqual(12); // Cursor shouldn't move forward when the game ended

	tg.reset();

	expect($(cursorPosition)).toEqual(0);
});

test('cps store', async () => {
	const text = 'Hello World!';
	const tg = new TypingGame(text);
	const { cps, inputText } = tg;

	expectReadable<number>(cps, 0);

	// Type all characters
	for (let i = 0; i < text.length; i++) {
		const start = Date.now();
		inputText.set(text.substr(0, i));
		const end = Date.now();

		await wait(Math.max(100 - (end - start), 0));
	}

	expect($(cps)).toBeGreaterThanOrEqual(0);
	expect($(cps)).toBeLessThanOrEqual(50);

	tg.reset();

	expect($(cps)).toEqual(0);
});

test('wpm store', async () => {
	const text = 'Hello World!';
	const tg = new TypingGame(text);
	const { wpm, inputText } = tg;

	expectReadable<number>(wpm, 0);

	// Type all characters
	for (let i = 0; i < text.length; i++) {
		const start = Date.now();
		inputText.set(text.substr(0, i));
		const end = Date.now();

		await wait(Math.max(100 - (end - start), 0));
	}

	expect($(wpm)).toBeGreaterThanOrEqual(100);
	expect($(wpm)).toBeLessThanOrEqual(150);

	tg.reset();

	expect($(wpm)).toEqual(0);
});

test('accuracy store', () => {
	const tg = new TypingGame('hey!');
	const { accuracy, inputText } = tg;

	expectReadable<number>(accuracy, 0);

	inputText.set('he'); // Add two correct characters
	expect($(accuracy)).toEqual(100); // Accuracy should be 100%, we didn't do any mistakes yet

	inputText.set('help'); // Finish typing with two wrong characters
	expect($(accuracy)).toEqual(50); // Accuracy should be 50%, because 2 out of 4 characters are wrong

	tg.reset();

	expect($(accuracy)).toEqual(0); // Accuracy should be 0 after reset
});
