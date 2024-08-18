import test, { describe } from "node:test";
import assert from "node:assert";

import { parseTokens, Token, tokenize } from "..";

describe('parser returns empty json for valid empty json', () => {
	test('parser returns empty object for valid empty object', () => {
		const result = parseTokens([
			{ type: 'BraceOpen', value: '{' },
			{ type: 'BraceClose', value: '}' }
		])

		assert.deepEqual(result, {})
	})

	test('parser returns empty array for valid empty json list', () => {
		const result = parseTokens([
			{ type: 'BracketOpen', value: '[' },
			{ type: 'BracketClose', value: ']' }
		])

		assert.deepEqual(result, [])
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
		const result = parseTokens(tokens)

		const json = { "strKey": "abc", "numKey": 1234, "nullKey": null, "trueKey": true, "falseKey": false }
		assert.deepEqual(result, json)
	})
})


describe('parser throws error for invalid json', () => {
	test('parser throws error for invalid starting token', () => {
		assert.throws(() => parseTokens([
			{ type: 'Comma', value: ',' },
			{ type: 'BracketClose', value: ']' }
		]), {
			name: 'Error',
			message: 'Invalid token: ,'
		})
	})

	test('parser throws error for malformatted json', () => {
		assert.throws(() => parseTokens([
			{ type: 'BraceOpen', value: '{' },
			{ type: 'BraceOpen', value: '{' }
		]), {
			name: 'Error',
			message: 'Invalid JSON Object at pos 1'
		})

		assert.throws(() => parseTokens([
			{ type: 'BraceOpen', value: '{' },
		]), {
			name: 'Error',
			message: 'Invalid JSON Object at pos 0'
		})

		assert.throws(() => parseTokens([
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'value' },
		]), {
			name: 'Error',
			message: 'Invalid JSON Object at pos 3'
		})
	})

	
})
