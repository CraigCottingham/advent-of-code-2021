import chalk from "chalk"
import { performance } from "perf_hooks"
import { log, logSolution } from "../../../util/log"
import * as test from "../../../util/test"
import * as util from "../../../util/util"

const YEAR = 2021
const DAY = 14

// solution path: /Users/ccottingham/Projects/advent-of-code/2021/years/2021/14/index.ts
// data path    : /Users/ccottingham/Projects/advent-of-code/2021/years/2021/14/data.txt
// problem url  : https://adventofcode.com/2021/day/14

async function p2021day14_part1(input: string, ...params: any[]) {
	return polymerize(input, params[0] || 10)
}

async function p2021day14_part2(input: string, ...params: any[]) {
	return polymerize(input, params[0] || 40)
}

/**
 * Apply the insertion rules to a polymer.
 *
 * @param rules  - a map of unit pairs to the unit which should be inserted into the pair
 * @param counts - a map of unit pairs to the number of times each appears in the polymer
 * @returns        an updated copy of counts
 */
function applyRules(rules: Map<string, string>, counts: Map<string, number>): Map<string, number> {
	const newCounts = new Map<string, number>()
	for (let [pair, inserted] of rules) {
		if (counts.has(pair)) {
			const pairCount = counts.get(pair)!
			// NN -> C becomes NN -> NC, CN
			// pair = NN
			// inserted = C
			const chars = pair.split("")
			const keyLeft = `${chars[0]}${inserted}`
			const keyRight = `${inserted}${chars[1]}`
			newCounts.set(keyLeft, (newCounts.get(keyLeft) || 0) + pairCount)
			newCounts.set(keyRight, (newCounts.get(keyRight) || 0) + pairCount)
		}
	}
	return newCounts
}

/**
 * Chunk a string into an array of pieces `size` characters long.
 * For example, the string "ABCDEF" chunked with size 2 would be
 *   `["AB", "BC", "CD", "DE", "EF"]`
 * Note that chunks overlap.
 *
 * @param str  - the string to chunk
 * @param size - the size of each chunk
 * @returns      an array of chunks
 */
function chunkString(str: String, size: number): string[] {
	const chunks = new Array<string>()

	for (let i = 0; i < str.length - size + 1; ++i) {
		chunks.push(str.slice(i, i + size))
	}
	chunks.push(str.at(-1)!)

	return chunks
}

/**
 * Chunk a polymer string and count the occurances of each chunk.
 *
 * @param polymer - the string to chunk and count
 * @returns         a map of unit pairs to the number of times each appears in the polymer
 */
function countChunks(polymer: String): Map<string, number> {
	return chunkString(polymer, 2).reduce((acc, chunk) => acc.set(chunk, (acc.get(chunk) || 0) + 1), new Map<string, number>())
}

/**
 * Count the occurances of the units in a polymer.
 *
 * @param counts - a map of unit pairs to the number of times each appears in the polymer
 * @returns				 a map of units to the number of times each appears in the polymer
 */
function countUnits(counts: Map<string, number>): Map<string, number> {
	const unitCounts = new Map<string, number>()
	for (let [pair, count] of counts.entries()) {
		const units = pair.split("")
		unitCounts.set(units[0], (unitCounts.get(units[0]) || 0) + count)
	}
	return unitCounts
}

