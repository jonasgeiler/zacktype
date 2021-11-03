import type { ReadableAtom, WritableAtom } from 'nanostores';
import { atom, computed } from 'nanostores';
import dictionary from './dictionary';

class TypingGame {

	/** The text used in the game */
	protected text: WritableAtom<string>;

	/** The whole text typed in by the user */
	protected inputText: WritableAtom<string>;

	/** Holds the info about all characters in the text */
	protected characterStates: WritableAtom<TypingGame.CharacterState[]>;

	/** User's characters/second score */
	protected cps: ReadableAtom<number>;

	/** User's words/minute score */
	protected wpm: ReadableAtom<number>;

	/** Accuracy of the user's typing */
	protected accuracy: ReadableAtom<number>;

	/** Amount of mistakes that the user made while typing */
	protected mistakes: ReadableAtom<number>;

	/** Positions of mistakes that user made while typing */
	protected mistakePositions: WritableAtom<number[]>;

	/** Amount of mistakes that the user made, but then corrected */
	protected correctedMistakes: WritableAtom<number>;

	/** Total amount of characters typed in by user */
	protected typedCharacters: WritableAtom<number>;

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
		protected options: TypingGame.Options = {},
	) {
		this.options.text = options.text ?? null;
		this.options.approximateTextLength = options.approximateTextLength ?? 300;
		this.options.generateUppercaseLetters = options.generateUppercaseLetters ?? true;
		this.options.generateSpecialCharacters = options.generateSpecialCharacters ?? true;

		// Init text store
		this.text = atom(this.options.text ?? this.generateText()); // Use supplied text or generate one

		// Make initial character states array
		let characterStates: TypingGame.CharacterState[] = [];
		for (let char of this.text.get()) {
			characterStates.push(TypingGame.CharacterState.None);
		}

		// Init other stores
		this.inputText = atom('');
		this.characterStates = atom(characterStates);
		this.gameState = atom(TypingGame.GameState.NotStarted);
		this.mistakePositions = atom([]);
		this.correctedMistakes = atom(0);
		this.typedCharacters = atom(0);
		this.startTime = atom(null);
		this.endTime = atom(null);
		this.cursorPosition = atom(0);

		// Init cursorCharacter store
		this.cursorCharacter = computed(
			[ this.text, this.cursorPosition ],
			($text, $cursorPosition) => $text[$cursorPosition],
		);

		// Init mistakes store
		this.mistakes = computed(
			this.mistakePositions,
			$mistakePositions => $mistakePositions.length,
		);

		// Init wpm store
		this.wpm = computed(
			[ this.typedCharacters, this.startTime, this.endTime, this.mistakePositions, this.correctedMistakes ],
			($typedCharacters, $startTime, $endTime, $mistakePositions, $correctedMistakes) => {
				if ($startTime == null || $endTime == null) return 0;

				// https://www.speedtypingonline.com/typing-equations

				const typedWords = $typedCharacters / 5; // We use 5 here, because that's the average word length in the English language and therefore commonly used to calculate WPM
				const elapsedMilliseconds = $endTime - $startTime; // Calculated elapsed milliseconds
				const elapsedSeconds = elapsedMilliseconds / 1000; // Convert milliseconds to seconds
				const elapsedMinutes = elapsedSeconds / 60; // Convert seconds to minutes
				const grossWPM = typedWords / elapsedMinutes; // Calculate gross WPM
				const uncorrectedMistakes = $mistakePositions.length - $correctedMistakes; // Calculate amount of uncorrected mistakes
				const errorRate = uncorrectedMistakes / elapsedMinutes; // Calculate error rate (errors per minute)
				const netWPM = grossWPM - errorRate; // Calculate net WPM

				return +Math.max(netWPM, 0).toFixed(1);
			},
		);

		// Init cpm store
		this.cps = computed(
			[ this.typedCharacters, this.startTime, this.endTime, this.mistakePositions, this.correctedMistakes ],
			($typedCharacters, $startTime, $endTime, $mistakePositions, $correctedMistakes) => {
				if ($startTime == null || $endTime == null) return 0;

				// https://www.speedtypingonline.com/typing-equations
				// This uses the same method but with seconds instead of minutes, and characters instead of words

				const elapsedMilliseconds = $endTime - $startTime; // Calculated elapsed milliseconds
				const elapsedSeconds = elapsedMilliseconds / 1000; // Convert milliseconds to seconds
				const grossCPS = $typedCharacters / elapsedSeconds; // Calculate gross CPS
				const uncorrectedMistakes = $mistakePositions.length - $correctedMistakes; // Calculate amount of uncorrected mistakes
				const errorRate = uncorrectedMistakes / elapsedSeconds; // Calculate error rate (errors per second)
				const netCPS = grossCPS - errorRate; // Calculate net CPS

				return +Math.max(netCPS, 0).toFixed(1);
			},
		);

		// Init accuracy store
		this.accuracy = computed(
			[ this.mistakePositions, this.typedCharacters ],
			($mistakePositions, $typedCharacters) => {
				if ($typedCharacters == 0) return 0;

				const charactersTypedWithoutMistakes = ($typedCharacters - $mistakePositions.length);

				return Math.round((charactersTypedWithoutMistakes / $typedCharacters) * 100);
			},
		);
	}

	/**
	 * Resets the whole game with new options so it can be replayed.
	 * @param options - Options to set.
	 */
	public reset(options: TypingGame.Options = {}) {
		// Use new options, if specified, or just the old ones
		this.options.text = options.text ?? this.options.text;
		this.options.approximateTextLength = options.approximateTextLength ?? this.options.approximateTextLength;
		this.options.generateUppercaseLetters = options.generateUppercaseLetters ?? this.options.generateUppercaseLetters;
		this.options.generateSpecialCharacters = options.generateSpecialCharacters ?? this.options.generateSpecialCharacters;

		// Reset text
		this.text.set(this.options.text ?? this.generateText()); // Use supplied text or generate one

		// Make initial character states array
		let characterStates: TypingGame.CharacterState[] = [];
		for (let char of this.text.get()) {
			characterStates.push(TypingGame.CharacterState.None);
		}

		// Reset other stores
		this.inputText.set('');
		this.characterStates.set(characterStates);
		this.gameState.set(TypingGame.GameState.NotStarted);
		this.mistakePositions.set([]);
		this.correctedMistakes.set(0);
		this.typedCharacters.set(0);
		this.startTime.set(null);
		this.endTime.set(null);
		this.cursorPosition.set(0);
	}

	/**
	 * This exposes all internal writable stores as readable stores for use on the frontend.
	 */
	public getStores(): TypingGame.Stores {
		// Omit the set function for each store:
		const { set: a, ...text } = this.text;
		const { set: b, ...inputText } = this.inputText;
		const { set: c, ...characterStates } = this.characterStates;
		const { set: d, ...mistakePositions } = this.mistakePositions;
		const { set: e, ...correctedMistakes } = this.correctedMistakes;
		const { set: f, ...typedCharacters } = this.typedCharacters;
		const { set: g, ...gameState } = this.gameState;
		const { set: h, ...startTime } = this.startTime;
		const { set: j, ...endTime } = this.endTime;
		const { set: k, ...cursorPosition } = this.cursorPosition;

		// Return the readable stores
		return {
			text, inputText, characterStates, mistakePositions, correctedMistakes, typedCharacters, gameState, startTime, endTime, cursorPosition,
			wpm:             this.wpm,
			cps:             this.cps,
			accuracy:        this.accuracy,
			mistakes:        this.mistakes,
			cursorCharacter: this.cursorCharacter,
		};
	}

	/**
	 * Starts the game.
	 */
	protected startGame() {
		this.startTime.set(Date.now()); // Store the time when user started typing
		this.gameState.set(TypingGame.GameState.Started); // Change game state to "started"
	}

	/**
	 * Ends the game.
	 */
	protected gameOver() {
		this.endTime.set(Date.now());
		this.gameState.set(TypingGame.GameState.Ended);
	}

	/**
	 * Called when the user removed a character with backspace.
	 */
	public backspace() {
		if (this.gameState.get() == TypingGame.GameState.Ended) return; // Don't handle keys when game already ended

		// Get current store values
		const cursorPosition = this.cursorPosition.get();
		const characterStates = this.characterStates.get();

		// If cursor is at start of text, don't do anything
		if (cursorPosition == 0) return;

		// Set previous character state to none
		characterStates[cursorPosition - 1] = TypingGame.CharacterState.None;

		this.cursorPosition.set(cursorPosition - 1); // Move cursor backwards
		this.characterStates.set(characterStates); // Update character states
		this.inputText.set(this.inputText.get().slice(0, -1)); // Remove last character from input text
	}

	/**
	 * Called when the user typed any character.
	 * @param character - The character the user typed.
	 */
	public insert(character: string) {
		if (this.gameState.get() == TypingGame.GameState.Ended) return; // Don't handle keys when game already ended
		if (this.gameState.get() == TypingGame.GameState.NotStarted) this.startGame(); // Start game when not yet started

		// Get current store values
		const characterStates = this.characterStates.get();
		const cursorPosition = this.cursorPosition.get();
		const mistakePositions = this.mistakePositions.get();

		// Check if character is correct
		if (character == this.cursorCharacter.get()) {
			// Check if a mistake was made earlier at current position
			if (mistakePositions.includes(cursorPosition)) {
				this.correctedMistakes.set(this.correctedMistakes.get() + 1); // Increase amount of corrected mistakes
			}

			characterStates[cursorPosition] = TypingGame.CharacterState.Correct; // Set current character state to correct

			this.characterStates.set(characterStates); // Update character states
		} else {
			characterStates[cursorPosition] = TypingGame.CharacterState.Incorrect; // Set current character state to incorrect
			mistakePositions.push(cursorPosition); // Add cursor position to mistake positions

			this.characterStates.set(characterStates); // Update character states
			this.mistakePositions.set(mistakePositions); // Update mistake positions
		}

		this.typedCharacters.set(this.typedCharacters.get() + 1); // Increase amount of typed characters
		this.cursorPosition.set(cursorPosition + 1); // Move cursor forward
		this.inputText.set(this.inputText.get() + character); // Append character to input text

		// Check if end of text was reached
		if (cursorPosition + 1 == this.text.get().length) {
			this.gameOver(); // End the game
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
		None,
		Correct,
		Incorrect
	}

	export enum GameState {
		NotStarted,
		Started,
		Ended
	}

	export interface Stores {
		readonly text: ReadableAtom<string>;
		readonly inputText: ReadableAtom<string>;
		readonly characterStates: ReadableAtom<CharacterState[]>;
		readonly cps: ReadableAtom<number>;
		readonly wpm: ReadableAtom<number>;
		readonly accuracy: ReadableAtom<number>;
		readonly mistakes: ReadableAtom<number>;
		readonly mistakePositions: ReadableAtom<number[]>;
		readonly correctedMistakes: ReadableAtom<number>;
		readonly typedCharacters: ReadableAtom<number>;
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
