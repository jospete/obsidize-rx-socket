import { Subject } from 'rxjs';
import { delay, first } from 'rxjs/operators';

import { JsonBufferMapUtility, RxJsonSocket } from '../src';

describe('RxJsonSocket', () => {

	it('translates JSON messages to and from buffer messages for low-level transports', async () => {

		const sendMessage = { message: 'hello' };
		const receiveMessage = { message: 'world' };

		const receiveSource = new Subject<Uint8Array>();
		const socket = new RxJsonSocket();
		const socketBuffer = socket.createBufferSocket();

		socketBuffer.setReceiveSource(receiveSource);

		const sendResultPromise = socketBuffer.onSend.pipe(first()).toPromise();
		const receiveResultPromise = socketBuffer.onReceive.pipe(first()).toPromise();

		socketBuffer.onSend.pipe(delay(10)).subscribe(() => {
			receiveSource.next(socket.jsonToBuffer(receiveMessage));
		});

		socket.emit(sendMessage);

		const sendResult = await sendResultPromise;
		expect(sendResult).toEqual(socket.jsonToBuffer(sendMessage));
		expect(socket.bufferToJson(sendResult)).toEqual(sendMessage);

		const receiveResult = await receiveResultPromise;
		expect(receiveResult).toEqual(socket.jsonToBuffer(receiveMessage));
		expect(socket.bufferToJson(receiveResult)).toEqual(receiveMessage);
	});

	it('can accept custom options for buffer stream mutation', () => {
		const socket = new RxJsonSocket(JsonBufferMapUtility.createOptions({ terminator: 'test' }));
		const terminatedMessageStr = '{"message":"hello","test":true}test';
		const messageBuffer = JsonBufferMapUtility.stringToUint8Array(terminatedMessageStr);
		expect(socket.jsonToBuffer({ message: 'hello', test: true })).toEqual(messageBuffer);
	});
});