import { RxSocketSubject } from '../src';

describe('RxSocketSubject', () => {

	it('can be created', () => {
		const subject = new RxSocketSubject();
		expect(subject).toBeDefined();
	});
});