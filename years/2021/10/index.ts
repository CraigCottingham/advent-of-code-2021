import chalk from "chalk"
import { performance } from "perf_hooks"
import { log, logSolution } from "../../../util/log"
import * as test from "../../../util/test"
import * as util from "../../../util/util"

const YEAR = 2021
const DAY = 10

// solution path: /Users/ccottingham/Projects/advent-of-code/2021/years/2021/10/index.ts
// data path    : /Users/ccottingham/Projects/advent-of-code/2021/years/2021/10/data.txt
// problem url  : https://adventofcode.com/2021/day/10

const illegalScore: Map<string, number> = new Map([
	[")", 3],
	["]", 57],
	["}", 1197],
	[">", 25137]
])

async function p2021day10_part1(input: string, ...params: any[]) {
	return util.lineify(input.trim()).reduce((acc, line) => acc + scoreForLine(line), 0)
}

async function p2021day10_part2(input: string, ...params: any[]) {
	return "Not implemented"
}

// The only characters in the lines are opening and closing characters, which means that at the innermost
// nesting of a valid chunk there will be one or more adjacent opening/closing characters. So we can remove
// adjacent opening/closing characters until the line is unchanged, then the resulting line will start
// with a corrupted chunk (if any). The corrupted closing character will be the first closing character in
// the line.
//
// For simplicity, rather than loop until the line is unchanged, just loop (line.length) times. That's a
// guaranteed hard limit on the number of opening/closing character pairs we can remove (the limit is
// actually (line.length / 2), but I don't want to mess with rounding up if the line length is an odd number,
// and lines should be short enough that twice too many iterations will take a long time).
//
// If the line is incomplete rather than corrupted, there will be no closing character, so return 0.

function scoreForLine(line: string): number {
	for (let i = line.length; i; --i) {
		line = line.replaceAll(/\(\)/g, "")
		line = line.replaceAll(/\[\]/g, "")
		line = line.replaceAll(/\{\}/g, "")
		line = line.replaceAll(/\<\>/g, "")
	}

	const badIndex = line.search(/[\)\]\}\>]/)
	if (badIndex > -1) {
		return illegalScore.get(line.charAt(badIndex)) || 0
	} else {
		return 0
	}
}

async function run() {
	const testData = `
[({(<(())[]>[[{[]{<()<>>
[(()[<>])]({[<{<<[]>>(
{([(<{}[<>[]}>{[]{[(<()>
(((({<>}<{<{<>}{[]{[]{}
[[<[([]))<([[{}[[()]]]
[{[{({}]{}}([{[{{{}}([]
{<[[]]>}<{[{[{[]{()[[[]
[<(<(<(<{}))><([]([]()
<{([([[(<>()){}]>(<<{{
<{([{{}}[<[[[<>{}]]]>[]]
	`
	const part1tests: TestCase[] = [
		{
			input: "{([(<{}[<>[]}>{[]{[(<()>",
			expected: "1197"
		},
		{
			input: "[[<[([]))<([[{}[[()]]]",
			expected: "3"
		},
		{
			input: "[{[{({}]{}}([{[{{{}}([]",
			expected: "57"
		},
		{
			input: "[<(<(<(<{}))><([]([]()",
			expected: "3"
		},
		{
			input: "<{([([[(<>()){}]>(<<{{",
			expected: "25137"
		},
		{
			input: testData,
			expected: "26397"
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
			test.logTestResult(testCase, String(await p2021day10_part1(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day10_part2(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	test.endTests()

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR)

	const part1Before = performance.now()
	const part1Solution = String(await p2021day10_part1(input))
	const part1After = performance.now()

	const part2Before = performance.now()
	const part2Solution = String(await p2021day10_part2(input))
	const part2After = performance.now()

	logSolution(10, 2021, part1Solution, part2Solution)

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
