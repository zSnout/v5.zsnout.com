export default class BigFraction implements Iterable<bigint> {
  static gcd(a: bigint, b: bigint): bigint {
    return b === 0n ? (a < 0n ? -a : a) : this.gcd(b, a % b);
  }

  static lcm(a: bigint, b: bigint): bigint {
    return (a * b) / this.gcd(a, b);
  }

  static trim(result: string) {
    let trimmed = result.match(/^0*([0-9].+)(?:\.0*|0*)$/);
    if (trimmed) result = trimmed[1];
    if (result.endsWith(".")) result = result.slice(0, -1);
    if (result.length == 0) result = "0";
    return result;
  }

  readonly nmr: bigint;
  readonly dnmr: bigint;
  constructor(nmr: bigint | number, dnmr: bigint | number = 1n) {
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

  toString(precision: number = Infinity) {
    let generator = (function* (nmr) {
      yield* nmr.toString().split("").map(BigInt);
      yield ".";
      while (true) yield 0n;
    })(this.nmr);
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
        return BigFraction.trim(result);

      operand = 10n * operand + next;
      digit = operand / this.dnmr;

      if (repeats && history.includes(operand)) {
        let index = history.indexOf(operand);
        return BigFraction.trim(
          `${result.slice(0, index + 2)}[${result.slice(index + 2)}]`
        );
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
    if (nmr < dnmr) return `${nmr}/${dnmr}`;

    let isNeg = nmr < 0n;
    nmr = nmr < 0n ? -nmr : nmr;

    let whole = nmr / dnmr;
    nmr = nmr % dnmr;

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
