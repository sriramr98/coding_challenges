import test, { describe } from "node:test";
import assert from "node:assert";

import { parseTokens, tokenize } from "..";

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
		const json = '{ "strKey": "abc", "numKey": 1234, "nullKey": null, "trueKey": true, "falseKey": false }'
		const tokens = tokenize(json)
		const result = parseTokens(tokens)

		assert.deepEqual(result, JSON.parse(json))
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
	})
})
