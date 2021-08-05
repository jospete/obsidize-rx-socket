/**
 * Simple interface for translating between two value types.
 */
export interface TransformDuplex<T, R> {
	encode(value: T): R;
	decode(value: R): T;
}