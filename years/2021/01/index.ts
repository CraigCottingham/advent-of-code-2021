import chalk from "chalk";
import { performance } from "perf_hooks";
import { log, logSolution } from "../../../util/log";
import * as test from "../../../util/test";
import * as util from "../../../util/util";

const YEAR = 2021;
const DAY = 1;

// solution path: /Users/ccottingham/Projects/advent-of-code/2021/years/2021/01/index.ts
// data path    : /Users/ccottingham/Projects/advent-of-code/2021/years/2021/01/data.txt
// problem url  : https://adventofcode.com/2021/day/1

async function p2021day1_part1(input: string, ...params: any[]) {
	return util.windows(util.numberify(input), 2)
						 .map((pair) => (pair[0] < pair[1] ? 1 : 0) as number)
						 .reduce((acc, v) => acc + v, 0);
}

async function p2021day1_part2(input: string, ...params: any[]) {
	const values = util.windows(util.numberify(input), 3).map((window) => window.reduce((acc, v) => acc + v))
	return util.windows(values, 2)
						 .map((pair) => (pair[0] < pair[1] ? 1 : 0) as number)
						 .reduce((acc, v) => acc + v, 0);
}

async function run() {
	const testData = `
199
200
208
210
200
207
240
269
260
263`
	const part1tests: TestCase[] = [
		{
			input: testData,
			expected: "7"
		}
	];
	const part2tests: TestCase[] = [
		{
			input: testData,
			expected: "5"
		}
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day1_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day1_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day1_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2021day1_part2(input));
	const part2After = performance.now();

	logSolution(1, 2021, part1Solution, part2Solution);

	log(chalk.gray("--- Performance ---"));
	log(chalk.gray(`Part 1: ${util.formatTime(part1After - part1Before)}`));
	log(chalk.gray(`Part 2: ${util.formatTime(part2After - part2Before)}`));
	log();
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});
