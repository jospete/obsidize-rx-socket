import { from, of } from 'rxjs';
import { first } from 'rxjs/operators';

import {
	bufferUntilTerminator,
	bufferUntilTerminatorExclusive,
	JsonBufferMapUtility,
	mapBufferToJson,
	mapBufferToString,
	mapJsonToBuffer,
	mapJsonToString,
	mapStringToBuffer,
	mapStringToJson,
	mapStringToTerminatedJson
} from '../src';

describe('operators', () => {

	describe('mapJsonToString()', () => {

		it('translates incoming json values into outbound string values', async () => {
			const input = { message: 'hello' };
			const result = await of(input).pipe(mapJsonToString(), first()).toPromise();
			expect(result).toEqual(JsonBufferMapUtility.jsonToStringWithTerminator(input));
		});
	});

	describe('mapStringToBuffer()', () => {

		it('translates incoming string values into outbound buffer values', async () => {
			const input = JSON.stringify({ message: 'hello' });
			const result = await of(input).pipe(mapStringToBuffer(), first()).toPromise();
			expect(result).toEqual(JsonBufferMapUtility.stringToUint8Array(input));
		});
	});

	describe('mapJsonToBuffer()', () => {

		it('translates incoming json values into outbound buffer values', async () => {
			const input = { message: 'hello' };
			const result = await of(input).pipe(mapJsonToBuffer(), first()).toPromise();
			expect(result).toEqual(JsonBufferMapUtility.jsonToBuffer(input));
		});

		it('uses custom options when they are given', async () => {
			const input = { message: 'hello' };
			const options = JsonBufferMapUtility.createOptions({ terminator: 'test' });
			const result = await of(input).pipe(mapJsonToBuffer(options), first()).toPromise();
			expect(result).toEqual(JsonBufferMapUtility.jsonToBuffer(input, options));
		});
	});

	describe('mapBufferToString()', () => {

		it('translates incoming json values into outbound buffer values', async () => {
			const inputJson = { message: 'hello' };
			const input = JsonBufferMapUtility.jsonToBuffer(inputJson);
			const result = await of(input).pipe(mapBufferToString(), first()).toPromise();
			expect(result).toEqual(JsonBufferMapUtility.jsonToStringWithTerminator(inputJson));
		});
	});

	describe('bufferUntilTerminator()', () => {

		it('collects values until a matching terminator emission is found', async () => {
			const input = ['{"message":', '"hello', '"}', JsonBufferMapUtility.NULL_TERMINATOR, 'extra stuff'];
			const result = await from(input).pipe(bufferUntilTerminator(), first()).toPromise();
			expect(result).toEqual(['{"message":', '"hello', '"}', JsonBufferMapUtility.NULL_TERMINATOR]);
		});
	});

	describe('bufferUntilTerminatorExclusive()', () => {

		it('collects values until a terminator is found, and omits the terminator from the output', async () => {
			const input = ['{"message":', '"hello', '"}', JsonBufferMapUtility.NULL_TERMINATOR, 'extra stuff'];
			const result = await from(input).pipe(bufferUntilTerminatorExclusive(), first()).toPromise();
			expect(result).toEqual(['{"message":', '"hello', '"}']);
		});
	});

	describe('mapStringToJson()', () => {

		it('performs a direct json parse on source inputs', async () => {
			const result = await of('{"message":"hello"}').pipe(mapStringToJson(), first()).toPromise();
			expect(result).toEqual({ message: 'hello' });
		});
	});

	describe('mapStringToTerminatedJson()', () => {

		it('collects values until a terminator is found, and omits the terminator from the output', async () => {
			const input = '{"message":"hello"}' + JsonBufferMapUtility.NULL_TERMINATOR;
			const result = await of(input).pipe(mapStringToTerminatedJson(), first()).toPromise();
			expect(result).toEqual({ message: 'hello' });
		});
	});

	describe('mapBufferToJson()', () => {

		it('collects values until a terminator is found, and omits the terminator from the output', async () => {
			const input = JsonBufferMapUtility.jsonToBuffer({ message: "hello" });
			const result = await of(input).pipe(mapBufferToJson(), first()).toPromise();
			expect(result).toEqual({ message: 'hello' });
		});

		it('accepts custom options as an argument', async () => {
			const options = JsonBufferMapUtility.createOptions({ terminator: 'test' });
			const input = JsonBufferMapUtility.jsonToBuffer({ message: "hello" }, options);
			const result = await of(input).pipe(mapBufferToJson(options), first()).toPromise();
			expect(result).toEqual({ message: 'hello' });
		});
	});
});