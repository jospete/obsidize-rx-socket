export interface JsonBufferMapOptions {
	terminator: string;
	jsonToText(value: any): string;
	textToJson(value: string): any;
	textToBuffer(value: string): Uint8Array;
	bufferToText(value: Uint8Array): string;
}

export namespace JsonBufferMapUtility {

	export const NULL_TERMINATOR = '\0';
	export const jsonToString = JSON.stringify;
	export const stringToJson = JSON.parse;
	export const stringToUint8Array = (v: string) => (new TextEncoder().encode(v));
	export const uint8ArrayToString = (v: Uint8Array) => (new TextDecoder().decode(v));

	export const defaultOptions: JsonBufferMapOptions = {
		terminator: NULL_TERMINATOR,
		jsonToText: jsonToString,
		textToJson: stringToJson,
		textToBuffer: stringToUint8Array,
		bufferToText: uint8ArrayToString,
	};
}