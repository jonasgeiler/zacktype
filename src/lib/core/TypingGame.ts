

class TypingGame {



}

namespace TypingGame {

	enum CharacterState {
		Unreached,
		Correct,
		Incorrect
	}

	interface Character {
		char: string;
		state: CharacterState;
	}

}

export default TypingGame;
