import { first } from 'rxjs/operators';

import { mapBufferToJson, mapJsonToBuffer, RxSocketSubject } from '../src';

describe('General Usage', () => {

	it('can be used to send and receive data over a low level transport', async () => {

		const client = new RxSocketSubject<any>();
		const clientBuffer = new RxSocketSubject<Uint8Array>();
		const clientReceiveSpy = jasmine.createSpy('clientReceiveSpy');
		clientBuffer.onReceive.subscribe(clientReceiveSpy);

		const server = new RxSocketSubject<any>();
		const serverBuffer = new RxSocketSubject<Uint8Array>();
		const serverReceiveSpy = jasmine.createSpy('serverReceiveSpy');
		serverBuffer.onReceive.subscribe(serverReceiveSpy);

		client.onSend.pipe(
			mapJsonToBuffer(),
		)

		clientBuffer.setReceiveSource(serverBuffer.onSend);
		serverBuffer.setReceiveSource(clientBuffer.onSend);
		server.setReceiveSource(serverBuffer.onReceive.pipe(mapBufferToJson()));

		const sendMessage = { message: 'hello' };
		const receiveMessage = { message: 'world!' };

		const serverResponse = await client.send(sendMessage)
			.pipe(first())
			.toPromise();

		expect(serverResponse).toEqual(receiveMessage);
	});
});