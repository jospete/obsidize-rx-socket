import { JsonBufferMapOptions, JsonBufferMapUtility } from '../src';

describe('JsonBufferMapOptions', () => {

	const buildMessageBaseMetadata = () => {
		const messageJson = { message: 'hello!' };
		const messageText = '{"message":"hello!"}';
		const messageBytesWithoutTerminator = [0x7B, 0x22, 0x6D, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65, 0x22, 0x3A, 0x22, 0x68, 0x65, 0x6C, 0x6C, 0x6F, 0x21, 0x22, 0x7D];
		return { messageJson, messageText, messageBytesWithoutTerminator };
	};

	it('is a collection of utility functions for translating between JSON objects and buffers', () => {

		const { messageJson, messageText, messageBytesWithoutTerminator } = buildMessageBaseMetadata();
		const terminatorBytes = [0x00];
		const messageBytes = messageBytesWithoutTerminator.concat(terminatorBytes);
		const messageBuffer = Uint8Array.from(messageBytes);

		expect(JsonBufferMapUtility.jsonToStringWithTerminator(messageJson)).toEqual(messageText + JsonBufferMapUtility.NULL_TERMINATOR);
		expect(JsonBufferMapUtility.jsonToBuffer(messageJson)).toEqual(messageBuffer);
		expect(JsonBufferMapUtility.bufferToJson(messageBuffer)).toEqual(messageJson);
	});

	it('can be given custom options for data mutation', () => {


		const { messageJson, messageText, messageBytesWithoutTerminator } = buildMessageBaseMetadata();
		const terminatorBytes = [0x74, 0x65, 0x73, 0x74];
		const messageBytes = messageBytesWithoutTerminator.concat(terminatorBytes);
		const messageBuffer = Uint8Array.from(messageBytes);

		const customOptions: JsonBufferMapOptions = JsonBufferMapUtility.createOptions({
			terminator: 'test'
		});

		expect(JsonBufferMapUtility.jsonToStringWithTerminator(messageJson, customOptions)).toEqual(messageText + customOptions.terminator);
		expect(JsonBufferMapUtility.jsonToBuffer(messageJson, customOptions)).toEqual(messageBuffer);
		expect(JsonBufferMapUtility.bufferToJson(messageBuffer, customOptions)).toEqual(messageJson);
	});

	it('can handle messages that dont have a terminator', () => {

		const { messageText, messageBytesWithoutTerminator } = buildMessageBaseMetadata();
		const messageBuffer = Uint8Array.from(messageBytesWithoutTerminator);

		expect(JsonBufferMapUtility.bufferToStringWithoutTerminator(messageBuffer)).toEqual(messageText);
	});

	it('does not double-serialize json strings by default', () => {
		expect(JsonBufferMapUtility.jsonToString('test')).toBe('test');
	});
});