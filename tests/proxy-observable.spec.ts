import { Subject } from 'rxjs';
import { skip, takeUntil, toArray } from 'rxjs/operators';

import { destroySubject, ProxyObservable } from '../src';

describe('ProxyObservable', () => {

	it('allows subscribers to ignore intermittent recreation of the backing source', async () => {

		const emitter = new Subject<string>();
		const proxy = new ProxyObservable<string>();
		proxy.setSource(emitter);

		const resultPromise = proxy.onNext.pipe(
			takeUntil(proxy.onComplete.pipe(skip(1))),
			toArray()
		).toPromise();

		emitter.next('test1');
		destroySubject(emitter);

		const emitter2 = new Subject<string>();
		proxy.setSource(emitter2);

		emitter2.next('test2');
		emitter2.complete();

		const result = await resultPromise;
		expect(result).toEqual(['test1', 'test2']);
	});

	it('can be destroyed', () => {
		const proxy = new ProxyObservable<string>();
		expect(proxy.isDestroyed()).toBe(false);
		proxy.destroy();
		expect(proxy.isDestroyed()).toBe(true);
	});

	it('can be collapsed back to an observable', async () => {

		const emitter = new Subject<string>();
		const proxy = new ProxyObservable<string>();
		proxy.setSource(emitter);

		const errorContent = 'destroyed';
		const errorPromise = proxy.asObservable().toPromise().catch(e => e);
		destroySubject(emitter, errorContent);

		const error = await errorPromise;
		expect(error).toBe(errorContent);
		expect(proxy.isDestroyed()).toBe(false);
	});
});