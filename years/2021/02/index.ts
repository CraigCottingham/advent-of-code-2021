import chalk from "chalk";
import { performance } from "perf_hooks";
import { log, logSolution } from "../../../util/log";
import * as test from "../../../util/test";
import * as util from "../../../util/util";

const YEAR = 2021;
const DAY = 2;

// solution path: /Users/ccottingham/Projects/advent-of-code/2021/years/2021/02/index.ts
// data path    : /Users/ccottingham/Projects/advent-of-code/2021/years/2021/02/data.txt
// problem url  : https://adventofcode.com/2021/day/2

async function p2021day2_part1(input: string, ...params: any[]) {
	let h = 0;
	let v = 0;

	util.lineify(input).forEach((s) => {
		const instruction = s.match(/(forward|down|up)\s+(\d+)/);
		if (instruction) {
			const direction = instruction[1];
			const amount = Number(instruction[2]);

			switch (direction) {
				case "forward":
					h += amount;
					break;

				case "down":
					v += amount;
					break;

				case "up":
					v -= amount;
					break;
			}
		}
	});

	return `${h * v}`;
}

async function p2021day2_part2(input: string, ...params: any[]) {
	return "Not implemented";
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `
forward 5
down 5
forward 8
up 3
down 8
forward 2
			`,
			expected: "150"
		}
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day2_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day2_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day2_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2021day2_part2(input));
	const part2After = performance.now();

	logSolution(2, 2021, part1Solution, part2Solution);

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
