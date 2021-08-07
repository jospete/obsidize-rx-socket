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

	public jsonToBuffer(value: any): Uint8Array {
		return JsonBufferMapUtility.jsonToBuffer(value, this.options);
	}

	public bufferToJson(value: Uint8Array): any {
		return JsonBufferMapUtility.bufferToJson(value, this.options);
	}

	public setBufferSocket(bufferSocket: RxSocketSubject<Uint8Array>): void {
		if (!bufferSocket) return;
		bufferSocket.setReceiveSource(this.onSend.pipe(mapJsonToBuffer(this.options)));
		this.setReceiveSource(bufferSocket.onReceive.pipe(mapBufferToJson(this.options)));
	}

	public createBufferSocket(): RxSocketSubject<Uint8Array> {
		const result = new RxSocketSubject<Uint8Array>();
		this.setBufferSocket(result);
		return result;
	}
}