import chalk from "chalk"
import { performance } from "perf_hooks"
import { log, logSolution } from "../../../util/log"
import { difference, intersection, union } from "../../../util/set"
import * as test from "../../../util/test"
import * as util from "../../../util/util"

const YEAR = 2021
const DAY = 8

// solution path: /Users/ccottingham/Projects/advent-of-code/2021/years/2021/08/index.ts
// data path    : /Users/ccottingham/Projects/advent-of-code/2021/years/2021/08/data.txt
// problem url  : https://adventofcode.com/2021/day/8

async function p2021day8_part1(input: string, ...params: any[]) {
	const data = util.lineify(input)
								   .map((line) => line.trim().split(" | "))
									 .map(([signals, digits]) => [signals.split(" "), digits.split(" ")])

	return data.reduce((acc, [_s, d]) => {
		const numDigits = d.filter((digit) => (digit.length == 2) || (digit.length == 4) || (digit.length == 3) || (digit.length == 7)).length
		return acc + numDigits
	}, 0)
}

async function p2021day8_part2(input: string, ...params: any[]) {
	const data = util.lineify(input)
								   .map((line) => line.trim().split(" | "))
									 .map(([signals, digits]) => [signals.split(" "), digits.split(" ")])

	return data.reduce(((acc, d) => acc + Number(solveDisplay(d[0], d[1]))), 0)
}

function extractSignal(s: Set<string>): string {
	return Array.from(s.values())[0]
}

// Assuming the segments are labeled with 1-7:
//
//    AAAA
//   B    C
//   B    C
//    DDDD
//   E    F
//   E    F
//    GGGG
//
// each digit uses the segments mapped below:
//
//   0: ABC.EFG (6)
//   1: ..C..F. (2)
//   2: A.CDE.G (5)
//   3: A.CD.FG (5)
//   4: .BCD.F. (4)
//   5: AB.D.FG (5)
//   6: AB.DEFG (6)
//   7: A.C..F. (3)
//   8: ABCDEFG (7)
//   9: ABCD.FG (6)
//
// and we can start building some rules.
//
// 1. The only digit with two segments is 1. The only digit with three segments is 7. It uses the same segments as 1 *plus* segment A.
//    Therefore, (signals for 7) - (signals for 1) = (signal for A).
// 2. The only digits with six segments are 0, 6, and 9. The segments they have in common are A, B, F, and G.
//    The only digit with four segments is 4. The segments it has in common with 0, 6, and 8 are B and F.
//    so (signals for 0) x (signals for 6) x (signals for 9) x (signals for 4) = (signal for A) + (signal for G).
//    Therefore, ((signals for 0) x (signals for 6) x (signals for 9) x (signals for 4)) - (signal for A) = (signal for G).
// 3. Digits 0 and 9 use the same segments as 1, while digit 6 uses only F.
//    Therefore, digit 6 is the only one of the three for which (signals for digit) x (signals for 1) = one signal, which is (signal for F).
// 4. Therefore, (signals for 1) - (signal for F) = (signal for C).
// 5. The only digits with five segments are 2, 3, and 5. Only digit 3 uses both segments used by digit 1.
//    Therefore, (signals for 3) - (signal for A) - (signal for C) - (signal for F) - (signal for G) = (signal for D).
// 6. The only digit with four segments is 4. We know signals C, D, and F.
//    Therefore, (signals for 4) - (signal for C) - (signal for D) - (signal for F) = (signal for B).
// 7. Therefore, the remaining unassigned signal is (signal for E).

