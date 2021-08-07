import { Observable, Subscribable } from 'rxjs';

import { JsonBufferMapOptions, JsonBufferMapUtility } from './json-buffer-map-options';
import { mapBufferToJson, mapJsonToBuffer } from './operators';
import { RxSocketSubject } from './rx-socket-subject';

/**
 * Special variant of an RxSocketSubject that translates between regular JS objects and ArrayBuffer streams.
 * Best used for sending high-level protocol values over a low-level stream.
 */
export class RxJsonSocket {

	protected readonly jsonStreamSubject = new RxSocketSubject<Uint8Array>();
	protected readonly bufferStreamSubject = new RxSocketSubject<Uint8Array>();

	public readonly jsonStream = this.jsonStreamSubject.toReadOnly();
	public readonly bufferStream = this.bufferStreamSubject.toReadOnly();

	constructor(
		public options: JsonBufferMapOptions = JsonBufferMapUtility.defaultOptions
	) {
		this.linkStreams();
	}

	public jsonToBuffer(value: any): Uint8Array {
		return JsonBufferMapUtility.jsonToBuffer(value, this.options);
	}

	public bufferToJson(value: Uint8Array): any {
		return JsonBufferMapUtility.bufferToJson(value, this.options);
	}

	public setBufferReceiveSource(source: Subscribable<Uint8Array>): void {
		this.bufferStreamSubject.setReceiveSource(source);
	}

	public emit(jsonMessage: any): void {
		this.jsonStreamSubject.emit(jsonMessage);
	}

	public send(jsonMessage: any): Observable<any> {
		return this.jsonStreamSubject.send(jsonMessage);
	}

	protected linkStreams(): void {

		this.bufferStreamSubject.setSendSource(
			this.jsonStream.onSend.pipe(mapJsonToBuffer(this.options))
		);

		this.jsonStreamSubject.setReceiveSource(
			this.bufferStream.onReceive.pipe(mapBufferToJson(this.options))
		);
	}
}