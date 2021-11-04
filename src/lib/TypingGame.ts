import { Utils } from '$lib/Utils';
import type { Readable } from 'svelte/store';
import { derived, writable } from 'svelte/store';
import { TextGenerator } from './TextGenerator';

export enum CharacterState {
	None,
	Correct,
	Incorrect
}

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

	/** The whole text typed in by the user */
	public readonly inputText: Readable<string>;

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
		// Init text store with a randomly generated text or using the specified one
		const text = writable(
			typeof textOrMinLength === 'string'
			? textOrMinLength
			: TextGenerator.generateText(textOrMinLength),
		);

		// Init inputText store with an empty string
		const inputText = writable('');

		// Init characterStates store, a derived store from text and inputText
		const characterStates = derived(
			[ text, inputText ],
			([ $text, $inputText ]) => {
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

				return characterStates;
			},
			[],
		);

		// Init gameState store, a derived store from text and inputText
		const gameState = derived(
			[ text, inputText ],
			([ $text, $inputText ]) => {
				if ($inputText.length >= $text.length) {
					return GameState.Finished; // If inputText has the same length as text the user finished typing
				} else if ($inputText.length > 0) {
					return GameState.Started; // If inputText has content the user started typing
				} else {
					return GameState.Idle; // Otherwise the game hasn't yet started and is doing nothing
				}
			},
			GameState.Idle,
		);

		// Init cursorPosition store, a derived store from inputText
		const cursorPosition = derived(
			inputText,
			$inputText => $inputText.length, // Cursor position is always the last position of the inputText
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

		// Subscribe to changes to characterStates
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

		// Subscribe to changes to gameState
		gameState.subscribe($gameState => {
			if ($gameState === GameState.Started) {
				startTime.set(Date.now()); // If gameState changes to started, set startTime to current time
			} else if ($gameState === GameState.Finished) {
				endTime.set(Date.now()); // If gameState changes to finished, set endTime to current time
			}
		});

		/** Holds the input text from before it was updated */
		let oldInputText = '';

		// Subscribe to changes to inputText
		inputText.subscribe($inputText => {
			if ($inputText.length >= oldInputText.length && $inputText !== oldInputText) {
				totalTypedCharacters.update(n => n + 1); // If the text got longer or a character has changed, increase the total amount of typed characters
			}

			oldInputText = $inputText;
		});

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

		// Set the reset method
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
		};
	}

}
