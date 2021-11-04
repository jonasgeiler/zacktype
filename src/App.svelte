<script lang="ts">
	import { CharacterState, GameState, TypingGame } from '$lib/TypingGame';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	const typingGame = new TypingGame();

	const {
		text,
		inputText,
		characterStates,
		gameState,
		cursorPosition,
		correctedMistakePositions,
		wpm,
		cps,
		accuracy,
		mistakes,
	} = typingGame;

	let inputField: HTMLInputElement;

	const cursorBlinkTimeout = 500;
	let cursorTimeoutId: number;
	let cursorActive: boolean;

	function cursorBlink() {
		cursorActive = !cursorActive;
		cursorTimeoutId = window.setTimeout(cursorBlink, cursorBlinkTimeout);
	}

	function resetCursorBlink() {
		cursorActive = true;
		window.clearTimeout(cursorTimeoutId);
		cursorTimeoutId = window.setTimeout(cursorBlink, cursorBlinkTimeout);
	}

	function focusInputField() {
		if (!inputField || $gameState == GameState.Finished) return;
		inputField.focus();
	}

	inputText.subscribe(text => {
		if (text) {
			resetCursorBlink(); // Reset cursor blink when inputText was updated

			if (inputField) inputField.setSelectionRange(text.length, text.length); // Move cursor to end of input, just in case
		}
	});

	onMount(() => {
		cursorTimeoutId = window.setTimeout(cursorBlink, cursorBlinkTimeout);

		window.addEventListener('click', focusInputField);
		focusInputField();

		() => {
			window.clearTimeout(cursorTimeoutId);
			window.removeEventListener('click', focusInputField);
		};
	});
</script>

{#if $gameState !== GameState.Finished}
	<div id="hidden-form">
		<label for="input-field">Type here</label>
		<input bind:this={inputField} bind:value={$inputText} id="input-field" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" />
	</div>
{/if}

<div id="game">
	<div id="text">
		{#each $text as character, index (character + index)}
			<span class:cursor={$cursorPosition === index && cursorActive}
			      class:correct={$characterStates[index] === CharacterState.Correct}
			      class:incorrect={$characterStates[index] === CharacterState.Incorrect}
			      class:corrected={$correctedMistakePositions.includes(index)}>{character}</span>
		{/each}
	</div>

	{#if $gameState === GameState.Finished}
		<div id="game-over" transition:slide>
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

			<a on:click={() => typingGame.reset()} id="restart">
				<svg xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 24 24" height="30" width="30">
					<path d="M7 9H0V2h1v5.2C2.853 2.963 7.083 0 12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12C5.714 24 .55 19.156.041 13h1.004C1.551 18.603 6.266 23 12 23c6.071 0 11-4.929 11-11S18.071 1 12 1C7.34 1 3.353 3.904 1.751 8H7v1z" />
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
		--corrected-character-color: #f4433633;
	}

	@media (prefers-color-scheme: light) {
		:root {
			--background-color:          #fff;
			--primary-text-color:        #171717;
			--secondary-text-color:      #707070;
			--correct-character-color:   #2196f3;
			--incorrect-character-color: #f44336;
			--corrected-character-color: #f4433633;
		}
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
		min-height:         100vh;
		display:            flex;
		justify-content:    center;
		align-items:        center;
		overflow-y:         auto;
		scrollbar-width:    none;
		-ms-overflow-style: none;
	}

	#hidden-form {
		position: fixed;
		top:      -100vh;
		left:     -100vw;
	}

	#game {
		max-width:       600px;
		width:           100%;
		margin:          2rem 1rem;
		display:         flex;
		flex-direction:  column;
		justify-content: center;
		align-items:     center;
	}

	#text {
		font-size:   24px;
		white-space: pre-wrap;
		user-select: none;
		cursor:      text;
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

	#text .corrected {
		background-color: var(--corrected-character-color);
	}

	#game-over {
		width:           100%;
		margin-top:      2rem;
		display:         flex;
		flex-direction:  column;
		justify-content: center;
		align-items:     center;
	}

	#result {
		width:           100%;
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
		margin-bottom:   10px;
	}

	.result-item {
		margin-left:  20px;
		margin-right: 20px;
	}

	.result-value {
		font-size: 48px;
	}

	.result-description {
		font-size: 18px;
		color:     var(--secondary-text-color);
	}

	#restart {
		margin-top:  2rem;
		font-size:   16px;
		fill:        var(--secondary-text-color);
		cursor:      pointer;
		user-select: none;
	}
</style>
