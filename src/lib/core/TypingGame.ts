import type { Writable } from 'svelte/store';

class TypingGame {

	public text: string;
	public characters: Writable<TypingGame.Character[]>;
	public wpm: number;
	public cps: number;
	public accuracy: number;

	constructor(
		protected options: TypingGame.Options = {

		}
	) {
	}

}

namespace TypingGame {

	export enum CharacterState {
		Unreached,
		Correct,
		Incorrect
	}

	export interface Character {
		char: string;
		state: CharacterState;
	}

	export interface Options {
		
	}

}

export default TypingGame;
