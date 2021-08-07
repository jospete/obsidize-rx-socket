import { merge, defer, Observable, Subject, Subscribable } from 'rxjs';
import { ignoreElements } from 'rxjs/operators';

import { RxSocket } from './rx-socket';
import { Destroyable } from './destroyable';
import { ProxyObservable } from './proxy-observable';
import { destroySubject, isSubjectDestroyed, isSubscribable } from './utility';

export type SendAction<T> = (value: T) => Observable<any>;

/**
 * Defines a 2-way duplex stream, where the caller can
 * send data across the "onSend" stream and listen for responses from the "onReceive" stream.
 * 
 * Use the send() method to perform a round-trip operation, and wait on receiver results directly.
 */
export class RxSocketSubject<T> extends RxSocket<T> implements Destroyable {

	protected readonly mOnSendSubject: Subject<T>;
	protected readonly onSendProxy: ProxyObservable<T>;
	protected readonly onReceiveProxy: ProxyObservable<T>;

	constructor(
		onSend?: Subscribable<T>,
		onReceive?: Subscribable<T>
	) {

		const sendSubject = new Subject<T>();
		const sendProxy = new ProxyObservable<T>();
		const receiveProxy = new ProxyObservable<T>();

		super(sendProxy.onNext, receiveProxy.onNext);

		this.mOnSendSubject = sendSubject;
		this.onSendProxy = sendProxy;
		this.onReceiveProxy = receiveProxy;

		this.pipe(onSend!, onReceive!);
	}

	public destroy(errorMessage?: string): void {
		destroySubject(this.mOnSendSubject);
		this.onSendProxy.destroy(errorMessage);
		this.onReceiveProxy.destroy(errorMessage);
	}

	public isDestroyed(): boolean {
		return isSubjectDestroyed(this.mOnSendSubject)
			&& this.onSendProxy.isDestroyed()
			&& this.onReceiveProxy.isDestroyed();
	}

	public emit(value: T): void {
		this.mOnSendSubject.next(value);
	}

	public setReceiveSource(source: Subscribable<T>): void {
		this.onReceiveProxy.setSource(source);
	}

	public setSendSource(source: Subscribable<T>): void {
		const sendObservable = this.mOnSendSubject.asObservable();
		const combinedSource = isSubscribable(source) ? merge(source, sendObservable) : sendObservable;
		this.onSendProxy.setSource(combinedSource);
	}

	public send(value: T): Observable<T> {
		return merge(
			defer(() => Promise.resolve(this.emit(value))).pipe(ignoreElements()),
			this.onReceive
		);
	}

	public pipe(onSend: Subscribable<T>, onReceive: Subscribable<T>): void {
		this.setSendSource(onSend);
		this.setReceiveSource(onReceive);
	}

	public pipeTo(destination: RxSocket<T>): void {
		this.pipe(destination.onSend, destination.onReceive);
	}
}