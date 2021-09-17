import { Observable, Subscribable } from 'rxjs';

import { JsonBufferMapOptions, JsonBufferMapUtility } from './json-buffer-map-options';
import { mapBufferToString, mapJsonToString, mapStringToBuffer, mapStringToTerminatedJson } from './operators';
import { RxSocketSubject } from './rx-socket-subject';

/**
 * Special variant of an RxSocketSubject that translates between regular JS objects and ArrayBuffer streams.
 * Best used for sending high-level protocol values over a low-level stream.
 */
export class RxJsonSocket {

	protected readonly jsonStreamSubject = new RxSocketSubject<any>();
	protected readonly textStreamSubject = new RxSocketSubject<string>();
	protected readonly bufferStreamSubject = new RxSocketSubject<Uint8Array>();

	public readonly jsonStream = this.jsonStreamSubject.toReadOnly();
	public readonly textStream = this.textStreamSubject.toReadOnly();
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

		this.textStreamSubject.setSendSource(
			this.jsonStream.onSend.pipe(mapJsonToString(this.options))
		);

		this.bufferStreamSubject.setSendSource(
			this.textStream.onSend.pipe(mapStringToBuffer(this.options))
		);

		this.textStreamSubject.setReceiveSource(
			this.bufferStream.onReceive.pipe(mapBufferToString(this.options))
		);

		this.jsonStreamSubject.setReceiveSource(
			this.textStream.onReceive.pipe(mapStringToTerminatedJson(this.options))
		);
	}
}