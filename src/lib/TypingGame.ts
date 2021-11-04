import { Utils } from '$lib/Utils';
import type { Readable, Writable } from 'svelte/store';
import { derived, writable } from 'svelte/store';
import { TextGenerator } from './TextGenerator';

/** State of a character */
export enum CharacterState {
	None,
	Correct,
	Incorrect
}

/** State of the game */
export enum GameState {
	Idle,
	Started,
	Finished
}

/**
 * Handles game logic and stores.
 * NOTE: I don't actually need to use a class, but it helps with testing because we can create multiple independent instances.
 */
export class TypingGame {

	/** The text used in the game */
	public readonly text: Readable<string>;

	/** Current user input */
	public readonly inputText: Writable<string>;

	/** Holds the current state of all characters in the text */
	public readonly characterStates: Readable<CharacterState[]>;

	/** Current state of the game */
	public readonly gameState: Readable<GameState>;

	/** Position of the cursor in the text */
	public readonly cursorPosition: Readable<number>;

	/** Positions of mistakes that the user made while typing */
	public readonly mistakePositions: Readable<number[]>;

	/** Positions of mistakes that the user corrected */
	public readonly correctedMistakePositions: Readable<number[]>;

	/** Total amount of characters typed in by user (not including backspaces) */
	public readonly totalTypedCharacters: Readable<number>;

	/** Time the user started typing */
	public readonly startTime: Readable<number | null>;

	/** Time the user finished typing */
	public readonly endTime: Readable<number | null>;

	/** User's words/minute score */
	public readonly wpm: Readable<number>;

	/** User's characters/second score */
	public readonly cps: Readable<number>;

	/** Amount of mistakes that the user made while typing */
	public readonly mistakes: Readable<number>;

	/** Accuracy of the user's typing */
	public readonly accuracy: Readable<number>;

	/**
	 * Resets the game.
	 * @param _textOrMinLength - Same as the constructor parameter: Either a string to use as text, or a number to use as minimum length for the randomly generated text
	 */
	public readonly reset: (_textOrMinLength?: (string | number)) => void;

