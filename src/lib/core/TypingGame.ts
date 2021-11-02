import type { ReadableAtom, WritableAtom } from 'nanostores';
import { atom, computed } from 'nanostores';
import { Key } from 'ts-key-enum';
import dictionary from './dictionary';

class TypingGame {

	/** The text used in the game */
	protected text: WritableAtom<string>;

	/** Holds the info about all characters in the text */
	protected characterStates: WritableAtom<TypingGame.CharacterState[]>;

	/** User's characters/second score */
	protected cps: WritableAtom<number>;

	/** User's words/minute score */
	protected wpm: WritableAtom<number>;

	/** User's typing accuracy */
	protected accuracy: WritableAtom<number>;

	/** Current state of the game */
	protected gameState: WritableAtom<TypingGame.GameState>;

	/** Time the user started typing */
	protected startTime: WritableAtom<number | null>;

	/** Time the user finished typing */
	protected endTime: WritableAtom<number | null>;

	/** Position of the cursor in the text */
	protected cursorPosition: WritableAtom<number>;

	/** Holds the current character at cursor position */
	protected cursorCharacter: ReadableAtom<string>;

	constructor(
		protected options: TypingGame.Options = {
			approximateTextLength:     300,
			generateUppercaseLetters:  true,
			generateSpecialCharacters: true,
		},
	) {
		// Init text store
		this.text = atom(options.text ?? this.generateText()); // Use supplied text or generate one

		// Make initial character states array
		let characterStates: TypingGame.CharacterState[] = [];
		for (let char of this.text.get()) {
			characterStates.push(TypingGame.CharacterState.Unreached);
		}

		// Init other stores
		this.characterStates = atom(characterStates);
		this.gameState = atom(TypingGame.GameState.NotStarted);
		this.cps = atom(0);
		this.wpm = atom(0);
		this.accuracy = atom(100);
		this.startTime = atom(null);
		this.endTime = atom(null);
		this.cursorPosition = atom(0);

		// Init cursorCharacter store
		this.cursorCharacter = computed(
			[ this.text, this.cursorPosition ],
			($text, $cursorPosition) => $text[$cursorPosition],
		);
	}

	/**
	 * This exposes all internal writable stores as readable stores for use on the frontend.
	 */
	public getStores(): TypingGame.Stores {
		// Omit the set function for each store:
		const { set: a, ...text } = this.text;
		const { set: b, ...characterStates } = this.characterStates;
		const { set: c, ...cps } = this.cps;
		const { set: d, ...wpm } = this.wpm;
		const { set: e, ...accuracy } = this.accuracy;
		const { set: f, ...gameState } = this.gameState;
		const { set: g, ...startTime } = this.startTime;
		const { set: h, ...endTime } = this.endTime;
		const { set: i, ...cursorPosition } = this.cursorPosition;

		// Return the readable stores
		return {
			text, characterStates, cps, wpm, accuracy, gameState, startTime, endTime, cursorPosition,
			cursorCharacter: this.cursorCharacter
		};
	}

	/**
	 * Starts the game.
	 */
	public startGame() {
		this.startTime.set(Date.now()); // Store the time when user started typing
		this.gameState.set(TypingGame.GameState.Started); // Change game state to "started"
	}

	/**
	 * Handle key presses by the user.
	 * @param key - The key property from an `KeyboardEvent`
	 */
	public handleKey(key: Key) {
		if (this.gameState.get() == TypingGame.GameState.Ended) return; // Don't handle keys when game already ended

		// I use switch because I might add ArrowLeft and similar later on
		switch (key) {
			case Key.Backspace:
				this.removeCharacter();
				break;

			default:
				if (key.length != 1) return; // Ignore any key presses that use a key identifier longer than 1 character (so only allow "A" or "1")
				this.insertCharacter(key);
		}
	}

	protected removeCharacter() {

	}

	protected insertCharacter(character: string) {
		if (this.gameState.get() == TypingGame.GameState.NotStarted) this.startGame(); // Start game when first character was entered

		if (character == this.text[this.cursorPosition.get()]) {

		}
	}

	/**
	 * Generates a random paragraph of text.
	 */
	protected generateText(): string {
		const { approximateTextLength, generateUppercaseLetters, generateSpecialCharacters } = this.options;

		let sentences = [];
		do {
			const wordsInSentence = this.randomInteger(10, 20); // 10 to 20 is the average sentence length in the English language

			const hasComma = generateSpecialCharacters && this.randomInteger(0, 5) == 0; // Small chance that the word contains a comma
			const hasHyphen = generateSpecialCharacters && !hasComma && this.randomInteger(0, 100) == 0; // Very small chance that the word contains a hyphen, but only if there's no comma already

			const extraPunctuationPosition = this.randomInteger(wordsInSentence * 0.25, wordsInSentence * 0.75); // Put the comma/hyphen somewhere between the second- and third quarter of the sentence

			let words = [];
			for (let i = 0; i < wordsInSentence; i++) {
				let word = dictionary[this.randomInteger(0, dictionary.length - 1)];

				if (generateUppercaseLetters) {
					const makeUppercase = this.randomInteger(0, 200) == 0; // Very, very small chance that the whole word is uppercase

					if (makeUppercase) {
						word = word.toUpperCase(); // Make the whole word uppercase
					} else {
						const makeFirstLetterUppercase = (i == 0) || this.randomInteger(0, 50) == 0; // Always make the first letter uppercase, and add a rather small chance that it is uppercase, no matter the position

						if (makeFirstLetterUppercase) {
							word = word[0].toUpperCase() + word.substr(1); // Make the first letter uppercase
						}
					}
				}

				if (hasComma && i == extraPunctuationPosition) {
					word += ','; // Add comma to end of word
				}

				words.push(word);

				if (hasHyphen && i == extraPunctuationPosition) {
					words.push('-'); // Add hyphen as its own "word"
				}
			}

			let sentence = words.join(' ');

			if (generateSpecialCharacters) {
				const punctuationChance = this.randomInteger(0, 10);

				if (punctuationChance <= 5) {
					sentence += '.';
				} else if (punctuationChance <= 7) {
					sentence += '?';
				} else {
					sentence += '!';
				}
			}

			sentences.push(sentence);
		} while (sentences.join(' ').length < approximateTextLength);

		return sentences.join(' ');
	}

	protected randomInteger(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

}

namespace TypingGame {

	export enum CharacterState {
		Unreached,
		Correct,
		Incorrect
	}

	export enum GameState {
		NotStarted,
		Started,
		Ended
	}

	export interface Stores {
		readonly text: ReadableAtom<string>
		readonly characterStates: ReadableAtom<CharacterState[]>;
		readonly cps: ReadableAtom<number>;
		readonly wpm: ReadableAtom<number>;
		readonly accuracy: ReadableAtom<number>;
		readonly gameState: ReadableAtom<GameState>;
		readonly startTime: ReadableAtom<number | null>;
		readonly endTime: ReadableAtom<number | null>;
		readonly cursorPosition: ReadableAtom<number>;
		readonly cursorCharacter: ReadableAtom<string>;
	}

	export interface Options {
		/**
		 * Supply your own text instead of generating one.
		 */
		text?: string;

		/**
		 * When generating text, how long it should be approximately.
		 * Please note that this value is very inaccurate and the text can be much longer!
		 */
		approximateTextLength?: number;

		/**
		 * When generating text, if the text should contain uppercase characters.
		 */
		generateUppercaseLetters?: boolean;

		/**
		 * When generating text, whether the text should contain special characters like punctuation.
		 */
		generateSpecialCharacters?: boolean;
	}

}

export default TypingGame;