function solveDisplay(signalData: Array<string>, displayData: Array<string>): string {
	const signalPatterns = signalData.reduce((acc, signals) => {
		const signalSet = signals.split("").reduce((acc2, s) => {
			return acc2.add(s)
		}, new Set<string>())
		acc.push(signalSet)
		return acc
	}, new Array<Set<string>>())

	const displaySignals = displayData.map((s) => s.split("").sort().join(""))

	const signalMap: Map<string, string> = new Map()

	// rule 1

	const signals1 = signalPatterns.splice(signalPatterns.findIndex((s) => s.size === 2), 1)[0]
	const signals7 = signalPatterns.splice(signalPatterns.findIndex((s) => s.size === 3), 1)[0]
	const signalA = difference(signals7, signals1)
	signalMap.set("a", extractSignal(signalA))

	// rule 2

	const signals4 = signalPatterns.splice(signalPatterns.findIndex((s) => s.size === 4), 1)[0]
	const signalsWith6 = signalPatterns.filter((s) => s.size === 6)
	const signalG = difference(difference(intersection(intersection(signalsWith6[0], signalsWith6[1]), signalsWith6[2]), signals4), signalA)
	signalMap.set("g", extractSignal(signalG))

	// rule 3

	const signals6 = signalsWith6.find((s) => intersection(s, signals1).size === 1)
	const signalF = intersection(signals6!, signals1)
	signalMap.set("f", extractSignal(signalF))

	// rule 4

	const signalC = difference(signals1, signalF)
	signalMap.set("c", extractSignal(signalC))

	// rule 5

	const signalsWith5 = signalPatterns.filter((s) => s.size === 5)
	const signals3 = signalsWith5.find((s) => intersection(s, signals1).size === 2)
	const signalD = difference(difference(signals3!, signals1), union(signalA, signalG))
	signalMap.set("d", extractSignal(signalD))

	// rule 6

	const signalB = difference(signals4, union(union(signalC, signalD), signalF))
	signalMap.set("b", extractSignal(signalB))

	// rule 7

	const signals8 = signalPatterns.splice(signalPatterns.findIndex((s) => s.size === 7), 1)[0]
	const signalE = difference(signals8, union(union(union(union(union(signalA, signalB), signalC), signalD), signalF), signalG))
	signalMap.set("e", extractSignal(signalE))

	// which signals need to be on for each digit to be displayed
	const digitMap: Map<string, string> = new Map()
	digitMap.set("abcefg".split("").map((c) => signalMap.get(c)).sort().join(""), "0")
	digitMap.set("cf".split("").map((c) => signalMap.get(c)).sort().join(""), "1")
	digitMap.set("acdeg".split("").map((c) => signalMap.get(c)).sort().join(""), "2")
	digitMap.set("acdfg".split("").map((c) => signalMap.get(c)).sort().join(""), "3")
	digitMap.set("bcdf".split("").map((c) => signalMap.get(c)).sort().join(""), "4")
	digitMap.set("abdfg".split("").map((c) => signalMap.get(c)).sort().join(""), "5")
	digitMap.set("abdefg".split("").map((c) => signalMap.get(c)).sort().join(""), "6")
	digitMap.set("acf".split("").map((c) => signalMap.get(c)).sort().join(""), "7")
	digitMap.set("abcdefg".split("").map((c) => signalMap.get(c)).sort().join(""), "8")
	digitMap.set("abcdfg".split("").map((c) => signalMap.get(c)).sort().join(""), "9")

	return displaySignals.map((s) => digitMap.get(s)).join("")
}

async function run() {
	const testData = `
be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe
edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc
fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg
fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb
aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea
fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb
dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe
bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef
egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb
gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce
`
	const part1tests: TestCase[] = [
		{
			input: testData,
			expected: "26"
		}
	]
	const part2tests: TestCase[] = [
		{
			input: "be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe",
			expected: "8394"
		},
		{
			input: "edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc",
			expected: "9781"
		},
		{
			input: "fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg",
			expected: "1197"
		},
		{
			input: "fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb",
			expected: "9361"
		},
		{
			input: "aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea",
			expected: "4873"
		},
		{
			input: "fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb",
			expected: "8418"
		},
		{
			input: "dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe",
			expected: "4548"
		},
		{
			input: "bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef",
			expected: "1625"
		},
		{
			input: "egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb",
			expected: "8717"
		},
		{
			input: "gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce",
			expected: "4315"
		},
		{
			input: testData,
			expected: "61229"
		}
	]

	// Run tests
	test.beginTests()
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day8_part1(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day8_part2(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	test.endTests()

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR)

	const part1Before = performance.now()
	const part1Solution = String(await p2021day8_part1(input))
	const part1After = performance.now()

	const part2Before = performance.now()
	const part2Solution = String(await p2021day8_part2(input))
	const part2After = performance.now()

	logSolution(8, 2021, part1Solution, part2Solution)

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
