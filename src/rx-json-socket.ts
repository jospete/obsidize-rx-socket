import { JsonBufferMapOptions, JsonBufferMapUtility } from './json-buffer-map-options';
import { mapBufferToJson, mapJsonToBuffer } from './operators';
import { RxSocketSubject } from './rx-socket-subject';

/**
 * Special variant of an RxSocketSubject that translates between regular JS objects and ArrayBuffer streams.
 * Best used for sending high-level protocol values over a low-level stream.
 */
export class RxJsonSocket extends RxSocketSubject<any> {

	constructor(
		public options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
	) {
		super();
	}

	public pipeTransformBufferSocket(bufferSocket: RxSocketSubject<Uint8Array>): void {
		if (!bufferSocket) return;
		bufferSocket.setSendSource(this.onSend.pipe(mapJsonToBuffer(this.options)));
		this.setReceiveSource(bufferSocket.onReceive.pipe(mapBufferToJson(this.options)));
	}
}