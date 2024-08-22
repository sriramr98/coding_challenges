import test, { describe } from "node:test";
import assert from "node:assert";
import { JSONParser } from "..";
import { Token } from "../types";

describe('parser returns json for valid flat json', () => {
	const parser = new JSONParser()

	test('parser returns empty object for valid empty object', () => {
		const result = parser.parse([
			{ type: 'BraceOpen', value: '{' },
			{ type: 'BraceClose', value: '}' }
		])

		assert.deepEqual(result, {})
	})

	// test('parser returns empty array for valid empty json list', () => {
	// 	const result = parser.parse([
	// 		{ type: 'BracketOpen', value: '[' },
	// 		{ type: 'BracketClose', value: ']' }
	// 	])

	// 	assert.deepEqual(result, [])
	// })

	test('parser returns valid object for flat json object', () => {
		const tokens: Array<Token> = [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'abc' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'numKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: '1234' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'nullKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Null', value: 'null' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'trueKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'True', value: 'true' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'falseKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'False', value: 'false' },
			{ type: 'BraceClose', value: '}' }
		]
		const result = parser.parse(tokens)

		const json = { "strKey": "abc", "numKey": 1234, "nullKey": null, "trueKey": true, "falseKey": false }
		assert.deepEqual(result, json)
	})
})

describe('parser returns json for valid nested json', () => {
	const parser = new JSONParser()
	test('parser returns valid object for one level nested json object', () => {
		const tokens: Array<Token> = [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'abc' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'objKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'strValue' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'numKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: '1234' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'nullKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Null', value: 'null' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'trueKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'True', value: 'true' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'falseKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'False', value: 'false' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'BraceClose', value: '}' }
		]

		const result = parser.parse(tokens)
		assert.deepStrictEqual(result, {
			"strKey": "abc",
			"objKey": {
				"strKey": "strValue",
				"numKey": 1234,
				"nullKey": null,
				"trueKey": true,
				"falseKey": false
			}
		})
	})

	test('parser returns valid object for two root level keys with one level nested json object', () => {
		const tokens: Array<Token> = [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'abc' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'objKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'strValue' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'numKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: '1234' },	
			{ type: 'BraceClose', value: '}' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'objKey2' },
			{ type: 'Colon', value: ':' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'strValue' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'numKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: '1234' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'BraceClose', value: '}' }
		]
		const result = parser.parse(tokens)
		assert.deepStrictEqual(result, {
			"strKey": "abc",
			"objKey": {
				"strKey": "strValue",
				"numKey": 1234
			},
			"objKey2": {
				"strKey": "strValue",
				"numKey": 1234
			}
		})
	})

	test('parser returns valid object for two level nested json object', () => {
		const tokens: Array<Token> = [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'abc' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'objKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'strValue' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'numKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: '1234' },	
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'objKey2' },
			{ type: 'Colon', value: ':' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'strValue' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'numKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: '1234' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'BraceClose', value: '}' }
		]
		const result = parser.parse(tokens)
		assert.deepStrictEqual(result, {
			"strKey": "abc",
			"objKey": {
				"strKey": "strValue",
				"numKey": 1234,
				"objKey2": {
					"strKey": "strValue",
					"numKey": 1234
				}
			}
		})
	})

	test('parser returns valid object for two root keys with two level nested json object', () => {
		const tokens: Array<Token> = [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'abc' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'objKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'strValue' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'numKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: '1234' },	
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'objKey2' },
			{ type: 'Colon', value: ':' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'strValue' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'numKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: '1234' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'objKey1' },
			{ type: 'Colon', value: ':' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'strValue' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'numKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: '1234' },	
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'objKey2' },
			{ type: 'Colon', value: ':' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'strValue' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'numKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: '1234' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'BraceClose', value: '}' }
		]
		const result = parser.parse(tokens)
		assert.deepStrictEqual(result, {
			"strKey": "abc",
			"objKey": {
				"strKey": "strValue",
				"numKey": 1234,
				"objKey2": {
					"strKey": "strValue",
					"numKey": 1234
				}
			},
			"objKey1": {
				"strKey": "strValue",
				"numKey": 1234,
				"objKey2": {
					"strKey": "strValue",
					"numKey": 1234
				}
			}
		})
	})
})


describe('parser throws error for invalid json', () => {
	const parser = new JSONParser()
	test('parser throws error for invalid starting token', () => {
		assert.throws(() => parser.parse([
			{ type: 'Comma', value: ',' },
			{ type: 'BracketClose', value: ']' }
		]), {
			name: 'Error',
			message: "Invalid start of JSON - Expected '[' or '{' but got ,"
		})
	})

	test('parser throws error for malformatted json', () => {
		assert.throws(() => parser.parse([
			{ type: 'BraceOpen', value: '{' },
			{ type: 'BraceOpen', value: '{' }
		]), {
			name: 'Error',
			message: 'Invalid JSON Object - Expected token of type String, got type BraceOpen'
		})

		assert.throws(() => parser.parse([
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'value' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'Comma', value: ',' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'BraceClose', value: '}' }
		]), {
			name: 'Error',
			message: 'Invalid JSON - Expected end of JSON, got ,'
		})

		assert.throws(() => parser.parse([
			{ type: 'BraceOpen', value: '{' },
		]), {
			name: 'Error',
			message: 'Invalid JSON Object at pos 0'
		})

		assert.throws(() => parser.parse([
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'value' },
		]), {
			name: 'Error',
			message: "Invalid JSON Object - Expected ',' or '}', got null"
		})
	})


})
