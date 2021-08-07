export interface JsonBufferMapOptions {
	terminator: string;
	jsonToString(value: any): string;
	stringToBuffer(value: string): Uint8Array;
	bufferToString(value: Uint8Array): string;
	stringToJson(value: string): any;
}

export namespace JsonBufferMapUtility {

	export const NULL_TERMINATOR = '\0';
	export const jsonToString = JSON.stringify;
	export const stringToJson = JSON.parse;
	export const stringToUint8Array = (v: string) => (new TextEncoder().encode(v));
	export const uint8ArrayToString = (v: Uint8Array) => (new TextDecoder().decode(v));

	export const defaultOptions: JsonBufferMapOptions = {
		terminator: NULL_TERMINATOR,
		jsonToString: jsonToString,
		stringToBuffer: stringToUint8Array,
		bufferToString: uint8ArrayToString,
		stringToJson: stringToJson,
	};

	export const createOptions = (
		customOptions: Partial<JsonBufferMapOptions>
	): JsonBufferMapOptions => {
		return Object.assign({}, defaultOptions, customOptions);
	};

	export const jsonToStringWithTerminator = (
		value: any,
		options: JsonBufferMapOptions = defaultOptions
	): string => {
		return options.jsonToString(value) + options.terminator;
	};

	export const jsonToBuffer = (
		value: any,
		options: JsonBufferMapOptions = defaultOptions
	): Uint8Array => {
		const text = jsonToStringWithTerminator(value, options);
		return options.stringToBuffer(text);
	};

	export const bufferToStringWithoutTerminator = (
		value: Uint8Array,
		options: JsonBufferMapOptions = defaultOptions
	): string => {
		const textWithTerminator = options.bufferToString(value);
		const terminatorPosition = textWithTerminator.lastIndexOf(options.terminator);
		return terminatorPosition < 0 ? textWithTerminator : textWithTerminator.substring(0, terminatorPosition);
	};

	export const bufferToJson = (
		value: Uint8Array,
		options: JsonBufferMapOptions = defaultOptions
	): any => {
		const text = bufferToStringWithoutTerminator(value, options)
		return options.stringToJson(text);
	};
}