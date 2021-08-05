import { from, OperatorFunction } from 'rxjs';
import { filter, map, mergeMap, scan } from 'rxjs/operators';
import { identity, join, slice, size } from 'lodash';

import { splitInclusive } from './utility';

export interface JsonBufferMapOptions {
	terminator: string;
	jsonToText(value: any): string;
	textToJson(value: string): any;
	textToBuffer(value: string): Uint8Array;
	bufferToText(value: Uint8Array): string;
}

export interface BufferUntilState<T> {
	buffer: T[];
	payload: T[] | null;
}

export type BufferUntilPredicate<T> = (value: T, state: BufferUntilState<T>) => boolean;

export const defaultJsonBufferMapOptions: JsonBufferMapOptions = {
	terminator: '\0',
	jsonToText: JSON.stringify,
	textToJson: JSON.parse,
	textToBuffer: v => (new TextEncoder().encode(v)),
	bufferToText: v => (new TextDecoder().decode(v)),
};

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

export const bufferUntil = <T>(
	predicate: BufferUntilPredicate<T>
): OperatorFunction<T, T[]> => source => source.pipe(
	scan(
		(state: BufferUntilState<T>, value: T) => mutateBufferUntilState(predicate, state, value),
		{ buffer: [], payload: null }
	),
	map(state => state.payload as any),
	filter(identity)
);

export const mapJsonToText = <T>(
	options: JsonBufferMapOptions
): OperatorFunction<T, string> => source => source.pipe(
	map(v => options.jsonToText(v) + options.terminator)
);

export const mapTextToBuffer = (
	options: JsonBufferMapOptions
): OperatorFunction<string, Uint8Array> => source => source.pipe(
	map(v => options.textToBuffer(v))
);

export const mapJsonToBuffer = <T>(
	options: JsonBufferMapOptions
): OperatorFunction<T, Uint8Array> => source => source.pipe(
	mapJsonToText(options),
	mapTextToBuffer(options)
);

export const mapBufferToText = (
	options: JsonBufferMapOptions
): OperatorFunction<Uint8Array, string> => source => source.pipe(
	map(v => options.bufferToText(v))
);

export const bufferUntilTerminator = (
	options: JsonBufferMapOptions
): OperatorFunction<string, string[]> => source => source.pipe(
	mergeMap(text => from(splitInclusive(text, options.terminator))),
	filter(identity),
	bufferUntil(v => v === options.terminator),
);

export const bufferUntilTerminatorExclusive = (
	options: JsonBufferMapOptions
): OperatorFunction<string, string[]> => source => source.pipe(
	bufferUntilTerminator(options),
	map(v => slice(v, 0, size(v) - 1))
);

export const mapTextToJson = <T>(
	options: JsonBufferMapOptions
): OperatorFunction<string, T> => source => source.pipe(
	map(v => options.textToJson(v))
);

export const mapBufferToJson = <T>(
	options: JsonBufferMapOptions
): OperatorFunction<Uint8Array, T> => source => source.pipe(
	mapBufferToText(options),
	bufferUntilTerminatorExclusive(options),
	map(v => join(v, '')),
	mapTextToJson(options)
);