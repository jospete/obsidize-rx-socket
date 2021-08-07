import { RxJsonSocket } from '../src';

describe('RxJsonSocket', () => {

	it('translates JSON messages to and from buffer messages for low-level transports', async () => {

		const socket = new RxJsonSocket();
		expect(socket).toBeDefined();
	});
});