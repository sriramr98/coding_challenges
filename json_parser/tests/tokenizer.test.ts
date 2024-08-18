import test, { describe } from "node:test";
import assert from "node:assert";

import { tokenize } from "..";
import { type } from "node:os";

describe('test tokenizer success scenarios', () => {
	test('tokenizer returns valid tokens for empty object', () => {
		const tokens = tokenize("{}")
		assert.deepStrictEqual(tokens, [{ type: 'BraceOpen', value: '{' }, { type: 'BraceClose', value: '}' }])
	})

	test('tokenizer returns valid tokens for empty array', () => {
		const tokens = tokenize("[]")
		assert.deepStrictEqual(tokens, [{ type: 'BracketOpen', value: '[' }, { type: 'BracketClose', value: ']' }])
	})

	test('tokenizer ignores whitespaces between tokens', () => {
		const tokens = tokenize(" { } ")
		assert.deepStrictEqual(tokens, [{ type: 'BraceOpen', value: '{' }, { type: 'BraceClose', value: '}' }])
	})

	test('tokenizer parses valid key value as string', () => {
		const tokens = tokenize('{ "key": "value" }')
		assert.deepStrictEqual(tokens, [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'String', value: "value" },
			{ type: 'BraceClose', value: '}' }
		])
	})

	test('tokenizer parses valid key string value number', () => {
		const tokens = tokenize('{ "key": 123 }')
		assert.deepStrictEqual(tokens, [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'Number', value: "123" },
			{ type: 'BraceClose', value: '}' }
		])
	})

	test('tokenizer parses valid key string value true', () => {
		const tokens = tokenize('{ "key": true }')
		assert.deepStrictEqual(tokens, [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'True', value: "true" },
			{ type: 'BraceClose', value: '}' }
		])
	})

	test('tokenizer parses valid key string value false', () => {
		const tokens = tokenize('{ "key": false }')
		assert.deepStrictEqual(tokens, [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'False', value: "false" },
			{ type: 'BraceClose', value: '}' }
		])
	})

	test('tokenizer parses valid key string value null', () => {
		const tokens = tokenize('{ "key": null }')
		assert.deepStrictEqual(tokens, [
			{ type: 'BraceOpen', value: '{' },
			{ type: 'String', value: 'key' },
			{ type: 'Colon', value: ':' },
			{ type: 'Null', value: "null" },
			{ type: 'BraceClose', value: '}' }
		])
	})
})

describe('test tokenizer failure scenarios', () => {
	test('tokenizer throws error for unknown token', () => {
		assert.throws(() => tokenize('{;}'), {
			name: 'Error',
			message: 'Invalid character encountered: ;'
		})
	})
})
