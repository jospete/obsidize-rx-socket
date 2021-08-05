import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Readonly definition of a 2-way stream.
 */
export class RxSocket<T> {

	constructor(
		public readonly onSend: Observable<T>,
		public readonly onReceive: Observable<T>
	) {
	}

	public sendAs<V>(mutate: (value: T) => V): Observable<V> {
		return this.onSend.pipe(map(mutate));
	}

	public receiveAs<V>(mutate: (value: T) => V): Observable<V> {
		return this.onReceive.pipe(map(mutate));
	}

	public toReadOnly(): RxSocket<T> {
		return new RxSocket(this.onSend, this.onReceive);
	}
}