import chalk from "chalk"
import { performance } from "perf_hooks"
import { log, logSolution } from "../../../util/log"
import * as test from "../../../util/test"
import * as util from "../../../util/util"

const YEAR = 2021
const DAY = 16

// solution path: /Users/ccottingham/Projects/advent-of-code/2021/years/2021/16/index.ts
// data path    : /Users/ccottingham/Projects/advent-of-code/2021/years/2021/16/data.txt
// problem url  : https://adventofcode.com/2021/day/16

enum LengthMode {
	Width = 0,
	Count = 1
}

type Packet = {
	version: number
	typeID: number
}

type NullablePacket = Packet | null

type Literal = Packet & {
	value: number | undefined
}

type Operator = Packet & {
	mode: LengthMode
	packets: NullablePacket[]
}

async function p2021day16_part1(input: string, ...params: any[]) {
	const data = util.lineify(input.trim())
	const bitstream = data[0].split("").map((digit) => digitToBinary(digit)).join("").split("")
	const packets = []

	// this would be an opportunity to define an iterator on the bitstream, wouldn't it?
	// basically, read packets off of bitstream until empty and return a packet array

	while (bitstream.length > 0) {
		packets.push(readPacket(bitstream))
	}

	return versionSum(packets)
}

async function p2021day16_part2(input: string, ...params: any[]) {
	return "Not implemented"
}

function binaryToNumber(bits: string[]): number {
	return Number.parseInt(bits.join(""), 2)
}

function digitToBinary(digit: string): string {
	switch (digit) {
		case "1":
			return "0001"

		case "2":
			return "0010"

		case "3":
			return "0011"

		case "4":
			return "0100"

		case "5":
			return "0101"

		case "6":
			return "0110"

		case "7":
			return "0111"

		case "8":
			return "1000"

		case "9":
			return "1001"

		case "A":
			return "1010"

		case "B":
			return "1011"

		case "C":
			return "1100"

		case "D":
			return "1101"

		case "E":
			return "1110"

		case "F":
			return "1111"

		default:
			return "0000"
	}
}

function readLiteral(bitstream: string[]): Literal {
	const version = readNumber(bitstream, 3)
	readNumber(bitstream, 3)
	let valueBits = []

	while (bitstream[0] === "1") {
		bitstream.shift()
		valueBits.push(...bitstream.splice(0, 4))
	}
	bitstream.shift()
	valueBits.push(...bitstream.splice(0, 4))

	return {
		version,
		typeID: 4,
		value: binaryToNumber(valueBits)
	}
}

function readNumber(bitstream: string[], width: number): number {
	return binaryToNumber(bitstream.splice(0, width))
}

function readOperator(bitstream: string[]): Operator {
	const version = readNumber(bitstream, 3)
	const typeID = readNumber(bitstream, 3)
	const mode = readNumber(bitstream, 1) as LengthMode
	const packets: NullablePacket[] = []

	switch (mode) {
		case LengthMode.Width:
			{
				const width = readNumber(bitstream, 15)
				const subpacketBits = bitstream.splice(0, width)
				while (subpacketBits.length > 0) {
					packets.push(readPacket(subpacketBits))
				}
			}
			break

		case LengthMode.Count:
			{
				const count = readNumber(bitstream, 11)
				for (let i = 0; i < count; ++i) {
					packets.push(readPacket(bitstream))
				}
			}
			break
	}

	return {
		version,
		typeID,
		mode,
		packets
	}
}

function readPacket(bitstream: string[]): Packet | null {
	if (bitstream.length < 6) {
		bitstream.splice(0, bitstream.length)
		return null
	}

	if (binaryToNumber(bitstream.slice(3, 6)) === 4) {
		return readLiteral(bitstream)
	} else {
		return readOperator(bitstream)
	}
}

function versionSum(packets: NullablePacket[]): number {
	return packets.reduce((acc, packet) => {
		if (packet === null) {
			return acc
		}

		if (packet.typeID !== 4) {
			acc += versionSum((packet as Operator).packets)
		}

		return acc + packet.version
	}, 0)
}

async function run() {
	const testData = `
`
	const part1tests: TestCase[] = [
		{
			input: "8A004A801A8002F478",
			expected: "16"
		},
		{
			input: "620080001611562C8802118E34",
			expected: "12"
		},
		{
			input: "C0015000016115A2E0802F182340",
			expected: "23"
		},
		{
			input: "A0016C880162017C3686B18A3D4780",
			expected: "31"
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
			test.logTestResult(testCase, String(await p2021day16_part1(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day16_part2(testCase.input, ...(testCase.extraArgs || []))))
		}
	})
	test.endTests()

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR)

	const part1Before = performance.now()
	const part1Solution = String(await p2021day16_part1(input))
	const part1After = performance.now()

	const part2Before = performance.now()
	const part2Solution = String(await p2021day16_part2(input))
	const part2After = performance.now()

	logSolution(16, 2021, part1Solution, part2Solution)

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
