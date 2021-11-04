import type { Readable, Unsubscriber, Writable } from 'svelte/store';

/** List of Readable stores. */
type Stores = [ Readable<any>, ...Array<Readable<any>> ] | Array<Readable<any>>;

/** Values from a list of Readable stores. */
type StoresValues<T> = {
	[K in keyof T]: T[K] extends Readable<infer U> ? U : never;
};

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
	 * Subscribe to multiple svelte stores at once.
	 * @param stores - List of stores to subscribe to.
	 * @param callback - Callback that is called with the store values each time one of stores was updated.
	 */
	public static subscribeAll<S extends Stores>(stores: S, callback: (values: StoresValues<S>) => Unsubscriber | void): Unsubscriber {
		// Most of the logic was taken from the derived function `svelte/stores`

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
	 * Convert a writable store to a readable store
	 * @param writable
	 */
	public static makeReadable<T extends any>(writable: Writable<T>): Readable<T> {
		return {
			subscribe: writable.subscribe,
		};
	}

}
