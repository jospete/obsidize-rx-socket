import { Subject } from 'rxjs';
import { delay, first, take } from 'rxjs/operators';
import { RxSocketSubject } from '../src';

describe('RxSocketSubject', () => {

	it('can be created', () => {
		const subject = new RxSocketSubject();
		expect(subject).toBeDefined();
	});

	it('can be destroyed', () => {
		const subject = new RxSocketSubject();
		expect(subject.isDestroyed()).toBe(false);
		subject.destroy();
		expect(subject.isDestroyed()).toBe(true);
	});

	it('can trigger send emissions', async () => {

		const subject = new RxSocketSubject();

		const testValue = 42;
		const sendResultPromise = subject.onSend.pipe(first()).toPromise();

		subject.emit(testValue);

		const sendResult = await sendResultPromise;
		expect(sendResult).toBe(testValue);
	});

	it('can send a valud and wait for a response', async () => {

		const testSend = 42;
		const testReceive = 55;

		const subject = new RxSocketSubject();
		const receiveSubject = new Subject();

		subject.setReceiveSource(receiveSubject);
		subject.onSend.pipe(delay(10)).subscribe(() => receiveSubject.next(testReceive));

		const sendResultPromise = subject.onSend.pipe(first()).toPromise();
		const receiveResult = await subject.send(testSend).pipe(first()).toPromise();
		const sendResult = await sendResultPromise;

		expect(sendResult).toBe(testSend);
		expect(receiveResult).toBe(testReceive);
	});

	it('can have its send source cleared via setting it to null', () => {
		const subject = new RxSocketSubject();
		expect(() => subject.setSendSource(null)).not.toThrowError();
	});

	it('can have its receive source cleared via setting it to null', () => {
		const subject = new RxSocketSubject();
		expect(() => subject.setReceiveSource(null)).not.toThrowError();
	});

	it('can intercept another sockets streams', async () => {

		const receiveSource = new Subject();
		const subject = new RxSocketSubject();
		const otherSubject = new RxSocketSubject();

		subject.intercept(otherSubject);
		otherSubject.setReceiveSource(receiveSource);

		const sendResultPromise = subject.onSend.pipe(first()).toPromise();
		const receiveResultPromise = subject.onReceive.pipe(first()).toPromise();

		otherSubject.emit(9001);
		receiveSource.next(1234);

		const sendResult = await sendResultPromise;
		expect(sendResult).toBe(9001);

		const receiveResult = await receiveResultPromise;
		expect(receiveResult).toBe(1234);
	});
});