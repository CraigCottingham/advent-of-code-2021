// I owe a huge debt of gratitude to [ric2b](https://github.com/ric2b) for this solution.
// I wrestled with the code for eight days and never could get anything to properly work,
// much less produce invalid answers. I have taken their solution, added types, and
// renamed variables. I may tear it apart and rebuild it some more in an effort to better
// understand how it works. Everything successful about it should be credited to ric2b,
// and everything which isn't is my fault.

import chalk from "chalk"
import { performance } from "perf_hooks"
import { log, logSolution } from "../../../util/log"
import * as test from "../../../util/test"
import * as util from "../../../util/util"

const YEAR = 2021
const DAY = 18

// solution path: /Users/ccottingham/Documents/Projects/advent-of-code/2021/years/2021/18/index.ts
// data path    : /Users/ccottingham/Documents/Projects/advent-of-code/2021/years/2021/18/data.txt
// problem url  : https://adventofcode.com/2021/day/18

async function p2021day18_part1(input: string, ...params: any[]) {
	const numbers = util.lineify(input.trim()).map((s) => JSON.parse(s))

	return magnitude(numbers.reduce(add))
}

async function p2021day18_part2(input: string, ...params: any[]) {
	return "Not implemented"
}

type Tree = {
	p: string
	v: any[] | number
}

function add(a: number, b: number) {
		const sum = [a, b]
		const tree = buildTree(sum)
		let adjacency
		do {
			adjacency = buildAdjacencyList(tree)
		} while (explode(tree, adjacency) || split(tree, adjacency))
		return simplifyTree(tree)
}

function buildAdjacencyList(tree: Tree, adjacency: string[] = []): string[] {
	if (Array.isArray(tree.v)) {
		tree.v.forEach(c => buildAdjacencyList(c, adjacency))
	} else {
		adjacency.push(tree.p)
	}
	return adjacency
}

function buildTree(sfNumber: any[], path = ''): Tree {
	const value: any[] = Array.isArray(sfNumber) ?
		[buildTree(sfNumber[0], path + 'L'), buildTree(sfNumber[1], path + 'R')]
		: sfNumber
	return { p: path, v: value }
}

function explode(tree: Tree, adjacency: string[], path = ''): boolean {
	const node = treeNode(tree, path)
	if(!Array.isArray(node.v)) return false
	if (path.length === 4) {
		const [a, b] = node.v
		const i = adjacency.findIndex(path => path === a.p)
		const pathToPrev = adjacency[i-1]
		const pathToNext = adjacency[i+2]
		if (pathToPrev) treeNode(tree, pathToPrev).v += a.v
		if (pathToNext) treeNode(tree, pathToNext).v += b.v
		node.v = 0
		return true
	}
	return explode(tree, adjacency, path + 'L') || explode(tree, adjacency, path + 'R')
}

function magnitude(sfNumber: any[]): number {
	return sfNumber
		.map(n => Array.isArray(n) ? magnitude(n) : n)
		.reduce((a, b) => (3 * a) + (2 * b))
}

function simplifyTree(tree: Tree): any[] | number {
	return (tree.v as any[]).map(c => Array.isArray(c.v) ? simplifyTree(c) : c.v)
}

function split(tree: Tree, adjacency: string[], path = ''): boolean {
	const node = treeNode(tree, path)
	if (Array.isArray(node.v)) {
		return split(tree, adjacency, path + 'L') || split(tree, adjacency, path + 'R')
	}
	if (node.v < 10) return false
	node.v = [{ p: node.p + 'L', v: Math.floor(node.v/2) }, { p: node.p + 'R', v: Math.ceil(node.v/2) }]
	return true
}

function treeNode(tree: Tree, path: string): Tree {
	switch (path[0]) {
		case 'L':
			return treeNode((tree.v as any[])[0], path.slice(1))
		case 'R':
			return treeNode((tree.v as any[])[1], path.slice(1))
		default:
			return tree
	}
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: "[9,1]",
			expected: "29"
		},
		{
			input: "[1,9]",
			expected: "21"
		},
		{
			input: "[[9,1],[1,9]]",
			expected: "129"
		},
		{
			input: "[[1,2],[[3,4],5]]",
			expected: "143"
		},
		{
			input: "[[[[0,7],4],[[7,8],[6,0]]],[8,1]]",
			expected: "1384"
		},
		{
			input: "[[[[1,1],[2,2]],[3,3]],[4,4]]",
			expected: "445"
		},
		{
			input: "[[[[3,0],[5,3]],[4,4]],[5,5]]",
			expected: "791"
		},
		{
			input: "[[[[5,0],[7,4]],[5,5]],[6,6]]",
			expected: "1137"
		},
		{
			input: "[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]",
			expected: "3488"
		},
		{
			input: "[[[[6,6],[7,6]],[[7,7],[7,0]]],[[[7,7],[7,7]],[[7,8],[9,9]]]]",
			expected: "4140"
		}
	]
	const part2tests: TestCase[] = [
		{
			input: "",
			expected: ""
		}
	]

	// Run tests
	test.beginTests()
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day18_part1(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day18_part2(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	test.endTests()

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR)

	const part1Before = performance.now()
	const part1Solution = String(await p2021day18_part1(input))
	const part1After = performance.now()

	const part2Before = performance.now()
	const part2Solution = String(await p2021day18_part2(input))
	const part2After = performance.now()

	logSolution(18, 2021, part1Solution, part2Solution)

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
