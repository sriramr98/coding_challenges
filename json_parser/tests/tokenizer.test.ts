import test, { describe } from "node:test";
import assert from "node:assert";
import { JSONTokenizer } from "..";

describe('test tokenizer success scenarios', () => {
	test('tokenizer returns valid tokens for empty object', () => {
		const tokens = JSONTokenizer.tokenize("{}")
		assert.deepStrictEqual(tokens, [{ type: 'BraceOpen', value: '{' }, { type: 'BraceClose', value: '}' }])
	})

	test('tokenizer returns valid tokens for empty array', () => {
		const tokens = JSONTokenizer.tokenize("[]")
		assert.deepStrictEqual(tokens, [{ type: 'BracketOpen', value: '[' }, { type: 'BracketClose', value: ']' }])
	})

	test('tokenizer ignores whitespaces between tokens', () => {
		const tokens = JSONTokenizer.tokenize(" { } ")
		assert.deepStrictEqual(tokens, [{ type: 'BraceOpen', value: '{' }, { type: 'BraceClose', value: '}' }])
	})

	test('tokenizer parses valid key value as string', () => {
		const tokens = JSONTokenizer.tokenize('{ "key": "value" }')
		assert.deepStrictEqual(tokens, [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: "value" },
			{ type: 'BraceClose', value: '}' }
		])
	})

	test('tokenizer parses valid key string value number', () => {
		const tokens = JSONTokenizer.tokenize('{ "key": 123 }')
		assert.deepStrictEqual(tokens, [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: "123" },
			{ type: 'BraceClose', value: '}' }
		])
	})

	test('tokenizer parses valid key string value true', () => {
		const tokens = JSONTokenizer.tokenize('{ "key": true }')
		assert.deepStrictEqual(tokens, [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'True', value: "true" },
			{ type: 'BraceClose', value: '}' }
		])
	})

	test('tokenizer parses valid key string value false', () => {
		const tokens = JSONTokenizer.tokenize('{ "key": false }')
		assert.deepStrictEqual(tokens, [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'False', value: "false" },
			{ type: 'BraceClose', value: '}' }
		])
	})

	test('tokenizer parses valid key string value null', () => {
		const tokens = JSONTokenizer.tokenize('{ "key": null }')
		assert.deepStrictEqual(tokens, [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'Null', value: "null" },
			{ type: 'BraceClose', value: '}' }
		])
	})

	test('tokenizer parses valid json with multiline string', () => {
		const tokens = JSONTokenizer.tokenize(`{
			"key": "value",
			"numKey": 123
		}`)

		assert.deepStrictEqual(tokens, [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: "value" },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'numKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: "123" },
			{ type: 'BraceClose', value: '}' }
		])
	})

	test('tokenizer parses valid json with multiline nested json', () => {
		const tokens = JSONTokenizer.tokenize(`{
			"key": {
				"nestedKey": "nestedValue"
			},
			"listKey": [
				{ "key1": "value1" },
				{ "key2": "value2" }	
			]
		}`)

		assert.deepStrictEqual(tokens, [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'nestedKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'nestedValue' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'Comma', value: ',' },
			{ type: 'String', value: 'listKey' },
			{ type: 'Colon', value: ':' },
			{ type: 'BracketOpen', value: '[' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key1' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'value1' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'Comma', value: ',' },
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key2' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: 'value2' },
			{ type: 'BraceClose', value: '}' },
			{ type: 'BracketClose', value: ']' },
			{ type: 'BraceClose', value: '}' }
		])

	})
})

describe('test tokenizer failure scenarios', () => {
	test('tokenizer throws error for unknown token', () => {
		assert.throws(() => JSONTokenizer.tokenize('{;}'), {
			name: 'Error',
			message: 'Invalid character encountered: ;'
		})
	})
})
