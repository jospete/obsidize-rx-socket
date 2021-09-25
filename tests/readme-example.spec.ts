import { delay, first, tap } from 'rxjs/operators';

import { RxJsonSocket } from '../src';

describe('README Example', () => {

	it('can be executed', async () => {

		const sendMessage = { message: 'hello' };
		const receiveMessage = { message: 'world!' };

		const client = new RxJsonSocket();
		const server = new RxJsonSocket();

		client.setBufferReceiveSource(server.bufferStream.onSend.pipe(
			delay(10),
		));

		server.setBufferReceiveSource(client.bufferStream.onSend.pipe(
			delay(10),
			tap(() => server.emit(receiveMessage))
		));

		client.textStream.onSend.subscribe(v => console.log('client textStream.onSend: ' + v));
		client.textStream.onReceive.subscribe(v => console.log('client textStream.onReceive: ' + v));

		server.textStream.onSend.subscribe(v => console.log('server textStream.onSend: ' + v));
		server.textStream.onReceive.subscribe(v => console.log('server textStream.onReceive: ' + v));

		// The client and server sockets are "glued together" in such a way that we can
		// send a message and wait for a response all in one go - much like an HTTP or websocket request.
		const serverResponse = await client.send(sendMessage)
			.pipe(first())
			.toPromise();

		console.log(serverResponse); // { message: 'world!' }
	});
});