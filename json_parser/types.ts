export type JSONValue = string | boolean | number | JSONObject | JSONArray | null

export interface JSONObject {
	[key: string]: JSONValue
}

export type JSONArray = Array<JSONValue>

export type Json = JSONObject | JSONArray

export type TokenType =
	| "BraceOpen"
	| "BraceClose"
	| "BracketOpen"
	| "BracketClose"
	| "String"
	| "Number"
	| "Comma"
	| "Colon"
	| "True"
	| "False"
	| "Null";

export interface Token {
	type: TokenType
	value: string
}