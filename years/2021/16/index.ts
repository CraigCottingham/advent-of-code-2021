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
	return versionSum(parseBitstream(input))
}

async function p2021day16_part2(input: string, ...params: any[]) {
	return evaluate(parseBitstream(input))
}

function binaryToNumber(bits: string[]): number {
	return Number.parseInt(bits.join(""), 2)
}

function decompile(packet: NullablePacket): string {
	let output = ""

	if (packet === null) {
		output = chalk.white("null")
	} else {
		switch (packet.typeID) {
			case 0:		// sum
				{
					let subpackets = (packet as Operator).packets.map((packet: NullablePacket) => decompile(packet))
					output = chalk.blueBright(`( + ${subpackets.join(" ")} )`)
				}
				break

			case 1:   // prod
				{
					let subpackets = (packet as Operator).packets.map((packet: NullablePacket) => decompile(packet))
					output = chalk.blueBright(`( * ${subpackets.join(" ")} )`)
				}
				break

			case 2:		// min
				{
					let subpackets = (packet as Operator).packets.map((packet: NullablePacket) => decompile(packet))
					output = chalk.blueBright(`( min ${subpackets.join(" ")} )`)
				}
				break

			case 3:		// max
				{
					let subpackets = (packet as Operator).packets.map((packet: NullablePacket) => decompile(packet))
					output = chalk.blueBright(`( max ${subpackets.join(" ")} )`)
				}
				break

			case 4:		// literal
				output = chalk.greenBright((packet as Literal).value)
				break

			case 5:		// greater than?
				{
					let subpackets = (packet as Operator).packets.map((packet: NullablePacket) => decompile(packet))
					output = chalk.blueBright(`( gt ${subpackets.join(" ")} )`)
				}
				break

			case 6:		// less than?
				{
					let subpackets = (packet as Operator).packets.map((packet: NullablePacket) => decompile(packet))
					output = chalk.blueBright(`( lt ${subpackets.join(" ")} )`)
				}
				break

			case 7:		// equal?
				{
					let subpackets = (packet as Operator).packets.map((packet: NullablePacket) => decompile(packet))
					output = chalk.blueBright(`( eq ${subpackets.join(" ")} )`)
				}
				break

			default:	// unknown
				output = chalk.redBright("?")
				break
		}
	}

	return output
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

function evaluateOne(packet: Packet): Literal {
	switch (packet.typeID) {
		case 0:		// sum
			{
				const operands = (packet as Operator).packets
				const value = operands.map((p) => evaluateOne(p!)).reduce((acc, p) => acc + (p.value === undefined ? 0 : p.value), 0)
				return makeLiteral(value)
			}

		case 1:		// product
			{
				const operands = (packet as Operator).packets
				const value = operands.map((p) => evaluateOne(p!)).reduce((acc, p) => acc * (p.value === undefined ? 1 : p.value), 1)
				return makeLiteral(value)
			}

		case 2:		// minimum
			{
				const operands = (packet as Operator).packets
				return makeLiteral(util.min(operands, (p) => evaluateOne(p!).value!).value)
			}

		case 3:		// maximum
			{
				const operands = (packet as Operator).packets
				return makeLiteral(util.max(operands, (p) => evaluateOne(p!).value!).value)
			}

		case 4:		// literal
			return packet as Literal

		case 5:		// greater than?
			{
				const operands = (packet as Operator).packets
				const lhs = evaluateOne(operands[0]!).value!
				const rhs = evaluateOne(operands[1]!).value!
				return makeLiteral((lhs > rhs) ? 1 : 0)
			}

		case 6:		// less than?
			{
				const operands = (packet as Operator).packets
				const lhs = evaluateOne(operands[0]!).value!
				const rhs = evaluateOne(operands[1]!).value!
				return makeLiteral((lhs < rhs) ? 1 : 0)
			}

		case 7:		// equal?
			{
				const operands = (packet as Operator).packets
				const lhs = evaluateOne(operands[0]!).value!
				const rhs = evaluateOne(operands[1]!).value!
				return makeLiteral((lhs == rhs) ? 1 : 0)
			}

		default:
			return makeLiteral(0)
	}
}

function evaluate(packets: NullablePacket[]): number {
	return packets.reduce((acc, packet) => {
		if (packet === null) {
			return acc
		}
		acc.push(evaluateOne(packet).value!)
		return acc
	}, [] as number[]).shift()!
}

function makeLiteral(value: number): Literal {
	return {
		version: 0,
		typeID: 4,
		value
	}
}

function parseBitstream(input: string): NullablePacket[] {
	const data = util.lineify(input.trim())
	const bitstream = data[0].split("").map((digit) => digitToBinary(digit)).join("").split("")
	const packets = []

	// this would be an opportunity to define an iterator on the bitstream, wouldn't it?
	// basically, read packets off of bitstream until empty and return a packet array

	while (bitstream.length > 0) {
		packets.push(readPacket(bitstream))
	}

	if (packets.at(-1) === null) {
		packets.pop()
	}

	return packets
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
			// ( + 1 2 )
			input: "C200B40A82",
			expected: "3"
		},
		{
			// ( * 6 9 )
			input: "04005AC33890",
			expected: "54"
		},
		{
			// ( min 7 8 9 )
			input: "880086C3E88112",
			expected: "7"
		},
		{
			// ( max 7 8 9 )
			input: "CE00C43D881120",
			expected: "9"
		},
		{
			// ( lt 5 15 )
			input: "D8005AC2A8F0",
			expected: "1"
		},
		{
			// ( gt 5 15 )
			input: "F600BC2D8F",
			expected: "0"
		},
		{
			// ( eq 5 15 )
			input: "9C005AC2F8F0",
			expected: "0"
		},
		{
			// ( eq ( + 1 3 ) ( * 2 2 ) )
			input: "9C0141080250320F1802104A08",
			expected: "1"
		},
		{
			// ( + 192 )
			input: "0000404E00",
			expected: "192"
		},
		{
			// ( eq 16 30 )
			input: "1E008488048B80",
			expected: "0"
		},
		{
			// ( * 0 817 )
			input: "06008400939840",
			expected: "0"
		},
		{
			// ( * ( eq 16 30 ) 817 )
			input: "0600878021220122E1273080",
			expected: "0"
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
