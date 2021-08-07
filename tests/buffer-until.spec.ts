import { of } from 'rxjs';
import { toArray } from 'rxjs/operators';

import { bufferUntil } from '../src';


describe('bufferUntil', () => {

	it('collects source emissions until the given predicate returns true for a particular state', async () => {

		const results = await of(1, 2, 4, 5, 8).pipe(
			bufferUntil(v => v % 4 === 0),
			toArray()
		).toPromise();

		expect(results).toEqual([
			[1, 2, 4],
			[5, 8]
		]);
	});

	it('does not flush incomplete buffers by default on source completion', async () => {

		const results = await of(1, 2, 4, 5, 10, 8).pipe(
			bufferUntil(v => v % 10 === 0),
			toArray()
		).toPromise();

		expect(results).toEqual([
			[1, 2, 4, 5, 10]
		]);
	});

	it('can be configured to flush incomplete buffers on source completion', async () => {

		const results = await of(10, 1, 2, 4, 5, 8).pipe(
			bufferUntil(v => v % 10 === 0, true),
			toArray()
		).toPromise();

		expect(results).toEqual([
			[10],
			[1, 2, 4, 5, 8]
		]);
	});
});