	/**
	 * Constructor.
	 * @param textOrMinLength - Either a string to use as text, or a number to use as minimum length for the randomly generated text
	 */
	constructor(textOrMinLength: (string | number) = 300) {

		/** Whether changes to inputText should be ignored */
		let inputDisabled = false;


		// Init text store with a randomly generated text or using the specified one
		const text = writable(
			typeof textOrMinLength === 'string'
			? textOrMinLength
			: TextGenerator.generateText(textOrMinLength),
		);

		// Init inputText store with an empty string
		const inputText = writable('');

		// Init characterStates store, a derived store which loops through text and compares each character with inputText and determines each character's state
		const characterStates = derived(
			[ text, inputText ],
			([ $text, $inputText ], set) => {
				if (inputDisabled) return;

				let characterStates: CharacterState[] = new Array($text.length); // Init an empty array with the same length as the text

				// Loop through text indices
				for (let i = 0; i < $text.length; i++) {
					if (i >= $inputText.length) {
						characterStates[i] = CharacterState.None; // If index exceeds inputText length, the user hasn't entered the character yet
					} else if ($inputText[i] === $text[i]) {
						characterStates[i] = CharacterState.Correct; // If the character at the index is the same in inputText and text then it's considered as correct
					} else {
						characterStates[i] = CharacterState.Incorrect; // Otherwise the character is considered as incorrect
					}
				}

				set(characterStates);
			},
			[],
		);

		// Init gameState store, a derived store which compares text and inputText to determine current game state
		const gameState = derived(
			[ text, inputText ],
			([ $text, $inputText ], set) => {
				if (inputDisabled) return;

				if ($inputText.length >= $text.length) {
					set(GameState.Finished); // If inputText has the same length as text the user finished typing
				} else if ($inputText.length > 0) {
					set(GameState.Started); // If inputText has content the user started typing
				} else {
					set(GameState.Idle); // Otherwise the game hasn't yet started and is doing nothing
				}
			},
			GameState.Idle,
		);

		// Init cursorPosition store, a derived store calculated from inputText length
		const cursorPosition = derived(
			inputText,
			($inputText, set) => {
				if (inputDisabled) return;

				set($inputText.length); // Cursor position is always the last position of the inputText
			},
			0,
		);

		// Init mistakePositions store with an empty array
		const mistakePositions = writable<number[]>([]);

		// Init correctedMistakePositions store with an empty array
		const correctedMistakePositions = writable<number[]>([]);

		// Init totalTypedCharacters store with 0
		const totalTypedCharacters = writable(0);

		// Init startTime store with null
		const startTime = writable<number | null>(null);

		// Init startTime store with null
		const endTime = writable<number | null>(null);

		// Init wpm store, a derived store which calculates the user's words per minute score from various other stores
		const wpm = derived(
			[ mistakePositions, correctedMistakePositions, totalTypedCharacters, startTime, endTime ],
			([ $mistakePositions, $correctedMistakePositions, $totalTypedCharacters, $startTime, $endTime ]) => {
				if ($startTime == null) return 0;
				if ($endTime == null) $endTime = Date.now(); // If endTime hasn't been set yet, just use current time

				// https://www.speedtypingonline.com/typing-equations

				const typedWords = $totalTypedCharacters / 5; // We use 5 here, because that's the average word length in the English language and therefore commonly used to calculate WPM
				const elapsedMilliseconds = $endTime - $startTime; // Calculated elapsed milliseconds
				const elapsedSeconds = elapsedMilliseconds / 1000; // Convert milliseconds to seconds
				const elapsedMinutes = elapsedSeconds / 60; // Convert seconds to minutes
				const grossWPM = typedWords / elapsedMinutes; // Calculate gross WPM
				const uncorrectedMistakes = $mistakePositions.length - $correctedMistakePositions.length; // Calculate amount of uncorrected mistakes
				const errorRate = uncorrectedMistakes / elapsedMinutes; // Calculate error rate (errors per minute)
				const netWPM = grossWPM - errorRate; // Calculate net WPM

				return +Math.max(netWPM, 0).toFixed(1); // Make sure netWPM isn't negative and round it to one decimal position
			},
			0,
		);

		// Init cps store, a derived store which calculates the user's characters per second score from various other stores
		const cps = derived(
			[ mistakePositions, correctedMistakePositions, totalTypedCharacters, startTime, endTime ],
			([ $mistakePositions, $correctedMistakePositions, $totalTypedCharacters, $startTime, $endTime ]) => {
				if ($startTime == null) return 0;
				if ($endTime == null) $endTime = Date.now(); // If endTime hasn't been set yet, just use current time

				// https://www.speedtypingonline.com/typing-equations
				// This uses the same method but with seconds instead of minutes, and characters instead of words

				const elapsedMilliseconds = $endTime - $startTime; // Calculated elapsed milliseconds
				const elapsedSeconds = elapsedMilliseconds / 1000; // Convert milliseconds to seconds
				const grossCPS = $totalTypedCharacters / elapsedSeconds; // Calculate gross CPS
				const uncorrectedMistakes = $mistakePositions.length - $correctedMistakePositions.length; // Calculate amount of uncorrected mistakes
				const errorRate = uncorrectedMistakes / elapsedSeconds; // Calculate error rate (errors per second)
				const netCPS = grossCPS - errorRate; // Calculate net CPS

				return +Math.max(netCPS, 0).toFixed(1); // Make sure netCPS isn't negative and round it to one decimal position
			},
			0,
		);

		// Init mistakes store, a derived store from mistakePositions
		const mistakes = derived(
			mistakePositions,
			$mistakePositions => $mistakePositions.length,
			0,
		);

		// Init accuracy store, a derived store which calculates the user's typing accuracy from the amount of mistakes and the total amount of typed characters
		const accuracy = derived(
			[ mistakePositions, totalTypedCharacters ],
			([ $mistakePositions, $totalTypedCharacters ]) => {
				if ($totalTypedCharacters == 0) return 0;

				const charactersTypedWithoutMistakes = ($totalTypedCharacters - $mistakePositions.length); // Calculate the amount of characters typed without mistakes

				return Math.round((charactersTypedWithoutMistakes / $totalTypedCharacters) * 100); // Calculate accuracy, convert to percent and round
			},
			0,
		);


		/** Holds the input text from before it was updated */
		let oldInputText = '';

		// Subscribe to changes to inputText
		inputText.subscribe($inputText => {
			if (inputDisabled) return;

			if ($inputText.length >= oldInputText.length && $inputText !== oldInputText) {
				totalTypedCharacters.update(n => n + 1); // If the text got longer or a character has changed, increase the total amount of typed characters
			}

			oldInputText = $inputText;
		});

		// Subscribe to changes to gameState
		gameState.subscribe($gameState => {
			if ($gameState === GameState.Started) {
				startTime.set(Date.now()); // If gameState changes to started, set startTime to current time
			} else if ($gameState === GameState.Finished) {
				inputDisabled = true; // If gameState changes to finished, disable user input
				endTime.set(Date.now()); // ... and set endTime to current time
			}
		});

		// Subscribe to changes to characterStates, mistakePositions and correctedMistakePositions and update those according to characterStates
		Utils.subscribeAll(
			[ characterStates, mistakePositions, correctedMistakePositions ],
			([ $characterStates, $mistakePositions, $correctedMistakePositions ]) => {
				// Loop through all text positions
				for (let pos = 0; pos < $characterStates.length; pos++) {
					const state = $characterStates[pos]; // Get character state

					if (state === CharacterState.Incorrect && !$mistakePositions.includes(pos)) {
						mistakePositions.update(positions => [ ...positions, pos ]); // If character is incorrect and not already in the list of mistakes, add character position to list of mistakes
					} else if (state === CharacterState.Correct && $mistakePositions.includes(pos) && !$correctedMistakePositions.includes(pos)) {
						correctedMistakePositions.update(positions => [ ...positions, pos ]); // If character is correct, but also in mistakePositions, it means the user corrected the mistake - add the character position to list of corrected mistakes, if not already in it
					}
				}
			},
		);


		// Expose inputText store as writable store
		this.inputText = inputText;

		// Expose all other writable stores as readable stores
		this.text = Utils.makeReadable(text);
		this.mistakePositions = Utils.makeReadable(mistakePositions);
		this.correctedMistakePositions = Utils.makeReadable(correctedMistakePositions);
		this.totalTypedCharacters = Utils.makeReadable(totalTypedCharacters);
		this.startTime = Utils.makeReadable(startTime);
		this.endTime = Utils.makeReadable(endTime);

		// Expose the derived stores, which are readable stores
		this.characterStates = characterStates;
		this.gameState = gameState;
		this.cursorPosition = cursorPosition;
		this.wpm = wpm;
		this.cps = cps;
		this.mistakes = mistakes;
		this.accuracy = accuracy;


		// Define the reset method
		this.reset = (_textOrMinLength?: (string | number)) => {
			if (_textOrMinLength != null) {
				// Reset text using reset parameter
				text.set(
					typeof _textOrMinLength === 'string'
					? _textOrMinLength
					: TextGenerator.generateText(_textOrMinLength),
				);
			} else {
				// Reset text using constructor parameter
				text.set(
					typeof textOrMinLength === 'string'
					? textOrMinLength
					: TextGenerator.generateText(textOrMinLength),
				);
			}

			inputText.set(''); // Reset inputText
			mistakePositions.set([]); // Reset mistakePositions
			correctedMistakePositions.set([]); // Reset correctedMistakePositions
			totalTypedCharacters.set(0); // Reset totalTypedCharacters
			startTime.set(null); // Reset startTime
			endTime.set(null); // Reset endTime

			oldInputText = ''; // Reset this variable so totalTypedCharacters works next time
			inputDisabled = false; // Re-enable user input
		};
	}

}
