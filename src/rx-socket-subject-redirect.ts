import { Observable, of, Subscription } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';

import { RxSocketSubject } from './rx-socket-subject';

/**
 * Simple extension that redirects incoming onReceive events to the onSend pipe.
 * Override the handle() method to include custom redirect functionality.
 */
export class RxSocketSubjectRedirect<T> extends RxSocketSubject<T> {

	private mRedirectSub: Subscription | null = null;

	public readonly onRedirect = this.onReceive.pipe(
		mergeMap(request => this.handle(request)),
		tap(response => this.send(response))
	);

	public handle(request: T): Observable<T> {
		return of(request);
	}

	public destroy(): void {
		this.disableRedirect();
		super.destroy();
	}

	public disableRedirect(): this {
		this.mRedirectSub?.unsubscribe();
		this.mRedirectSub = null;
		return this;
	}

	public enableRedirect(): this {
		this.disableRedirect();
		this.mRedirectSub = this.onRedirect.subscribe();
		return this;
	}
}