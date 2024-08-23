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
			message: 'Invalid JSON Object - Expected atleast two tokens got 1'
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

describe('test valid json array parser logic for flat jsons', () => {
	const parser = new JSONParser()

	test('parser returns empty array for valid empty json list', () => {
		const result = parser.parse([
			{ type: 'BracketOpen', value: '[' },
			{ type: 'BracketClose', value: ']' }
		])

		assert.deepEqual(result, [])
	})

	test('parser returns valid array for flat json list with numbers', () => {
		const tokens: Array<Token> = [
			{ type: 'BracketOpen', value: '[' },
			{ type: 'Number', value: '1' },
			{ type: 'Comma', value: ',' },
			{ type: 'Number', value: '2' },
			{ type: 'Comma', value: ',' },
			{ type: 'Number', value: '3' },
			{ type: 'BracketClose', value: ']' }
		]
		const result = parser.parse(tokens)

		assert.deepEqual(result, [1, 2, 3])
	})

	test('parser returns valid array for flat json list with strings', () => {
		const tokens: Array<Token> = [
			{ type: 'BracketOpen', value: '[' },
			{ type: 'String', value: 'abc' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'def' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'ghi' },
			{ type: 'BracketClose', value: ']' }
		]
		const result = parser.parse(tokens)

		assert.deepEqual(result, ['abc', 'def', 'ghi'])
	})

	test('parser returns valid array for flat json list with json objects', () => {
		const tokens: Array<Token> = [
			{ type: 'BracketOpen', value: '[' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'abc' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'numKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: '1234' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'Comma', value: ',' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'def' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'numKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: '5678' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'BracketClose', value: ']' }
		]
		const result = parser.parse(tokens)

		assert.deepEqual(result, [
			{ "strKey": "abc", "numKey": 1234 },
			{ "strKey": "def", "numKey": 5678 }
		])
	})
})

describe('test valid json list parsing logic for nested json arrays', () => {
	test('parser returns valid array for one level nested json list', () => {
		const parser = new JSONParser()
		const tokens: Array<Token> = [
			{ type: 'BracketOpen', value: '[' },
			{ type: 'BracketOpen', value: '[' },
			{ type: 'Number', value: '1' },
			{ type: 'Comma', value: ',' },
			{ type: 'Number', value: '2' },
			{ type: 'BracketClose', value: ']' },
			{ type: 'Comma', value: ',' },
			{ type: 'BracketOpen', value: '[' },
			{ type: 'Number', value: '3' },
			{ type: 'Comma', value: ',' },
			{ type: 'Number', value: '4' },
			{ type: 'BracketClose', value: ']' },
			{ type: 'BracketClose', value: ']' }
		]
		const result = parser.parse(tokens)

		assert.deepEqual(result, [[1, 2], [3, 4]])
	})

	test('parser returns valid json object for nested object containing array values whcih again contain json objects', () => {
		const parser = new JSONParser()
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
			{ type: 'String', value: 'listKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'BracketOpen', value: '[' },
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
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'strKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'strValue' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'numKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: '1234' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'BracketClose', value: ']' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'BraceClose', value: '}' }
		]

		const result = parser.parse(tokens)
		assert.deepStrictEqual(result, {
			"strKey": "abc",
			"objKey": {
				"strKey": "strValue",
				"numKey": 1234,
				"listKey": [
					{ "strKey": "strValue", "numKey": 1234 },
					{ "strKey": "strValue", "numKey": 1234 }
				]
			}
		})

	})
})

describe('test errors for invalid json arrays', () => {
	const parser = new JSONParser()
	test('parser throws error for invalid starting token', () => {
		assert.throws(() => parser.parse([
			{ type: 'BraceOpen', value: '{' },
			{ type: 'BracketClose', value: ']' }
		]), {
			name: 'Error',
			message: "Invalid JSON Object - Expected token of type String, got type BracketClose"
		})
	})

	test('parser throws error for malformatted json', () => {
		assert.throws(() => parser.parse([
			{ type: 'BracketOpen', value: '[' },
			{ type: 'BracketOpen', value: '[' }
		]), {
			name: 'Error',
			message: "Invalid JSON Array - Expected ',' or ']', got null"
		})

		assert.throws(() => parser.parse([
			{ type: 'BracketOpen', value: '[' },
			{ type: 'Number', value: '1' },
			{ type: 'BracketClose', value: ']' },
			{ type: 'Comma', value: ',' },
			{ type: 'BracketOpen', value: '[' },
			{ type: 'Number', value: '2' },
			{ type: 'BracketClose', value: ']' }
		]), {
			name: 'Error',
			message: 'Invalid JSON - Expected end of JSON, got ,'
		})

		assert.throws(() => parser.parse([
			{ type: 'BracketOpen', value: '[' },
		]), {
			name: 'Error',
			message: 'Invalid JSON Array - Expected atleast two tokens, got 1'
		})

		assert.throws(() => parser.parse([
			{ type: 'BracketOpen', value: '[' },
			{ type: 'Number', value: '1' },
			{ type: 'BracketClose', value: ']' },
			{ type: 'BracketClose', value: ']' }
		]), {
			name: 'Error',
			message: 'Invalid JSON - Expected end of JSON, got ]'
		})
	})
})