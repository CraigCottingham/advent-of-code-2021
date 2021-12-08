
export function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
	let result = new Set(a)
	for (let elem of b) {
		result.delete(elem)
	}
	return result
}

export function intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
	let result = new Set<T>()
	for (let elem of b) {
		if (a.has(elem)) {
			result.add(elem)
		}
	}
	return result
}

export function union<T>(a: Set<T>, b: Set<T>): Set<T> {
	let result = new Set(a)
	for (let elem of b) {
		result.add(elem)
	}
	return result
}