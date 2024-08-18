type JSONValue = string | boolean | number | JSONObject | JSONArray | null

interface JSONObject {
	[key: string]: JSONValue
}

type JSONArray = Array<JSONValue>

type Json = JSONObject | JSONArray

type TokenType =
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

const literalTokensMap: { [key: string]: Token } = {
	'{': {
		type: 'BraceOpen',
		value: '{'
	},
	'}': {
		type: 'BraceClose',
		value: '}'
	},
	'[': {
		type: 'BracketOpen',
		value: '['
	},
	']': {
		type: 'BracketClose',
		value: ']'
	},
	':': {
		type: 'Colon',
		value: ':'
	},
	',': {
		type: 'Comma',
		value: ','
	}
}

const literals = ['{', '}', '[', ']', ':', ',']

interface Token {
	type: TokenType
	value: string
}

const isBoolean = (value: string) => {
	return value === 'true' || value === 'false'
}

const isNumeric = (value: string) => {
	try {
		const res = parseInt(value)
		return !isNaN(res)
	} catch (_) {
		return false
	}
}

const isNull = (value: string) => {
	return value === 'null'
}

export const tokenize = (input: string): Array<Token> => {
	let currentIdx = 0;
	let inputLen = input.length;

	const tokens: Array<Token> = []

	while (currentIdx < inputLen) {
		const char = input[currentIdx]

		// ignore whitespaces
		if (/\s/.test(char)) {
			currentIdx++;
			continue
		}

		if (literals.includes(char)) {
			tokens.push(literalTokensMap[char])
			currentIdx++
			continue
		}

		if (char === '"') {
			let value = ""
			while (input[++currentIdx] !== '"' && currentIdx < inputLen) {
				value += input[currentIdx]
			}
			tokens.push({
				type: 'String',
				value
			})

			// cover up the last "
			currentIdx++;

			continue
		}

		if (/^[a-zA-Z0-9]$/.test(char)) {
			let value = char
			while (/^[a-zA-Z0-9]$/.test(input[++currentIdx])) {
				value += input[currentIdx]
			}

			let tokenType: TokenType
			if (isBoolean(value)) {
				tokenType = value === 'true' ? 'True' : 'False'
			} else if (isNumeric(value)) {
				tokenType = 'Number'
			} else if (isNull(value)) {
				tokenType = 'Null'
			} else {
				throw new Error(`Invalid token: ${value}`)
			}

			tokens.push({
				type: tokenType,
				value
			})

			continue
		}

		throw new Error(`Invalid character encountered: ${char}`)

	}

	return tokens
}

const parseValue = (tokens: Array<Token>, idx: number): JSONValue => {
	const token = tokens[idx]
	switch (token.type) {
		case "String":
			return token.value
		case "Number":
			return parseInt(token.value)
		case "True":
			return true
		case "False":
			return false
		case "Null":
			return null
		case "BraceOpen":
			return parseObject(tokens, idx)
		case "BracketOpen":
			return parseList(tokens, idx)
		default:
			throw new Error(`Unexpected token ${token.value} at pos ${idx}`)
	}
}

export const parseObject = (tokens: Array<Token>, currentIdx: number): JSONObject => {
	if (tokens.length < 2) {
		throw new Error('Invalid JSON Object at pos 0')
	}
	if (tokens[0].type !== 'BraceOpen') {
		throw new Error('Invalid JSON Object at pos 0')
	}
	if (tokens[tokens.length - 1].type !== 'BraceClose') {
		throw new Error(`Invalid JSON Object at pos ${tokens.length - 1}`)
	}

	const result: JSONObject = {}

	// eat up the first {
	currentIdx++
	
	while (currentIdx < tokens.length && tokens[currentIdx]?.type !== 'BraceClose') {
		const currToken = tokens[currentIdx]
		if (currToken.type !== 'String') {
			throw new Error(`Invalid JSON Object as pos ${currentIdx}`)
		}

		const key = currToken.value

		if (tokens[++currentIdx].type !== 'Colon') {
			throw new Error(`Expected ':' at pos ${currentIdx}`)
		}

		const value = parseValue(tokens, ++currentIdx)
		result[key] = value

		// Value should be followed by either a comma or a closing brace
		if (tokens[currentIdx + 1].type === 'Comma' || tokens[currentIdx + 1].type === 'BraceClose') {
			// eat up the , or } and start loop from the token after
			currentIdx += 2
		} else {
			throw new Error(`Expected ',' or '}' at pos ${currentIdx}`)
		}
	}

	return result
}

export const parseList = (tokens: Array<Token>, idx: number): JSONArray => {
	return []
}

export const parseTokens = (tokens: Array<Token>): Json => {
	if (tokens[0].type === 'BraceOpen') {
		return parseObject(tokens, 0)
	} else if (tokens[0].type === 'BracketOpen') {
		return parseList(tokens, 0)
	} else {
		throw new Error(`Invalid token: ${tokens[0].value}`)
	}
}

export const parse = (input: string): Json => {
	const tokens = tokenize(input)
	return parseTokens(tokens)
}

