import chalk from "chalk"
import { performance } from "perf_hooks"
import { log, logSolution } from "../../../util/log"
import * as test from "../../../util/test"
import * as util from "../../../util/util"

const YEAR = 2021
const DAY = 17

// solution path: /Users/ccottingham/Documents/Projects/advent-of-code/2021/years/2021/17/index.ts
// data path    : /Users/ccottingham/Documents/Projects/advent-of-code/2021/years/2021/17/data.txt
// problem url  : https://adventofcode.com/2021/day/17

type Point = { x: number, y: number }
type Area = { topLeft: Point, bottomRight: Point }
type Velocity = { dx: number, dy: number }

function inTargetArea(p: Point, area: Area): boolean {
  return ((p.x >= area.topLeft.x) && (p.x <= area.bottomRight.x)) &&
				 ((p.y <= area.topLeft.y) && (p.y >= area.bottomRight.y))
}

function track(vi: Velocity, area: Area): Point[] {
	let point: Point = { x: 0, y: 0 }
	let velocity: Velocity = vi
	const points: Point[] = []

	while ((point.x <= area.bottomRight.x) && (point.y >= area.bottomRight.y)) {
		points.push({ x: point.x, y: point.y })

		point.x += velocity.dx
		point.y += velocity.dy

		velocity.dx = (velocity.dx === 0) ? 0 : (velocity.dx - 1)
		velocity.dy -= 1
	}

	return points
}

// Testing a single [vx, vy] pair probably doesn't take long, so we can just brute force it.
// However, I can think of some ways to minimize the problem space. Maybe I'll try them later.

async function p2021day17_part1(input: string, ...params: any[]) {
  const match = util.regexify(input.trim(), /x=([-\d]+)\.\.([-\d]+),\s+y=([-\d]+)\.\.([-\d]+)/)
	if (!match) {
		return "wrong regex for the input data"
	}

	const x1: number = Number(match[1])
	const x2: number = Number(match[2])
	const y1: number = Number(match[3])
	const y2: number = Number(match[4])

	const targetArea = {
		topLeft: {
			x: Math.min(x1, x2),
			y: Math.max(y1, y2)
		},
		bottomRight: {
			x: Math.max(x1, x2),
			y: Math.min(y1, y2)
		}
	}

	const ys: number[] = []
	for (let x = 1; x <= targetArea.bottomRight.x; ++x) {
		for (let y = 1; y <= 200; ++y) {
			const points = track({ dx: x, dy: y }, targetArea)
			if (points.some((point) => inTargetArea(point, targetArea))) {
				ys.push(...points.map((point) => point.y))
			}
		}
	}

	return util.max(ys).elem
}

async function p2021day17_part2(input: string, ...params: any[]) {
  const match = util.regexify(input.trim(), /x=([-\d]+)\.\.([-\d]+),\s+y=([-\d]+)\.\.([-\d]+)/)
	if (!match) {
		return "wrong regex for the input data"
	}

	const x1: number = Number(match[1])
	const x2: number = Number(match[2])
	const y1: number = Number(match[3])
	const y2: number = Number(match[4])

	const targetArea = {
		topLeft: {
			x: Math.min(x1, x2),
			y: Math.max(y1, y2)
		},
		bottomRight: {
			x: Math.max(x1, x2),
			y: Math.min(y1, y2)
		}
	}

	let velocities = 0
	for (let x = 1; x <= targetArea.bottomRight.x; ++x) {
		for (let y = targetArea.bottomRight.y; y <= 200; ++y) {
			const points = track({ dx: x, dy: y }, targetArea)
			if (points.some((point) => inTargetArea(point, targetArea))) {
				velocities++
			}
		}
	}

	return velocities
}

async function run() {
	const testData = `
target area: x=20..30, y=-10..-5
`
	const part1tests: TestCase[] = [
		{
			input: testData,
			expected: "45"
		}
	]
	const part2tests: TestCase[] = [
		{
			input: testData,
			expected: "112"
		}
	]

	// Run tests
	test.beginTests()
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day17_part1(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day17_part2(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	test.endTests()

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR)

	const part1Before = performance.now()
	const part1Solution = String(await p2021day17_part1(input))
	const part1After = performance.now()

	const part2Before = performance.now()
	const part2Solution = String(await p2021day17_part2(input))
	const part2After = performance.now()

	logSolution(17, 2021, part1Solution, part2Solution)

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
