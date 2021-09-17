/**
 * Defines options that allow any class instance to be torn down in a standard format.
 */
export interface Destroyable {
	destroy(errorMessage?: string): void;
	isDestroyed(): boolean;
}