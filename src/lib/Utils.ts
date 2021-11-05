import type { Readable, Writable } from 'svelte/store';

/** Object describing all differences between two strings */
interface Differences {
	/** Indices of added characters */
	readonly added: number[];

	/** Indices of removed characters */
	readonly removed: number[];

	/** Indices of changed characters */
	readonly changed: number[];
}

/**
 * Has some useful methods that can be used everywhere.
 */
export class Utils {

	/**
	 * Returns a random integer in range min to max.
	 * @param min - Inclusive minimum value.
	 * @param max - Inclusive maximum value.
	 */
	public static randomInteger(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	/**
	 * Have a given probability that this function returns true.
	 * @param percentage - Probability in percent
	 */
	public static withProbability(percentage: number) {
		return Math.random() * 100 < percentage;
	}

	/**
	 * Convert a writable store to a readable store.
	 * @param writable
	 */
	public static makeReadable<T extends any>(writable: Writable<T>): Readable<T> {
		return {
			subscribe: writable.subscribe,
		};
	}

	/**
	 * Get all differences between two strings.
	 * @param from - The old string.
	 * @param to - The new string.
	 */
	public static findDifferences(from: string, to: string): Differences {
		let fromArr: (string | null)[] = [ ...from ];
		let toArr: (string | null)[] = [ ...to ];

		if (fromArr.length > toArr.length) {
			// Add nulls to toArr until it has the same length as fromArr
			while (fromArr.length !== toArr.length) toArr.push(null);
		} else if (toArr.length > fromArr.length) {
			// Add nulls to fromArr until it has the same length as toArr
			while (toArr.length !== fromArr.length) fromArr.push(null);
		}

		// Indices of differences
		let added: number[] = [];
		let removed: number[] = [];
		let changed: number[] = [];

		for (let i = 0; i < fromArr.length; i++) {
			if (fromArr[i] === null) {
				// Added a character
				added.push(i);
			} else if (toArr[i] === null) {
				// Removed a character
				removed.push(i);
			} else if (fromArr[i] !== toArr[i]) {
				// Changed a character
				changed.push(i);
			}
		}

		return { added, removed, changed };
	}

}
