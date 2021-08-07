import { Observer, Subject, Subscribable, Unsubscribable, merge, throwError, Observable } from 'rxjs';
import { mergeMap, share, takeUntil } from 'rxjs/operators';

import { allSubjectsDestroyed, destroyAllSubjects, isSubscribable, isUnsubscribable } from './utility';
import { Destroyable } from './destroyable';

/**
 * Special flavor of an Observable that is undying, in that when the source completes or errors, 
 * this instance's stream will persist and wait for a new source to be set.
 * 
 * This allows us to hot-swap input and output streams without needing to manually recover
 * other subscribers to this instance.
 */
export class ProxyObservable<T> implements Destroyable {

	protected readonly onNextSubject = new Subject<T>();
	protected readonly onErrorSubject = new Subject<T>();
	protected readonly onCompleteSubject = new Subject<any>();

	private readonly sourceObserver: Observer<T> = {
		next: v => this.onNextSubject.next(v),
		error: e => this.onErrorSubject.next(e),
		complete: () => this.onCompleteSubject.next()
	};

	private activeSourceSubscription: Unsubscribable | null = null;

	public readonly onNext = this.onNextSubject.asObservable().pipe(share());
	public readonly onError = this.onErrorSubject.asObservable().pipe(share());
	public readonly onComplete = this.onCompleteSubject.asObservable().pipe(share());

	private getSubjectGroup(): Subject<any>[] {
		return [
			this.onNextSubject,
			this.onErrorSubject,
			this.onCompleteSubject
		];
	}

	public destroy(errorMessage?: string): void {
		destroyAllSubjects(this.getSubjectGroup(), errorMessage);
	}

	public isDestroyed(): boolean {
		return allSubjectsDestroyed(this.getSubjectGroup());
	}

	public setSource(source: Subscribable<T>): void {
		this.clearSource();
		if (!isSubscribable(source)) return;
		this.activeSourceSubscription = source.subscribe(this.sourceObserver);
	}

	public clearSource(): void {
		if (!isUnsubscribable(this.activeSourceSubscription)) return;
		this.activeSourceSubscription!.unsubscribe();
		this.activeSourceSubscription = null;
		this.onCompleteSubject.next();
	}

	public asObservable(): Observable<T> {
		return merge(
			this.onNext,
			this.onError.pipe(mergeMap(v => throwError(v)))
		).pipe(
			takeUntil(this.onComplete)
		);
	}
}