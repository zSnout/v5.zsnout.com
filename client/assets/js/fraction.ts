let config: PropertyDescriptor = {
  configurable: false,
  enumerable: true,
  writable: false,
};

export default class BigFraction implements Iterable<bigint> {
  static gcd(a: bigint, b: bigint): bigint {
    return b === 0n ? (a < 0n ? -a : a) : this.gcd(b, a % b);
  }

  static lcm(a: bigint, b: bigint): bigint {
    return (a * b) / this.gcd(a, b);
  }

  static trim(result: string) {
    let trimmed = result.match(/^0*(?=\d\.|\d$)/);
    if (trimmed) result = result.slice(trimmed[0].length);
    trimmed = result.match(/\.0*$/);
    if (trimmed) result = result.slice(0, trimmed.index);

    if (result.endsWith(".") && !result.endsWith(".."))
      result = result.slice(0, -1);
    if (result.length == 0) result = "0";

    return result;
  }

  static from(decimal: any) {
    let match;
    let number = String(decimal);
    let isNeg = number.startsWith("-") ? -1n : number.startsWith("+") ? 1n : 0n;
    if (isNeg) number = number.slice(1);
    let neg = new BigFraction(isNeg || 1n, 1n);

    if ((match = number.match(/^(\d+)\/(\d+)$/)))
      return new BigFraction(BigInt(match[1]), BigInt(match[2])).mult(neg);

    if ((match = number.match(/^(\d+)(?:\.0*)?$/)))
      return new BigFraction(BigInt(match[1])).mult(neg);

    if ((match = number.match(/^(\d+)\.(\d+)$/)))
      return new BigFraction(BigInt(match[1]))
        .add(new BigFraction(BigInt(match[2]), 10n ** BigInt(match[2].length)))
        .mult(neg);

    if ((match = number.match(/^(\d+) (\d+)\/(\d+)$/)))
      return new BigFraction(BigInt(match[1]))
        .add(new BigFraction(BigInt(match[2]), BigInt(match[3])))
        .mult(neg);

    if ((match = number.match(/^(\d+)\.(\d*)\[(\d+)\]\.\.\.$/)))
      return new BigFraction(BigInt(match[1]))
        .add(
          new BigFraction(
            BigInt(match[2] || "0"),
            10n ** BigInt((match[2] || "0").length)
          )
        )
        .add(
          new BigFraction(BigInt(match[3]), 10n ** BigInt(match[3].length) - 1n)
        )
        .mult(neg);

    throw new RangeError(`Invalid number: ${number}`);
  }

  readonly nmr!: bigint;
  readonly dnmr!: bigint;

  constructor(number: string);
  constructor(nmr: number, dnmr?: number);
  constructor(nmr: bigint, dnmr?: bigint);
  constructor(nmr: bigint | number | string = 0n, dnmr: bigint | number = 1n) {
    if (typeof nmr == "number" || typeof dnmr == "number") {
      let a = Number(nmr);
      let b = Number(dnmr);
      let d = Math.max(
        (a.toString().split(".")[1] || "").length,
        (b.toString().split(".")[1] || "").length
      );
      let n = 10 ** d;
      return new BigFraction(BigInt(a * n), BigInt(b * n));
    } else if (typeof nmr == "string") return BigFraction.from(nmr);

    nmr = BigInt(nmr);
    dnmr = BigInt(dnmr);
    if (dnmr < 0n) (nmr *= -1n), (dnmr *= -1n);

    let gcd = BigFraction.gcd(nmr, dnmr);

    Object.defineProperty(this, "nmr", { ...config, value: nmr / gcd });
    Object.defineProperty(this, "dnmr", { ...config, value: dnmr / gcd });
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

  round() {
    let str = this.toString(1);
    if (!str.includes(".")) return this;

    let match = str.match(/^(-?\d+)\.([0-9])/);
    if (!match) return new BigFraction(BigInt(str.split(".")[0]));

    let [, int, dec] = match;
    if (+dec < 5) return new BigFraction(BigInt(int));
    return new BigFraction(BigInt(int) + 1n);
  }

  scale(dnmr: bigint | number) {
    dnmr = BigInt(dnmr);
    let scalar = new BigFraction(dnmr, this.dnmr);
    return new BigFraction(
      new BigFraction(this.nmr).mult(scalar).round().nmr,
      dnmr
    );
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
    let decimal = 0;

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

    throw new RangeError("Escaped infinite loop"); // should never happen
  }

  toDecimal(precision: number = 20) {
    return +this.toString(precision);
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

  [Symbol.toPrimitive](hint: "string"): string;
  [Symbol.toPrimitive](hint: "number"): number;
  [Symbol.toPrimitive](hint?: any): string | number {
    if (hint == "number") return this.toDecimal();
    return this.toString();
  }
}

let a = +new BigFraction(1, 2);
