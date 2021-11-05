<script lang="ts">
	import { CharacterState, GameState, TypingGame } from '$lib/TypingGame';
	import { onMount, tick } from 'svelte';
	import { slide } from 'svelte/transition';

	const typingGame = new TypingGame();

	const {
		text,
		inputText,
		gameState,
		characterStates,
		correctedMistakes,
		cursorPosition,
		wpm,
		cps,
		accuracy,
		mistakes,
	} = typingGame;

	let hiddenInput: HTMLInputElement;

	const cursorBlinkInterval = 500;
	let cursorTimeoutId: number;
	let cursorActive: boolean;

	/**
	 * Toggles the cursorActive variable and causes the cursor to blink every few milliseconds
	 */
	function makeCursorBlink() {
		cursorActive = !cursorActive;
		cursorTimeoutId = window.setTimeout(makeCursorBlink, cursorBlinkInterval);
	}

	/**
	 * Reset cursor blinking.
	 * Calling this on every keystroke prevents blinking WHILE typing.
	 * When the user pauses again for a bit, it starts blinking again.
	 */
	function resetCursorBlink() {
		cursorActive = true;
		window.clearTimeout(cursorTimeoutId);
		cursorTimeoutId = window.setTimeout(makeCursorBlink, cursorBlinkInterval);
	}

	/**
	 * Focus the hidden input field
	 */
	function focusInputField() {
		if (!hiddenInput || $gameState == GameState.Finished) return;
		hiddenInput.focus();
	}

	/**
	 * Reset selection range of the input field.
	 * When called in onKeyUp, it prevents the user from moving the cursor or selecting text.
	 * When called in onSelectionChange, it does the same, but also on mobile and it works better (not yet implemented by many browsers)
	 */
	function resetInputFieldSelection() {
		hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length); // Move cursor to end of input
	}

	// Subscribe to inputText changes
	inputText.subscribe(text => {
		if (text) resetCursorBlink(); // Reset cursor blink when inputText was updated
	});

	// Subscribe to cursorPosition changes
	cursorPosition.subscribe(() => {
		// Wait for next tick (until cursor position updates in UI)
		tick().then(() => {
			// Loop through all cursor elements (there should only be one)
			for (let cursor of document.getElementsByClassName('cursor')) {
				cursor.scrollIntoView({ block: 'center' }); // Scroll cursor element into center of view
			}
		});
	});

	onMount(() => {
		cursorTimeoutId = window.setTimeout(makeCursorBlink, cursorBlinkInterval); // Start cursor blinking

		focusInputField(); // Focus the hidden input field initially
		window.addEventListener('click', focusInputField); // If user clicked anywhere it should focus the hidden input field

		() => {
			// Cleanup
			window.clearTimeout(cursorTimeoutId);
			window.removeEventListener('click', focusInputField);
		};
	});
</script>

{#if $gameState !== GameState.Finished}
	<div id="hidden-form">
		<label for="input-field">Type here:</label>
		<input bind:this={hiddenInput} bind:value={$inputText} on:keyup={resetInputFieldSelection} on:selectionchange={resetInputFieldSelection}
		       id="input-field" type="text" tabindex="0" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" />
	</div>
{/if}

<div id="game">
	<div id="text" title={$gameState !== GameState.Finished ? "Just start typing!" : "Well done!"}>
		{#each $text as character, index (character + index)}
			<span class:cursor={$cursorPosition === index && cursorActive}
			      class:correct={$characterStates[index] === CharacterState.Correct}
			      class:incorrect={$characterStates[index] === CharacterState.Incorrect}
			      class:corrected={$characterStates[index] === CharacterState.Corrected}>{character}</span>
		{/each}
	</div>

	{#if $gameState === GameState.Finished}
		<div id="game-over" transition:slide>
			<div id="result">
				<div class="result-item">
					<span class="result-value">{$cps}</span>
					<span class="result-description" title="characters per second">chars/sec</span>
				</div>

				<div class="result-item">
					<span class="result-value">{$wpm}</span>
					<span class="result-description" title="words per minute">words/min</span>
				</div>

				<div class="result-item">
					<span class="result-value">{$accuracy}%</span>
					<span class="result-description">accuracy</span>
				</div>

				<div class="result-item">
					<span class="result-value" title="{$correctedMistakes} out of {$mistakes} mistakes were corrected">{$mistakes}</span>
					<span class="result-description">mistakes</span>
				</div>
			</div>

			<a on:click={() => typingGame.reset()} id="restart" title="Click to restart">
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
		--primary-text-color:        #fff;
		--secondary-text-color:      #818181;
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
		font-family:             var(--font-family);
		font-weight:             400;
		width:                   100%;
		height:                  100%;
		margin:                  0;
		padding:                 0;
		color:                   var(--primary-text-color);
		background-color:        var(--background-color);
		-webkit-font-smoothing:  antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	* {
		box-sizing: border-box;
	}

	#app {
		display:            flex;
		overflow-y:         auto;
		align-items:        center;
		justify-content:    center;
		min-height:         100vh;
		scrollbar-width:    none;
		-ms-overflow-style: none;
	}

	#hidden-form {
		position:       fixed;
		z-index:        -1;
		top:            0;
		left:           0;
		display:        block;
		margin:         0;
		padding:        0;
		resize:         none;
		cursor:         default;
		pointer-events: none;
		opacity:        0;
		border:         none;
		outline:        none;
	}

	#game {
		display:         flex;
		align-items:     center;
		flex-direction:  column;
		justify-content: center;
		width:           100%;
		max-width:       600px;
		margin:          2rem 1rem;
	}

	#text {
		font-size:   24px;
		cursor:      text;
		user-select: none;
		white-space: pre-wrap;
	}

	#text .cursor {
		color:            var(--background-color);
		background-color: var(--primary-text-color);
	}

	#text .correct {
		color: var(--correct-character-color);
	}

	#text .incorrect {
		color:            var(--primary-text-color);
		background-color: var(--incorrect-character-color);
	}

	#text .corrected {
		color: var(--correct-character-color);
		background-color: var(--corrected-character-color);
	}

	#game-over {
		display:         flex;
		align-items:     center;
		flex-direction:  column;
		justify-content: center;
		width:           100%;
		margin-top:      2rem;
	}

	#result {
		display:         flex;
		align-items:     center;
		flex-wrap:       wrap;
		justify-content: space-around;
		width:           100%;
	}

	#result .result-item {
		display:         flex;
		align-items:     center;
		flex-direction:  column;
		justify-content: center;
		margin-bottom:   20px;
		margin-right:    20px;
		margin-left:     20px;
	}

	#result .result-item .result-value {
		font-size: 48px;
	}

	#result .result-item .result-description {
		font-size: 18px;
		color:     var(--secondary-text-color);
	}

	#restart {
		font-size:   16px;
		margin-top:  2rem;
		cursor:      pointer;
		user-select: none;
		fill:        var(--secondary-text-color);
	}
</style>
