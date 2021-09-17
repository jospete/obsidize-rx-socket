import { delay, first, tap } from 'rxjs/operators';

import { RxJsonSocket } from '../src';

describe('General Usage', () => {

	it('can be used to send and receive data over a low level transport', async () => {

		const sendMessage = { message: 'hello' };
		const receiveMessage = { message: 'world!' };

		// Make a socket instance to communicate to a remote socket with.
		// In this case it will be the local server socket.
		const client = new RxJsonSocket();
		const clientReceiveSpy = jasmine.createSpy('clientReceiveSpy');

		// Make a server socket to generate fake responses with.
		const server = new RxJsonSocket();
		const serverReceiveSpy = jasmine.createSpy('serverReceiveSpy').and.callFake(() => server.emit(receiveMessage));

		// The client will receive buffer messages from the server socket directly
		client.setBufferReceiveSource(server.bufferStream.onSend.pipe(
			delay(10),
			tap(clientReceiveSpy)
		));

		// The server will receive buffer messages from the client directly
		server.setBufferReceiveSource(client.bufferStream.onSend.pipe(
			delay(10),
			tap(serverReceiveSpy)
		));

		// Debug output from the text layer of the client
		client.textStream.onSend.subscribe(v => console.log('client textStream.onSend: ' + v));
		client.textStream.onReceive.subscribe(v => console.log('client textStream.onReceive: ' + v));

		// Debug output from the text layer of the server
		server.textStream.onSend.subscribe(v => console.log('server textStream.onSend: ' + v));
		server.textStream.onReceive.subscribe(v => console.log('server textStream.onReceive: ' + v));

		// The client and server sockets are "glued together" in such a way that we can
		// send a message and wait for a response all in one go - much like an HTTP or websocket request.
		const serverResponse = await client.send(sendMessage)
			.pipe(first())
			.toPromise();

		const sendBuffer = client.jsonToBuffer(sendMessage);
		const receiveBuffer = client.jsonToBuffer(receiveMessage);

		// Check to make sure our messages got sent and received correctly.
		expect(serverResponse).toEqual(receiveMessage);
		expect(serverReceiveSpy).toHaveBeenCalledWith(sendBuffer);
		expect(clientReceiveSpy).toHaveBeenCalledWith(receiveBuffer);
	});
});