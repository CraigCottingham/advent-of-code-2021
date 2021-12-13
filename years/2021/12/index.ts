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

function nextNodes(graph: Graph, label: string): Array<string> {
	const node = graph.get(label)
	return Array.from(node.neighbors)
}

function findAllPaths(graph: Graph, connectionPath: Array<string>, connectionPaths: Array<Array<string>>, startLabel: string, endLabel: string) {
	const node = graph.get(startLabel)
	for (let nextLabel of Array.from(node.neighbors)) {
		if (nextLabel === endLabel) {
			const temp = new Array<string>()
			for (let node1 of connectionPath) {
				temp.push(node1)
			}
			temp.push(endLabel)
			connectionPaths.push(temp)
		} else if (!connectionPath.includes(nextLabel) || (nextLabel === nextLabel.toUpperCase())) {
			connectionPath.push(nextLabel)
			findAllPaths(graph, connectionPath, connectionPaths, nextLabel, endLabel)
			connectionPath.pop()
		}
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

	const connectionPath = new Array<string>()
	const connectionPaths = new Array<Array<string>>()
	connectionPath.push("start")
	findAllPaths(graph, connectionPath, connectionPaths, "start", "end")

	return connectionPaths.length
}

async function p2021day12_part2(input: string, ...params: any[]) {
	return "Not implemented"
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `
start-A
start-b
A-c
A-b
b-d
A-end
b-end
			`,
			expected: "10"
		},
		{
			input: `
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
			`,
			expected: "19"
		},
		{
			input: `
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
			`,
			expected: "226"
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
