import chalk from "chalk"
import { performance } from "perf_hooks"
import { Cell, Grid } from "../../../util/grid"
import { log, logSolution } from "../../../util/log"
import * as test from "../../../util/test"
import * as util from "../../../util/util"

const YEAR = 2021
const DAY = 11

// solution path: /Users/ccottingham/Projects/advent-of-code/2021/years/2021/11/index.ts
// data path    : /Users/ccottingham/Projects/advent-of-code/2021/years/2021/11/data.txt
// problem url  : https://adventofcode.com/2021/day/11

async function p2021day11_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input.trim() })
	const iterations = params[0] || 100
	let flashes = 0

	for (let i = 0; i < iterations; ++i) {
		for (const cell of grid) {
			incrementCell(cell)
		}

		const flashed = grid.getCells("*")
		flashes += flashed.length

		for (const cell of flashed) {
			cell.setValue("0")
		}
	}

	return flashes
}

async function p2021day11_part2(input: string, ...params: any[]) {
	return "Not implemented"
}

function incrementCell(cell: Cell): Cell {
	const value = cell.value
	if (value !== "*") {
		let newValue = Number(value) + 1
		cell.setValue(newValue.toString())
		if (newValue > 9) {
			cell.setValue("*")
			for (const neighbor of cell.neighbors(true)) {
				incrementCell(neighbor)
			}
		}
	}
	return cell
}

async function run() {
	const testData = `
5483143223
2745854711
5264556173
6141336146
6357385478
4167524645
2176841721
6882881134
4846848554
5283751526
`
	const part1tests: TestCase[] = [
		{
			input: `
11111
19991
19191
19991
11111
			`,
			expected: "9",
			extraArgs: [ 1 ]		// iterations
		},
		{
			input: `
11111
19991
19191
19991
11111
			`,
			expected: "34",
			extraArgs: [ 10 ]		// iterations
		},
		{
			input: testData,
			expected: "1656"
		}
	]
	const part2tests: TestCase[] = [
		{
			input: testData,
			expected: ""
		}
	]

	// Run tests
	test.beginTests()
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day11_part1(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day11_part2(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	test.endTests()

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR)

	const part1Before = performance.now()
	const part1Solution = String(await p2021day11_part1(input))
	const part1After = performance.now()

	const part2Before = performance.now()
	const part2Solution = String(await p2021day11_part2(input))
	const part2After = performance.now()

	logSolution(11, 2021, part1Solution, part2Solution)

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
