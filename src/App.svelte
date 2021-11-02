<script lang="ts">
	import TypingGame from '$lib/core/TypingGame';
	import { slide } from 'svelte/transition';

	const typingGame = new TypingGame();

	const {
		text,
		characterStates,
		cursorPosition,
		gameState,
		wpm,
		cps,
		accuracy,
		mistakes,
	} = typingGame.getStores();

	let inputField: HTMLInputElement;

	function focusInputField() {
		inputField.focus();
	}

	function restart() {
		typingGame.reset();
		focusInputField();
	}
</script>

<input bind:this={inputField} on:keydown={e => typingGame.handleKey(e.key)}
       id="inputField" type="text" autofocus autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" />

<div id="game">
	<div id="text" on:click={focusInputField}>
		{#each $text as character, index (character + index)}
			<span class:cursor={$cursorPosition === index}
			      class:correct={$characterStates[index] === TypingGame.CharacterState.Correct}
			      class:incorrect={$characterStates[index] === TypingGame.CharacterState.Incorrect}>{character}</span>
		{/each}
	</div>

	{#if $gameState === TypingGame.GameState.Ended}
		<div id="gameOver" transition:slide>
			<div id="result">
				<div class="result-item">
					<span class="result-value">{$cps}</span>
					<span class="result-description">chars/sec</span>
				</div>

				<div class="result-item">
					<span class="result-value">{$wpm}</span>
					<span class="result-description">words/min</span>
				</div>

				<div class="result-item">
					<span class="result-value">{$accuracy}%</span>
					<span class="result-description">accuracy</span>
				</div>

				<div class="result-item">
					<span class="result-value">{$mistakes}</span>
					<span class="result-description">mistakes</span>
				</div>
			</div>

			<a on:click={restart} id="restart">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path d="M12 0c-3.31 0-6.291 1.353-8.459 3.522l-2.48-2.48-1.061 7.341 7.437-.966-2.489-2.488c1.808-1.808 4.299-2.929 7.052-2.929 5.514 0 10 4.486 10 10s-4.486 10-10 10c-3.872 0-7.229-2.216-8.89-5.443l-1.717 1.046c2.012 3.803 6.005 6.397 10.607 6.397 6.627 0 12-5.373 12-12s-5.373-12-12-12z"/>
				</svg>
			</a>
		</div>
	{/if}
</div>

<style global>
	:root {
		--font-family:               ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
		--background-color:          #171717;
		--primary-text-color:        #e0e0e0;
		--secondary-text-color:      #7f7f7f;
		--correct-character-color:   #03a9f4;
		--incorrect-character-color: #f44336;
	}

	body {
		height:                  100%;
		width:                   100%;

		padding:                 0;
		margin:                  0;

		font-family:             var(--font-family);
		font-weight:             400;
		-webkit-font-smoothing:  antialiased;
		-moz-osx-font-smoothing: grayscale;

		background-color:        var(--background-color);
		color:                   var(--primary-text-color);
	}

	* {
		box-sizing: border-box;
	}

	#app {
		height:             100vh;

		display:            flex;
		justify-content:    center;
		align-items:        center;

		overflow-y:         auto;
		scrollbar-width:    none;
		-ms-overflow-style: none;
	}

	#inputField {
		position: fixed;
		top:      -100vh;
		left:     -100vw;
	}

	#game {
		max-height:      600px;
		height:          100%;
		max-width:       600px;
		width:           100%;

		margin-left:     1rem;
		margin-right:    1rem;

		display:         flex;
		flex-direction:  column;
		justify-content: center;
		align-items:     center;
	}

	#text {
		font-size: 24px;
		user-select: none;
		cursor: text;
	}

	#text .cursor {
		background-color: var(--primary-text-color);
		color:            var(--background-color);
	}

	#text .correct {
		color: var(--correct-character-color);
	}

	#text .incorrect {
		background-color: var(--incorrect-character-color);
		color:            var(--primary-text-color);
	}

	#gameOver {
		width:           100%;

		display:         flex;
		flex-direction:  column;
		justify-content: center;
		align-items:     center;
	}

	#result {
		width:           100%;
		margin-top:      2rem;

		display:         flex;
		flex-wrap:       wrap;
		justify-content: space-around;
		align-items:     center;
	}

	.result-item {
		display:         flex;
		flex-direction:  column;
		justify-content: center;
		align-items:     center;

		margin-bottom:   5px;
	}

	.result-item:not(:last-child) {
		margin-right: 15px;
	}

	.result-value {
		font-size: 48px;
	}

	.result-description {
		font-size: 18px;
		color:     var(--secondary-text-color);
	}

	#restart {
		margin-top: 2rem;
		font-size:  16px;
		fill:      var(--secondary-text-color);
		stroke: var(--secondary-text-color);

		cursor: pointer;
		user-select: none;
	}
</style>
