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

	export const jsonToText = (
		value: any,
		options: JsonBufferMapOptions = defaultOptions
	): string => {
		return options.jsonToText(value) + options.terminator;
	};

	export const jsonToBuffer = (
		value: any,
		options: JsonBufferMapOptions = defaultOptions
	): Uint8Array => {
		const text = jsonToText(value, options);
		return options.textToBuffer(text);
	};

	export const bufferToTextWithoutTerminator = (
		value: Uint8Array,
		options: JsonBufferMapOptions = defaultOptions
	): string => {
		const textWithTerminator = options.bufferToText(value);
		const terminatorPosition = textWithTerminator.lastIndexOf(options.terminator);
		return terminatorPosition < 0 ? textWithTerminator : textWithTerminator.substring(0, terminatorPosition);
	};

	export const bufferToJson = (
		value: Uint8Array,
		options: JsonBufferMapOptions = defaultOptions
	): any => {
		const text = bufferToTextWithoutTerminator(value, options)
		return options.textToJson(text);
	};
}