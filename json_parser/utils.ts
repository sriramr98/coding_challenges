import { Token } from "./types"

export const literalTokensMap: { [key: string]: Token } = {
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

export const literals = ['{', '}', '[', ']', ':', ',']

export const isBoolean = (value: string): Boolean => {
	return value === 'true' || value === 'false'
}

export const isNumeric = (value: string): Boolean => {
	try {
		const res = parseInt(value)
		return !isNaN(res)
	} catch (_) {
		return false
	}
}

export const isNull = (value: string): Boolean => {
	return value === 'null'
}

