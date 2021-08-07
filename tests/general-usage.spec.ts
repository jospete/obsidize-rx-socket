import { delay, first } from 'rxjs/operators';

import { RxJsonSocket } from '../src';

describe('General Usage', () => {

	it('can be used to send and receive data over a low level transport', async () => {

		const sendMessage = { message: 'hello' };
		const receiveMessage = { message: 'world!' };

		const client = new RxJsonSocket();
		const clientBuffer = client.createBufferSocket();
		const clientReceiveSpy = jasmine.createSpy('clientReceiveSpy');

		const server = new RxJsonSocket();
		const serverBuffer = server.createBufferSocket();
		const serverReceiveSpy = jasmine.createSpy('serverReceiveSpy').and.callFake(v => {
			if (v && v.message === sendMessage.message) {
				server.emit(receiveMessage);
			}
		});

		clientBuffer.setReceiveSource(serverBuffer.onSend.pipe(delay(10)));
		client.onReceive.subscribe(clientReceiveSpy);

		serverBuffer.setReceiveSource(clientBuffer.onSend.pipe(delay(10)));
		server.onReceive.subscribe(serverReceiveSpy);

		// const serverResponse = await client.send(sendMessage)
		// 	.pipe(first())
		// 	.toPromise();

		// expect(serverResponse).toEqual(receiveMessage);
		// expect(clientReceiveSpy).toHaveBeenCalledWith(receiveMessage);
		// expect(serverReceiveSpy).toHaveBeenCalledWith(sendMessage);
	});
});