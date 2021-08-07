import { delay, first, tap } from 'rxjs/operators';

import { RxJsonSocket } from '../src';

describe('General Usage', () => {

	it('can be used to send and receive data over a low level transport', async () => {

		const sendMessage = { message: 'hello' };
		const receiveMessage = { message: 'world!' };

		const client = new RxJsonSocket();
		const clientReceiveSpy = jasmine.createSpy('clientReceiveSpy');

		const server = new RxJsonSocket();
		const serverReceiveSpy = jasmine.createSpy('serverReceiveSpy').and.callFake(() => server.emit(receiveMessage));

		client.setBufferReceiveSource(server.bufferStream.onSend.pipe(
			delay(10),
			tap(clientReceiveSpy)
		));

		server.setBufferReceiveSource(client.bufferStream.onSend.pipe(
			delay(10),
			tap(serverReceiveSpy)
		));

		const serverResponse = await client.send(sendMessage)
			.pipe(first())
			.toPromise();

		const sendBuffer = client.jsonToBuffer(sendMessage);
		const receiveBuffer = client.jsonToBuffer(receiveMessage);

		expect(serverResponse).toEqual(receiveMessage);
		expect(serverReceiveSpy).toHaveBeenCalledWith(sendBuffer);
		expect(clientReceiveSpy).toHaveBeenCalledWith(receiveBuffer);
	});
});