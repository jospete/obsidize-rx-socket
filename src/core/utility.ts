import { Subject } from 'rxjs';

export function identity<T>(value: T, ..._args: any[]): any {
	return value;
}

export function isFunction(value: any): boolean {
	return typeof value === 'function';
}

export function isString(value: any): boolean {
	return typeof value === 'string';
}

export function toString(value: any): string {
	return value + '';
}

export function isSubscribable(value: any): boolean {
	return !!value && isFunction(value.subscribe);
}

export function isUnsubscribable(value: any): boolean {
	return !!value && isFunction(value.unsubscribe);
}

export function isErrorable(value: any): boolean {
	return !!value && isFunction(value.error);
}

export function destroySubject(subject: Subject<any>, errorMessage: string = 'destroyed'): void {
	if (isErrorable(subject)) subject.error(errorMessage);
	if (isUnsubscribable(subject)) subject.unsubscribe();
}

export function destroyAllSubjects(subjects: Subject<any>[], errorMessage?: string): void {
	Array.from(subjects).forEach(s => destroySubject(s, errorMessage));
}

export function isSubjectDestroyed(subject: Subject<any>): boolean {
	return !subject || (subject.closed && subject.isStopped);
}

export function allSubjectsDestroyed(subjects: Subject<any>[]): boolean {
	return Array.from(subjects).every(isSubjectDestroyed);
}

export function isPopulatedString(value: any): boolean {
	return isString(value) && value.length > 0;
}

export function splitInclusive(value: string, separator: string): string[] {
	return toString(value).split(new RegExp('(' + separator + ')', 'g')).filter(isPopulatedString);
}