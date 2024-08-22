import { Json, JSONArray, JSONObject, JSONValue, Token, TokenType } from "./types";
import { isBoolean, isNull, isNumeric, literals, literalTokensMap } from "./utils";

export class JSONParser {

	idx: number

	constructor(idx: number = 0) {
		this.idx = idx
	}

	parse(tokens: Array<Token>): Json {
		// reset to 0 so that if parse is called, we'll start from the beginning of tokens
		this.idx = 0

		let result: Json

		if (tokens[0].type === 'BraceOpen') {
			result = this.parseObject(tokens)	
		} else if (tokens[0].type === 'BracketOpen') {
			result = this.parseList(tokens)
		} else {
			throw new Error(`Invalid start of JSON - Expected '[' or '{' but got ${tokens[0].value}`)
		}	

		// there shouldn't be any more tokens since this should signify the end of the object
		if (this.idx !== tokens.length) {
			throw new Error(`Invalid JSON - Expected end of JSON, got ${tokens[this.idx]?.value || null}`)
		}

		return result
	}

	parseObject(tokens: Array<Token>): JSONObject {
		if (tokens.length < 2) {
			throw new Error('Invalid JSON Object at pos 0')
		}
		if (tokens[this.idx].type !== 'BraceOpen') {
			throw new Error(`Invalid JSON Object - Expected '{', got '${tokens[this.idx].value}'`)
		}

		const result: JSONObject = {}

		// eat up the first {
		this.idx++

		// if it follows up with } return empty
		if (tokens[this.idx].type === 'BraceClose') {
			this.idx++
			return result
		}

		while (this.idx < tokens.length && tokens[this.idx]?.type !== 'BraceClose') {
			const currToken = tokens[this.idx]
			if (currToken.type !== 'String') {
				throw new Error(`Invalid JSON Object - Expected token of type String, got type ${currToken.type}`)
			}

			const key = currToken.value

			if (tokens[++this.idx].type !== 'Colon') {
				throw new Error(`Invalid JSON Object - Expected ':', got ${tokens[this.idx].value}`)
			}

			this.idx++
			const value = this.parseValue(tokens)
			result[key] = value

			// Value should be followed by either a comma or a closing brace
			if (tokens[this.idx]?.type === 'Comma' ) {
				// eat up the , and start loop from the token after
				this.idx++
			} else if (tokens[this.idx]?.type === 'BraceClose') {
				// we've reached the end of the object
				this.idx++
				return result
			} else {
				throw new Error(`Invalid JSON Object - Expected ',' or '}', got ${tokens[this.idx]?.value || null}`)
			}
		}

		return result
	}

	parseList(tokens: Array<Token>): JSONArray {
		return []
	}

	parseValue = (tokens: Array<Token>): JSONValue => {
		const token = tokens[this.idx]
		switch (token.type) {
			case "String":
				this.idx++
				return token.value
			case "Number":
				this.idx++
				return parseInt(token.value)
			case "True":
				this.idx++
				return true
			case "False":
				this.idx++
				return false
			case "Null":
				this.idx++
				return null
			case "BraceOpen":
				return this.parseObject(tokens)
			case "BracketOpen":
				return this.parseList(tokens)
			default:
				throw new Error(`Invalid JSON Value - Expected a valid value for key but got ${token.value}`)
		}
	}
}

export class JSONTokenizer {

	static tokenize(input: string): Array<Token> {
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
}

export const parse = (input: string): Json => {
	const tokens = JSONTokenizer.tokenize(input)
	const parser = new JSONParser()
	return parser.parse(tokens)
}