// Work smarter, not harder?
// Trying to brute-force it runs out of memory on iteration 26 with the test data.
// We're going to max out even sooner with the real data.
//
// I don't think we need to care about the polymer itself, or the actual chunks.
// I think all we need to worry about is the *counts* of each possible chunk.
//
// Thinking out loud.
//
// For the test data, the working symbol set is [B, C, H, N] and the starting template is "NNCB".
// There are n^2 possible chunks (where n is the size of the symbol set).
// Counts for each possible chunk for the starting template are
//   {
//   	 BB: 0
//   	 BC: 0
//   	 BH: 0
//   	 BN: 0
//   	 CB: 1
//   	 CC: 0
//   	 CH: 0
//   	 CN: 0
//   	 HB: 0
//   	 HC: 0
//   	 HH: 0
//   	 HN: 0
//   	 NB: 0
//   	 NC: 1
//   	 NH: 0
//   	 NN: 1
//   }
// Now, applying the insertion rules to the first chunk (NN), we get
//   NN -> NC, CN
// which I _think_ should be the same as decrementing the count for NN and incrementing the counts
// for NC and CN.
// After the first step of the process, the polymer is "NCNBCHB", and the counts are
//   {
//   	 BB: 0
//   	 BC: 1
//   	 BH: 0
//   	 BN: 0
//   	 CB: 0
//   	 CC: 0
//   	 CH: 1
//   	 CN: 1
//   	 HB: 1
//   	 HC: 0
//   	 HH: 0
//   	 HN: 0
//   	 NB: 1
//   	 NC: 1
//   	 NH: 0
//   	 NN: 0
//   }
// The rules applied to the starting template, written as "chunk -> chunk, chunk", are
//   NN -> NC, CN
//   NC -> NB, BC
//   CB -> CH, HB
// If we take the counts for the starting template and decrement and increment counts according
// to the rules, we get
//   {
//   	 BB: 0
//   	 BC: 1
//   	 BH: 0
//   	 BN: 0
//   	 CB: 0
//   	 CC: 0
//   	 CH: 1
//   	 CN: 1
//   	 HB: 1
//   	 HC: 0
//   	 HH: 0
//   	 HN: 0
//   	 NB: 1
//   	 NC: 1
//   	 NH: 0
//   	 NN: 0
//   }
// which matches.
// So now I just need to try this out for multiple iterations of the test data.
//
// Update: Incrementing and decrementing is too simplistic. Since the count for the chunk
// on the left side of the rule could be greater than 1, we need to add the count for the
// left-side chunk to the counts for each of the right-side chunks and set the count for the
// left-side chunk to 0.

/**
 * Apply the insertion rules to the starting template for a number of iterations.
 *
 * @param input      - the initial data, containing the starting template and the insertion rules
 * @param iterations - the number of iterations
 * @returns            the difference between the counts of the most common unit and the least common unit
 */
function polymerize(input: string, iterations: number): number {
	const data = util.lineify(input.trim(), true)
	const template = data[0]
	const rules =
		data.slice(2)
		  	.map((line) => line.match(/(\S+)\s+->\s+(\S+)/)?.slice(1, 3))
			  .reduce((acc, rule) => acc.set(rule![0], rule![1]), new Map<string, string>())

	let counts = countChunks(template)

	for (let i = 0; i < iterations; ++i) {
		counts = applyRules(rules, counts)
	}

	const lastUnit = template.at(-1)
	counts.set(lastUnit!, (counts.get(lastUnit!) || 0) + 1)

	const unitCounts = countUnits(counts)

	const maxCount = util.max(Array.from(unitCounts.values())).value
	const minCount = util.min(Array.from(unitCounts.values())).value

	return maxCount - minCount
}

async function run() {
	const testData = `
NNCB

CH -> B
HH -> N
CB -> H
NH -> C
HB -> C
HC -> B
HN -> C
NN -> C
BH -> H
NC -> B
NB -> B
BN -> B
BB -> N
BC -> B
CC -> N
CN -> C
	`
	const part1tests: TestCase[] = [
		{
			input: testData,
			expected: "1588"
		}
	]
	const part2tests: TestCase[] = [
		{
			input: testData,
			expected: "2188189693529"
		}
	]

	// Run tests
	test.beginTests()
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day14_part1(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day14_part2(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	test.endTests()

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR)

	const part1Before = performance.now()
	const part1Solution = String(await p2021day14_part1(input))
	const part1After = performance.now()

	const part2Before = performance.now()
	const part2Solution = String(await p2021day14_part2(input))
	const part2After = performance.now()

	logSolution(14, 2021, part1Solution, part2Solution)

	log(chalk.gray("--- Performance ---"))
	log(chalk.gray(`Part 1: ${util.formatTime(part1After - part1Before)}`))
	log(chalk.gray(`Part 2: ${util.formatTime(part2After - part2Before)}`))
	log()
}

run()
	.then(() => {
		process.exit()
	})
	.catch(error => {
		throw error
	})
