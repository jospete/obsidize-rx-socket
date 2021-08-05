import { defer, merge, Observable, Subject, Subscribable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { RxSocket } from './rx-socket';
import { Destroyable } from './destroyable';
import { TransformDuplex } from './transform-duplex';
import { ProxyObservable } from './proxy-observable';
import { destroySubject, isSubjectDestroyed } from './utility';

/**
 * Defines a 2-way duplex stream, where the caller can
 * send data across the "onSend" stream and listen for responses from the "onReceive" stream.
 * 
 * Use the send() method to perform a round-trip operation, and wait on receiver results directly.
 */
export class RxSocketSubject<T> extends RxSocket<T> implements Destroyable {

	protected readonly sendTriggerSubject: Subject<T>;
	protected readonly onSendProxy: ProxyObservable<T>;
	protected readonly onReceiveProxy: ProxyObservable<T>;

	constructor() {

		const sendProxy = new ProxyObservable<T>();
		const receiveProxy = new ProxyObservable<T>();
		super(sendProxy.onNext, receiveProxy.onNext);

		this.sendTriggerSubject = new Subject<T>();
		this.onSendProxy = sendProxy;
		this.onReceiveProxy = receiveProxy;
	}

	protected emitSendValue(value: T): void {
		this.sendTriggerSubject.next(value);
	}

	public setReceiveSource(source: Subscribable<T>): void {
		this.onReceiveProxy.setSource(source);
	}

	public setSendSource(source: Subscribable<T> | null): void {
		const compositeSource = source
			? merge(this.sendTriggerSubject, source)
			: this.sendTriggerSubject;
		this.onSendProxy.setSource(compositeSource);
	}

	public destroy(errorMessage?: string): void {
		destroySubject(this.sendTriggerSubject);
		this.onSendProxy.destroy(errorMessage);
		this.onReceiveProxy.destroy(errorMessage);
	}

	public isDestroyed(): boolean {
		return isSubjectDestroyed(this.sendTriggerSubject)
			&& this.onSendProxy.isDestroyed()
			&& this.onReceiveProxy.isDestroyed();
	}

	public send(value: T): Observable<T> {
		return defer(async () => this.emitSendValue(value)).pipe(
			switchMap(() => this.onReceive)
		);
	}

	public pipe(destination: RxSocketSubject<T>): void {
		destination.setSendSource(this.onSend);
		this.setReceiveSource(destination.onReceive);
	}

	public pipeTransform<V>(destination: RxSocketSubject<V>, duplex: TransformDuplex<T, V>): void {
		destination.setSendSource(this.sendAs(duplex.encode));
		this.setReceiveSource(destination.receiveAs(duplex.decode));
	}

	public transform<V>(duplex: TransformDuplex<T, V>): RxSocketSubject<V> {
		const result = new RxSocketSubject<V>();
		this.pipeTransform(result, duplex);
		return result;
	}
}