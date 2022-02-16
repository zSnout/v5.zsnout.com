export default class BigFraction implements Iterable<bigint> {
  static gcd(a: bigint, b: bigint): bigint {
    return b === 0n ? (a < 0n ? -a : a) : this.gcd(b, a % b);
  }

  static lcm(a: bigint, b: bigint): bigint {
    return (a * b) / this.gcd(a, b);
  }

  static trim(result: string) {
    let trimmed = result.match(/^0*([\d.]+)(?:\.0*|0*)$/);
    if (trimmed) result = trimmed[1];
    if (result.endsWith(".") && !result.endsWith(".."))
      result = result.slice(0, -1);
    if (result.length == 0) result = "0";

    return result;
  }

  static from(decimal: any) {
    let number = String(decimal);
    let match;

    if ((match = number.match(/^(-?\d+)\/(-?\d+)$/)))
      return new BigFraction(BigInt(match[1]), BigInt(match[2]));

    if ((match = number.match(/^(-?\d+)(?:\.0*)?$/)))
      return new BigFraction(BigInt(number[1]));

    if ((match = number.match(/^(-?\d+)\.(\d+)$/)))
      return new BigFraction(BigInt(match[0])).add(
        new BigFraction(BigInt(match[1]), 10n ** BigInt(match[2]))
      );

    if ((match = number.match(/^(-?\d+) (\d+)\/(\d+)$/)))
      return new BigFraction(BigInt(match[1])).add(
        new BigFraction(BigInt(match[2]), BigInt(match[3]))
      );

    if ((match = number.match(/^(-\d+)\.(\d*)\[(\d+)\]\.\.\.$/)))
      return new BigFraction(BigInt(match[1]))
        .add(
          new BigFraction(
            BigInt(match[2] || "0"),
            10n ** BigInt((match[2] || "0").length)
          )
        )
        .add(
          new BigFraction(BigInt(match[3]), 10n ** BigInt(match[3].length) - 1n)
        );

    if (!number) throw new Error(`Invalid number: ${number}`);

    throw new RangeError(`Invalid number: ${number}`);
  }

  readonly nmr!: bigint;
  readonly dnmr!: bigint;

  constructor(number: string);
  constructor(nmr: number, dnmr?: number);
  constructor(nmr: bigint, dnmr?: bigint);
  constructor(nmr: bigint | number | string, dnmr: bigint | number = 1n) {
    if (typeof nmr == "number" || typeof dnmr == "number")
      return BigFraction.from(String(Number(nmr) / Number(dnmr)));
    if (typeof nmr == "string") return BigFraction.from(nmr);

    nmr = BigInt(nmr);
    dnmr = BigInt(dnmr);
    if (dnmr < 0n) (nmr *= -1n), (dnmr *= -1n);

    let gcd = BigFraction.gcd(nmr, dnmr);

    this.nmr = nmr / gcd;
    this.dnmr = dnmr / gcd;
  }

  add(other: BigFraction): BigFraction {
    return new BigFraction(
      this.nmr * other.dnmr + other.nmr * this.dnmr,
      this.dnmr * other.dnmr
    );
  }

  sub(other: BigFraction): BigFraction {
    return new BigFraction(
      this.nmr * other.dnmr - other.nmr * this.dnmr,
      this.dnmr * other.dnmr
    );
  }

  mult(other: BigFraction): BigFraction {
    return new BigFraction(this.nmr * other.nmr, this.dnmr * other.dnmr);
  }

  div(other: BigFraction): BigFraction {
    return new BigFraction(this.nmr * other.dnmr, this.dnmr * other.nmr);
  }

  pow(exp: bigint): BigFraction {
    return new BigFraction(this.nmr ** exp, this.dnmr ** exp);
  }

  sign() {
    return this.nmr === 0n ? 0n : this.nmr > 0n ? 1n : -1n;
  }

  abs() {
    return new BigFraction(this.nmr * this.sign(), this.dnmr);
  }

  flip() {
    return new BigFraction(this.dnmr, this.nmr);
  }

  toString(precision: number = Infinity) {
    let generator = (function* (nmr) {
      yield* nmr.toString().split("").map(BigInt);
      yield ".";
      while (true) yield 0n;
    })(this.nmr < 0n ? -this.nmr : this.nmr);
    let neg = this.nmr < 0n ? "-" : "";
    let result = "0";
    let history: bigint[] = [];
    let digit = 0n;
    let operand = 0n;
    let repeats = precision == Infinity;
    let decimal: true | number = 0;

    for (let next of generator) {
      if (next == ".") {
        decimal = 1;
        result += ".";
        continue;
      }

      if (decimal) decimal++;
      if (decimal - 2 >= precision || (decimal && operand == 0n && next == 0n))
        return neg + BigFraction.trim(result);

      operand = 10n * operand + next;
      digit = operand / this.dnmr;

      if (repeats && history.includes(operand)) {
        let index = history.indexOf(operand);
        let prefix = result.slice(0, index + 2);
        let repeated = result.slice(index + 2);
        return neg + BigFraction.trim(`${prefix}[${repeated}]...`);
      }

      result += digit;
      history.push(operand);
      operand = operand % this.dnmr;
    }
  }

  toDecimal() {
    return Number(this.nmr) / Number(this.dnmr);
  }

  toMixed() {
    let [nmr, dnmr] = this.toArray();
    if (nmr == 0n) return "0";

    let isNeg = nmr < 0n;
    nmr = nmr < 0n ? -nmr : nmr;

    if (nmr < dnmr) return isNeg ? `-${nmr}/${dnmr}` : `${nmr}/${dnmr}`;

    let whole = nmr / dnmr;
    nmr = nmr % dnmr;

    if (nmr == 0n) return isNeg ? `-${whole}` : `${whole}`;
    return `${isNeg ? "-" : ""}${whole} ${nmr}/${dnmr}`;
  }

  toArray(): [nmr: bigint, dnmr: bigint] {
    return [this.nmr, this.dnmr];
  }

  *[Symbol.iterator]() {
    yield this.nmr;
    yield this.dnmr;
  }
}
