import type { Readable, Unsubscriber, Writable } from 'svelte/store';

/** List of Readable stores */
type Stores = [ Readable<any>, ...Array<Readable<any>> ] | Array<Readable<any>>;

/** Values from a list of Readable stores */
type StoresValues<T> = {
	[K in keyof T]: T[K] extends Readable<infer U> ? U : never;
};

/** Object describing all differences between two strings */
interface Differences {
	/** Indices of added characters */
	readonly added: number[];

	/** Indices of removed characters */
	readonly removed: number[];

	/** Indices of changed characters */
	readonly changed: number[];
}

/** Does nothing (no operation) */
function noop() {
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
	 * Subscribe to multiple svelte stores at once.
	 * @param stores - List of stores to subscribe to.
	 * @param callback - Callback that is called with the store values each time one of stores was updated.
	 */
	public static subscribeAll<S extends Stores>(stores: S, callback: (values: StoresValues<S>) => Unsubscriber | void): Unsubscriber {
		// Most of the logic was taken from the derived function in `svelte/stores`

		let initiated = false; // This prevents sync before all stores where subscribed
		let values = new Array(stores.length);

		let pending = 0; // Binary with one bit for each store
		let cleanup: Unsubscriber = noop; // Cleanup function

		const sync = () => {
			if (pending) return;

			cleanup();
			const result = callback(values as StoresValues<S>);

			cleanup = typeof result == 'function' ? result : noop;
		};

		const unsubscribeFunctions = stores.map((store, i) => store.subscribe(
			value => {
				values[i] = value;
				pending &= ~(1 << i);

				if (initiated) {
					sync();
				}
			},
			() => {
				pending |= (1 << i);
			},
		));

		initiated = true;
		sync();

		return function unsubscribeAll() {
			for (let unsubscribe of unsubscribeFunctions) {
				unsubscribe();
			}

			cleanup();
		};
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
