import { from, OperatorFunction } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { identity, join, slice, size } from 'lodash';

import { JsonBufferMapOptions, JsonBufferMapUtility } from './json-buffer-map-options';
import { bufferUntil } from './buffer-until';
import { splitInclusive } from './utility';

export const mapJsonToString = <T>(
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<T, string> => source => source.pipe(
	map(v => JsonBufferMapUtility.jsonToStringWithTerminator(v, options))
);

export const mapStringToBuffer = (
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<string, Uint8Array> => source => source.pipe(
	map(v => options.stringToBuffer(v))
);

export const mapJsonToBuffer = <T>(
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<T, Uint8Array> => source => source.pipe(
	mapJsonToString(options),
	mapStringToBuffer(options)
);

export const mapBufferToString = (
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<Uint8Array, string> => source => source.pipe(
	map(v => options.bufferToString(v))
);

export const bufferUntilTerminator = (
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<string, string[]> => source => source.pipe(
	map(str => splitInclusive(str, options.terminator).filter(identity)),
	filter(strArray => size(strArray) > 0),
	mergeMap(strArray => from(strArray)),
	filter(identity),
	bufferUntil(v => v === options.terminator),
);

export const bufferUntilTerminatorExclusive = (
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<string, string[]> => source => source.pipe(
	bufferUntilTerminator(options),
	map(v => slice(v, 0, size(v) - 1))
);

export const mapStringToJson = <T>(
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<string, T> => source => source.pipe(
	map(v => options.stringToJson(v))
);

export const mapBufferToJson = <T>(
	options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
): OperatorFunction<Uint8Array, T> => source => source.pipe(
	mapBufferToString(options),
	bufferUntilTerminatorExclusive(options),
	map(v => join(v, '')),
	mapStringToJson(options)
);