import Flatten from "@flatten-js/core"
import chalk from "chalk"
import { performance } from "perf_hooks"
import { log, logSolution } from "../../../util/log"
import * as test from "../../../util/test"
import * as util from "../../../util/util"

const YEAR = 2021
const DAY = 5

// solution path: /Users/ccottingham/Projects/advent-of-code/2021/years/2021/05/index.ts
// data path    : /Users/ccottingham/Projects/advent-of-code/2021/years/2021/05/data.txt
// problem url  : https://adventofcode.com/2021/day/5

async function p2021day5_part1(input: string, ...params: any[]) {
	const segments = util.segmentify(input).filter((s) => isHorizontal(s) || isVertical(s))
	const cells = new Map()

	segments.forEach((s) => {
		let ps = s.ps
		let pe = s.pe

		if (isHorizontal(s)) {
			if (ps.x > pe.x) {
				ps = s.pe
				pe = s.ps
			}
			for (let i = ps.x; i <= pe.x; ++i) {
				const key = `[${i},${ps.y}]`
				cells.set(key, (cells.get(key) || 0) + 1)
			}
		} else if (isVertical(s)) {
			if (ps.y > pe.y) {
				pe = s.ps
				ps = s.pe
			}
			for (let i = ps.y; i <= pe.y; ++i) {
				const key = `[${ps.x},${i}]`
				cells.set(key, (cells.get(key) || 0) + 1)
			}
		}
	})

	return Array.from(cells.entries()).filter(([_p, v]) => v > 1).length
}

async function p2021day5_part2(input: string, ...params: any[]) {
	const segments = util.segmentify(input)
	const cells = new Map()

	segments.forEach((s) => {
		let ps = s.ps
		let pe = s.pe

		if (isHorizontal(s)) {
			if (ps.x > pe.x) {
				ps = s.pe
				pe = s.ps
			}

			for (let i = ps.x; i <= pe.x; ++i) {
				const key = `[${i},${ps.y}]`
				cells.set(key, (cells.get(key) || 0) + 1)
			}
		} else if (isVertical(s)) {
			if (ps.y > pe.y) {
				pe = s.ps
				ps = s.pe
			}

			for (let i = ps.y; i <= pe.y; ++i) {
				const key = `[${ps.x},${i}]`
				cells.set(key, (cells.get(key) || 0) + 1)
			}
		} else {
			if (ps.x > pe.x) {
				ps = s.pe
				pe = s.ps
			}
			const dy = (ps.y > pe.y) ? -1 : 1

			for (let x = ps.x, y = ps.y; x <= pe.x; ++x, y += dy) {
				const key = `[${x},${y}]`
				cells.set(key, (cells.get(key) || 0) + 1)
			}
		}
	})

	return Array.from(cells.entries()).filter(([_p, v]) => v > 1).length
}

function isHorizontal(s: Flatten.Segment): boolean {
	return s.ps.y == s.pe.y
}

function isVertical(s: Flatten.Segment): boolean {
	return s.ps.x == s.pe.x
}

const testData = `
0,9 -> 5,9
8,0 -> 0,8
9,4 -> 3,4
2,2 -> 2,1
7,0 -> 7,4
6,4 -> 2,0
0,9 -> 2,9
3,4 -> 1,4
0,0 -> 8,8
5,5 -> 8,2
`

async function run() {
	const part1tests: TestCase[] = [
		{
			input: testData,
			expected: "5"
		}
	]
	const part2tests: TestCase[] = [
		{
			input: testData,
			expected: "12"
		}
	]

	// Run tests
	test.beginTests()
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day5_part1(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day5_part2(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	test.endTests()

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR)

	const part1Before = performance.now()
	const part1Solution = String(await p2021day5_part1(input))
	const part1After = performance.now()

	const part2Before = performance.now()
	const part2Solution = String(await p2021day5_part2(input))
	const part2After = performance.now()

	logSolution(5, 2021, part1Solution, part2Solution)

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
