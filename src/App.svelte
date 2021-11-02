<script lang="ts">
	import TypingGame from '$lib/core/TypingGame';

	const typingGame = new TypingGame();
	const {
		text,
		characterStates,
		cursorPosition,
		wpm,
		cps,
		accuracy,
		mistakes,
		correctedMistakes,
	} = typingGame.getStores();
</script>

<div>
	{#each $text as character, index (character + index)}
		<span class:active={$cursorPosition === index}
		      class:correct={$characterStates[index] === TypingGame.CharacterState.Correct}
		      class:incorrect={$characterStates[index] === TypingGame.CharacterState.Incorrect}
		>{character}</span>
	{/each}
</div>

<input type="text" on:keydown|preventDefault={e => typingGame.handleKey(e.key)} />

<p>
	WPM: {$wpm}<br>
	CPS: {$cps}<br>
	Accuracy: {$accuracy}%<br>
	Mistakes: {$mistakes}<br>
	Corrected Mistakes: {$correctedMistakes}<br>
</p>

<style>
	span.active {
		background-color: #aaa;
	}

	span.correct {
		color: #0f0;
	}

	span.incorrect {
		color: #f00;
	}
</style>
