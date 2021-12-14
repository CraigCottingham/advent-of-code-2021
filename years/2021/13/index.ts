import chalk from "chalk"
import { performance } from "perf_hooks"
import { Grid } from "../../../util/grid"
import { log, logSolution } from "../../../util/log"
import * as test from "../../../util/test"
import * as util from "../../../util/util"

const YEAR = 2021
const DAY = 13

const CLEAR = "."
const DOT = "█"

// solution path: /Users/ccottingham/Projects/advent-of-code/2021/years/2021/13/index.ts
// data path    : /Users/ccottingham/Projects/advent-of-code/2021/years/2021/13/data.txt
// problem url  : https://adventofcode.com/2021/day/13

async function p2021day13_part1(input: string, ...params: any[]) {
	const data = util.lineify(input.trim(), true)
	const blankLine = data.findIndex((line) => line === "")
	const points =
		data.slice(0, blankLine)
			  .filter((line) => line.match(/\S/))
				.map((line) => line.match(/(\d+),(\d+)/)?.slice(1, 3))
				.map((point) => [ Number(point![1]), Number(point![0]) ])
	const folds =
		data.slice(blankLine, data.length)
				.filter((line) => line.match(/\S/))
				.map((line) => line.match(/(.)=(\d+)/)?.slice(1, 3))

	const maxCol = util.max(points.map((point) => point[1])).value
	const maxRow = util.max(points.map((point) => point[0])).value

	const grid = new Grid({ rowCount: maxRow + 1, colCount: maxCol + 1, fillWith: CLEAR })
	for (let point of points) {
		grid.setCell([point[0], point[1]], DOT)
	}

	const fold = folds[0]
	if (fold![0] == "y") {
		foldUp(grid, Number(fold![1]))
	} else {
		foldLeft(grid, Number(fold![1]))
	}

	return countDots(grid)
}

function countDots(grid: Grid): number {
	return grid.getCells(DOT).length
}

function foldLeft(grid: Grid, onCol: number) {
	for (let i = 0; i < onCol; ++i) {
		for (let j = 0; j < grid.rowCount; ++j) {
			const value = grid.getCell([j, onCol + i + 1])!.value
			if (value !== CLEAR) {
				grid.setCell([j, onCol - i - 1], value)
				grid.setCell([j, onCol + i + 1], CLEAR)
			}
		}
	}
}

function foldUp(grid: Grid, onRow: number) {
	for (let i = 0; i < onRow; ++i) {
		for (let j = 0; j < grid.colCount; ++j) {
			const value = grid.getCell([onRow + i + 1, j])!.value
			if (value !== CLEAR) {
				grid.setCell([onRow - i - 1, j], value)
				grid.setCell([onRow + i + 1, j], CLEAR)
			}
		}
	}
}

async function p2021day13_part2(input: string, ...params: any[]) {
	return "Not implemented"
}

async function run() {
	const testData = `
6,10
0,14
9,10
0,3
10,4
4,11
6,0
6,12
4,1
0,13
10,12
3,4
3,0
8,4
1,10
2,14
8,10
9,0

fold along y=7
fold along x=5
`
	const part1tests: TestCase[] = [
		{
			input: testData,
			expected: "17"
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
			test.logTestResult(testCase, String(await p2021day13_part1(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day13_part2(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	test.endTests()

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR)

	const part1Before = performance.now()
	const part1Solution = String(await p2021day13_part1(input))
	const part1After = performance.now()

	const part2Before = performance.now()
	const part2Solution = String(await p2021day13_part2(input))
	const part2After = performance.now()

	logSolution(13, 2021, part1Solution, part2Solution)

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
