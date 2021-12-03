import chalk from "chalk"
import { performance } from "perf_hooks"
import { log, logSolution } from "../../../util/log"
import * as test from "../../../util/test"
import * as util from "../../../util/util"

const YEAR = 2021
const DAY = 3

// solution path: /Users/ccottingham/Projects/advent-of-code/2021/years/2021/03/index.ts
// data path    : /Users/ccottingham/Projects/advent-of-code/2021/years/2021/03/data.txt
// problem url  : https://adventofcode.com/2021/day/3

async function p2021day3_part1(input: string, ...params: any[]) {
	const data = util.numberify(input, 2)
	const width = params[0] || 12

	let counters = initCounters(width)

	for (let i = (width - 1), mask = 1 << (width - 1); i >= 0; --i, mask >>= 1) {
		counters[i] = countBits(data, i)
	}

	let epsilon = 0
	let gamma = 0

	for (let i = (width - 1), mask = 1 << (width - 1); i >= 0; --i, mask >>= 1) {
		const [ count0, count1 ] = counters[i]
		if (count1 > count0) {
			gamma |= mask
		} else {
			epsilon |= mask
		}
	}

	return (gamma * epsilon).toString()
}

async function p2021day3_part2(input: string, ...params: any[]) {
	const data = util.numberify(input, 2)
	const width = params[0] || 12

	let counters = initCounters(width)

	let oxygenData = Array.from(data)
	for (let i = width - 1, mask = 1 << (width - 1); (i >= 0) && (oxygenData.length > 1); --i, mask >>= 1) {
		const [ count0, count1 ] = countBits(oxygenData, i)
		oxygenData = oxygenData.filter((n) => {
			if (count1 >= count0) {
				return (n & mask)
			} else {
				return !(n & mask)
			}
		})
	}

	let co2Data = Array.from(data)
	for (let i = width - 1, mask = 1 << (width - 1); (i >= 0) && (co2Data.length > 1); --i, mask >>= 1) {
		const [ count0, count1 ] = countBits(co2Data, i)
		co2Data = co2Data.filter((n) => {
			if (count1 < count0) {
				return (n & mask)
			} else {
				return !(n & mask)
			}
		})
	}

	return (oxygenData[0] * co2Data[0]).toString()
}

function countBits(data: number[], position: number): [number, number] {
	const mask = 1 << position

	return data.reduce((acc: [number, number], n) => {
		const [count0, count1] = acc
		if (n & mask) {
			return [count0, count1 + 1]
		} else {
			return [count0 + 1, count1]
		}
	}, [0, 0])
}

function initCounters(width: number): [number, number][] {
	let counters = new Array<[number, number]>();
	for (let i = 0; i < width; ++i) {
		counters[i] = [ 0, 0 ]
	}
	return counters
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `
00100
11110
10110
10111
10101
01111
00111
11100
10000
11001
00010
01010
			`,
			expected: "198",
			extraArgs: [ 5 ]		// width of input numbers, in bits
		}
	]
	const part2tests: TestCase[] = [
		{
			input: `
00100
11110
10110
10111
10101
01111
00111
11100
10000
11001
00010
01010
			`,
			expected: "230",
			extraArgs: [ 5 ]		// width of input numbers, in bits
		}
	]

	// Run tests
	test.beginTests()
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day3_part1(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day3_part2(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	test.endTests()

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR)

	const part1Before = performance.now()
	const part1Solution = String(await p2021day3_part1(input))
	const part1After = performance.now()

	const part2Before = performance.now()
	const part2Solution = String(await p2021day3_part2(input))
	const part2After = performance.now()

	logSolution(3, 2021, part1Solution, part2Solution)

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
