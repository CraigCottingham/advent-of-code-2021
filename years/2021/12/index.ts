import chalk from "chalk"
import { performance } from "perf_hooks"
import { log, logSolution } from "../../../util/log"
import * as test from "../../../util/test"
import * as util from "../../../util/util"
const YEAR = 2021
const DAY = 12

// solution path: /Users/ccottingham/Projects/advent-of-code/2021/years/2021/12/index.ts
// data path    : /Users/ccottingham/Projects/advent-of-code/2021/years/2021/12/data.txt
// problem url  : https://adventofcode.com/2021/day/12

class Node {
	label: string
	big: boolean
	neighbors: Set<string>

	constructor(label: string) {
		this.label = label
		this.big = (label == label.toUpperCase())
		this.neighbors = new Set()
	}

	addNeighbor(other: string) {
		this.neighbors.add(other)
	}
}

class Graph {
	nodes: Map<string, Node>

	constructor() {
		this.nodes = new Map()
	}

	add(node: Node) {
		this.nodes.set(node.label, node)
	}

	get(label: string) {
		let node = this.nodes.get(label)
		if (!node) {
			node = new Node(label)
			this.add(node)
		}
		return node
	}
}

class Solution {
	graph: Graph
	path: Array<string>

	constructor(graph: Graph) {
		this.graph = graph
		this.path = new Array()
	}
}

async function p2021day12_part1(input: string, ...params: any[]) {
	const data = util.lineify(input.trim())
	const graph = new Graph()

	for (let pair of data) {
		const [a, b] = pair.split("-")
		const nodeA = graph.get(a)
		const nodeB = graph.get(b)
		nodeA.addNeighbor(b)
		nodeB.addNeighbor(a)
	}

	const path = new Array<string>()
	path.push("start")
	const paths = new Array<Array<string>>()
	findAllPaths(graph, path, paths, "start", "end", smallOnceAndBig)

	return paths.length
}

async function p2021day12_part2(input: string, ...params: any[]) {
	const data = util.lineify(input.trim())
	const graph = new Graph()

	for (let pair of data) {
		const [a, b] = pair.split("-")
		const nodeA = graph.get(a)
		const nodeB = graph.get(b)
		nodeA.addNeighbor(b)
		nodeB.addNeighbor(a)
	}

	const path = new Array<string>()
	path.push("start")
	const paths = new Array<Array<string>>()
	findAllPaths(graph, path, paths, "start", "end", oneSmallTwiceAndBig)

	// for (let path of paths) {
	// 	console.log(`${path}`)
	// }

	return paths.length
}

function anySmallCaveVisitedTwice(path: Array<string>): boolean {
	const counts = new Map<string, number>()
	for (let node of path.filter((label) => label !== label.toUpperCase())) {
		counts.set(node, (counts.get(node) || 0) + 1)
	}
	return Array.from(counts.values()).some((n) => n >= 2)
}

function findAllPaths(graph: Graph, path: Array<string>, solutions: Array<Array<string>>, startLabel: string, endLabel: string, nodeCanBeVisited: (path: Array<string>, nextLabel: string) => boolean) {
	const node = graph.get(startLabel)
	for (let nextLabel of Array.from(node.neighbors)) {
		if (nextLabel === endLabel) {
			const solution = Array.from(path)
			solution.push("end")
			solutions.push(solution)
		} else {
			if (nodeCanBeVisited(path, nextLabel)) {
				path.push(nextLabel)
				findAllPaths(graph, path, solutions, nextLabel, endLabel, nodeCanBeVisited)
				path.pop()
			}
		}
	}
}

function oneSmallTwiceAndBig(path: Array<string>, nextLabel: string): boolean {
	if (nextLabel === "start") {
		return false
	}

	if (nextLabel === nextLabel.toUpperCase()) {
		return true
	}

	if (!path.includes(nextLabel)) {
		return true
	}

	if (anySmallCaveVisitedTwice(path)) {
		return false
	}

	return true
}

function smallOnceAndBig(path: Array<string>, nextLabel: string): boolean {
	return !path.includes(nextLabel) || (nextLabel === nextLabel.toUpperCase())
}

async function run() {
	const data1 = `
start-A
start-b
A-c
A-b
b-d
A-end
b-end
	`
	const data2 = `
dc-end
HN-start
start-kj
dc-start
dc-HN
LN-dc
HN-end
kj-sa
kj-HN
kj-dc
	`
	const data3 = `
fs-end
he-DX
fs-he
start-DX
pj-DX
end-zg
zg-sl
zg-pj
pj-he
RW-he
fs-DX
pj-RW
zg-RW
start-pj
he-WI
zg-he
pj-fs
start-RW
	`

	const part1tests: TestCase[] = [
		{
			input: data1,
			expected: "10"
		},
		{
			input: data2,
			expected: "19"
		},
		{
			input: data3,
			expected: "226"
		}
	]
	const part2tests: TestCase[] = [
		{
			input: data1,
			expected: "36"
		},
		{
			input: data2,
			expected: "103"
		},
		{
			input: data3,
			expected: "3509"
		}
	]

	// Run tests
	test.beginTests()
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day12_part1(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day12_part2(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	test.endTests()

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR)

	const part1Before = performance.now()
	const part1Solution = String(await p2021day12_part1(input))
	const part1After = performance.now()

	const part2Before = performance.now()
	const part2Solution = String(await p2021day12_part2(input))
	const part2After = performance.now()

	logSolution(12, 2021, part1Solution, part2Solution)

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
