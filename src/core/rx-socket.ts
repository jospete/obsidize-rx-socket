import { Observable } from 'rxjs';

/**
 * Readonly definition of a 2-way stream.
 */
export class RxSocket<T> {

	constructor(
		public readonly onSend: Observable<T>,
		public readonly onReceive: Observable<T>
	) {
	}

	public toReadOnly(): RxSocket<T> {
		return new RxSocket(this.onSend, this.onReceive);
	}
}