import chalk from "chalk"
import { performance } from "perf_hooks"
import { Grid, GridPos } from "../../../util/grid"
import { log, logSolution } from "../../../util/log"
import * as test from "../../../util/test"
import * as util from "../../../util/util"

const YEAR = 2021
const DAY = 15

// solution path: /Users/ccottingham/Projects/advent-of-code/2021/years/2021/15/index.ts
// data path    : /Users/ccottingham/Projects/advent-of-code/2021/years/2021/15/data.txt
// problem url  : https://adventofcode.com/2021/day/15

type Path = GridPos[]

function borderPath(grid: Grid): Path {
	const path: Path = []
	for (let i = 1; i < grid.rowCount; ++i) {
		path.push(grid.getCell([i, 0])!.position)
	}
	for (let j = 1; j < grid.colCount; ++j) {
		path.push(grid.getCell([grid.rowCount - 1, j])!.position)
	}
	return path
}

function pathIsComplete(grid: Grid, path: Path): boolean {
	const lastPosition = grid.getCell(path.at(-1)!)!.position
	return (lastPosition[0] === grid.rowCount - 1) && (lastPosition[1] === grid.colCount - 1)
}

function pathRisk(grid: Grid, path: Path): number {
	// don't add the risk for the first cell
	return path.slice(1).reduce((acc, position) => acc + Number(grid.getCell(position)!.value), 0)
}

// Start with the total risk for the path that follows the borders of the grid
// (either down then right, or right then down, doesn't matter which).
//
// One of two things must be true:
// * the total risk for this path is the minimum total risk through the grid; or
// * there is a path with a lower total risk.
//
// Once we have _a_ value for maximum total risk, we can start searching through the grid.
// If at any point the accumulated risk is greater than or equal to the maximum total risk,
// that path (and any which follow from it) can be abandoned.
//
// If we find a path with a lower total risk than the current maximum, update the current
// maximum (and optionally filter out any paths in the stack with a higher total risk).

async function p2021day15_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input.trim() })

	let maxStackDepth = 0
	let maxPathRisk = pathRisk(grid, borderPath(grid))

	let stack: Path[] = [[grid.getCell([0, 0])!.position]]

	while (stack.length > 0) {
		if (stack.length > maxStackDepth) {
			maxStackDepth = stack.length
		}

		const path = stack.pop()! // stack.shift()! for BFS
		if (pathRisk(grid, path) >= maxPathRisk) { continue }
		if (pathIsComplete(grid, path)) {
			maxPathRisk = pathRisk(grid, path)
			stack = stack.filter((p) => pathRisk(grid, p) < maxPathRisk)
			continue
		}

		const nextPositions =
			grid.getCell(path.at(-1)!)!
					.neighbors()
					.map((cell) => cell.position)
					.filter((pos) => path.every((visited) => {
						return !((pos[0] == visited[0]) && (pos[1] == visited[1]))
					}))

		nextPositions.forEach((pos) => {
			const newPath = Array.from(path)
			newPath.push(pos)
			stack.push(newPath)
		})
	}

	return maxPathRisk
}

async function p2021day15_part2(input: string, ...params: any[]) {
	return "Not implemented"
}

async function run() {
	const testData = `
1163751742
1381373672
2136511328
3694931569
7463417111
1319128137
1359912421
3125421639
1293138521
2311944581
	`
	const part1tests: TestCase[] = [
		{
			input: testData,
			expected: "40"
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
			test.logTestResult(testCase, String(await p2021day15_part1(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day15_part2(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	test.endTests()

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR)

	const part1Before = performance.now()
	const part1Solution = String(await p2021day15_part1(input))
	const part1After = performance.now()

	const part2Before = performance.now()
	const part2Solution = String(await p2021day15_part2(input))
	const part2After = performance.now()

	logSolution(15, 2021, part1Solution, part2Solution)

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
