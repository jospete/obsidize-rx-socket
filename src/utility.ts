import { isFunction, get, every, forEach, split } from 'lodash';
import { Subject } from 'rxjs';

export const isSubscribable = (value: any): boolean => {
	return isFunction(get(value, 'subscribe'));
};

export const isUnsubscribable = (value: any): boolean => {
	return isFunction(get(value, 'unsubscribe'));
};

export const isErrorable = (value: any): boolean => {
	return isFunction(get(value, 'error'));
};

export const destroySubject = (subject: Subject<any>, errorMessage: string = 'destroyed'): void => {
	if (isErrorable(subject)) subject.error(errorMessage);
	if (isUnsubscribable(subject)) subject.unsubscribe();
};

export const destroyAllSubjects = (subjects: Subject<any>[], errorMessage?: string): void => {
	forEach(subjects, s => destroySubject(s, errorMessage));
};

export const isSubjectDestroyed = (subject: Subject<any>): boolean => {
	return !subject || (subject.closed && subject.isStopped);
};

export const allSubjectsDestroyed = (subjects: Subject<any>[]): boolean => {
	return every(subjects, isSubjectDestroyed);
};

export const splitInclusive = (value: string, separator: string): string[] => {
	return split(value, new RegExp(separator, 'g'));
};