import { destroySubject, splitInclusive } from '../src';

describe('utility', () => {

	describe('splitInclusive', () => {

		it('breaks apart a string on the target separator, and includes the separator in the results', () => {
			expect(splitInclusive('tes\0t', '\0')).toEqual(['tes', '\0', 't']);
		});

		it('returns the entire string if the terminator does not exist in it', () => {
			expect(splitInclusive('test', '\0')).toEqual(['test']);
			expect(splitInclusive('', '\0')).toEqual([]); // does not consider empty strings valid
		});

		it('includes ending separators', () => {
			expect(splitInclusive('test\0', '\0')).toEqual(['test', '\0']);
		});
	});

	describe('destroySubject', () => {

		it('does not explode when given invalid input', () => {
			expect(() => destroySubject(null)).not.toThrowError();
		});
	});
});