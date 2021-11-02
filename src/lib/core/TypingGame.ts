import type { ReadableAtom, WritableAtom } from 'nanostores';
import { atom } from 'nanostores';
import type { Key } from 'ts-key-enum';
import dictionary from './dictionary';

class TypingGame {

	public text: string;

	protected characters: WritableAtom<TypingGame.Character[]>;
	protected cps: WritableAtom<number>;
	protected wpm: WritableAtom<number>;
	protected accuracy: WritableAtom<number>;
	protected gameState: WritableAtom<TypingGame.GameState>;
	protected startTime: WritableAtom<number | null>;
	protected endTime: WritableAtom<number | null>;

	constructor(
		protected options: TypingGame.Options = {
			approximateTextLength:     300,
			generateUppercaseLetters:  true,
			generateSpecialCharacters: true,
		},
	) {
		this.text = options.text ?? this.generateText(); // Use supplied text or generate one

		// Make character array
		let characters: TypingGame.Character[] = [];
		for (let char of this.text) {
			characters.push({
				char,
				state: TypingGame.CharacterState.Unreached,
			});
		}

		// Init stores
		this.characters = atom(characters);
		this.gameState = atom(TypingGame.GameState.NotStarted);
		this.cps = atom(0);
		this.wpm = atom(0);
		this.accuracy = atom(100);
		this.startTime = atom(null);
		this.endTime = atom(null);
	}

	/**
	 * This exposes all internal writable stores as readable stores for use on the frontend.
	 */
	public getStores(): TypingGame.Stores {
		// Omit the set function for each store:
		const { set: a, ...characters } = this.characters;
		const { set: b, ...cps } = this.cps;
		const { set: c, ...wpm } = this.wpm;
		const { set: d, ...accuracy } = this.accuracy;
		const { set: e, ...gameState } = this.gameState;

		return { characters, cps, wpm, accuracy, gameState }; // Return the readable stores
	}

	public handleKeyPress(key: Key) {

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

	export interface Character {
		char: string;
		state: CharacterState;
	}

	export interface Stores {
		readonly characters: ReadableAtom<Character[]>;
		readonly cps: ReadableAtom<number>;
		readonly wpm: ReadableAtom<number>;
		readonly accuracy: ReadableAtom<number>;
		readonly gameState: ReadableAtom<GameState>;
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
