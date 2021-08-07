import { from, OperatorFunction } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { identity, join, slice, size } from 'lodash';

import { JsonBufferMapOptions, JsonBufferMapUtility } from './json-buffer-map-options';
import { bufferUntil } from './buffer-until';
import { splitInclusive } from './utility';

export const mapJsonToText = <T>(
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<T, string> => source => source.pipe(
	map(v => JsonBufferMapUtility.jsonToText(v, options))
);

export const mapTextToBuffer = (
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<string, Uint8Array> => source => source.pipe(
	map(v => options.textToBuffer(v))
);

export const mapJsonToBuffer = <T>(
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<T, Uint8Array> => source => source.pipe(
	mapJsonToText(options),
	mapTextToBuffer(options)
);

export const mapBufferToText = (
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<Uint8Array, string> => source => source.pipe(
	map(v => options.bufferToText(v))
);

export const bufferUntilTerminator = (
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<string, string[]> => source => source.pipe(
	mergeMap(text => from(splitInclusive(text, options.terminator))),
	filter(identity),
	bufferUntil(v => v === options.terminator),
);

export const bufferUntilTerminatorExclusive = (
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<string, string[]> => source => source.pipe(
	bufferUntilTerminator(options),
	map(v => slice(v, 0, size(v) - 1))
);

export const mapTextToJson = <T>(
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<string, T> => source => source.pipe(
	map(v => options.textToJson(v))
);

export const mapBufferToJson = <T>(
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<Uint8Array, T> => source => source.pipe(
	mapBufferToText(options),
	bufferUntilTerminatorExclusive(options),
	map(v => join(v, '')),
	mapTextToJson(options)
);