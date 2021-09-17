import { OperatorFunction, concat, defer } from 'rxjs';
import { filter, map, scan } from 'rxjs/operators';
import { identity } from 'lodash';

export interface BufferUntilState<T> {
	buffer: T[];
	payload: T[] | null;
}

export type BufferUntilPredicate<T> = (value: T, state: BufferUntilState<T>) => boolean;

/**
 * Modifies the state based on the return value of the predicate.
 * If the predicate returns true for the given state and value, payload will be set
 * to the state's buffer plus the given value.
 */
export const mutateBufferUntilState = <T>(
	predicate: BufferUntilPredicate<T>,
	state: BufferUntilState<T>,
	value: T
): BufferUntilState<T> => {

	state.buffer.push(value);

	if (predicate(value, state)) {
		state.payload = state.buffer;
		state.buffer = [];

	} else {
		state.payload = null;
	}

	return state;
};

/**
 * Buffers input until the given predicate returns true for a given buffer state and value.
 * Emits all buffered values up until (and including) the value for which the predicate returns a truthy value.
 */
export const bufferUntil = <T>(
	predicate: BufferUntilPredicate<T>,
	flushOnComplete?: boolean
): OperatorFunction<T, T[]> => source => {

	const state: BufferUntilState<T> = { buffer: [], payload: null };

	const aliveStream = source.pipe(
		scan((_, value: T) => mutateBufferUntilState(predicate, state, value), state),
		map(() => state.payload as any),
	);

	const onCompleteStream = defer(() => {
		return Promise.resolve(flushOnComplete ? state.buffer : undefined);
	});

	return concat(aliveStream, onCompleteStream).pipe(
		filter(identity)
	);
};