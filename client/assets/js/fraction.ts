export default class BigFraction implements Iterable<bigint> {
  static gcd(a: bigint, b: bigint): bigint {
    return b === 0n ? (a < 0n ? -a : a) : this.gcd(b, a % b);
  }

  static lcm(a: bigint, b: bigint): bigint {
    return (a * b) / this.gcd(a, b);
  }

  static many(count: number, nmr: bigint | number, dnmr: bigint | number = 1) {
    return Array.from({ length: count }, () => new BigFraction(nmr, dnmr));
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

  toString() {
    return `${this.nmr}/${this.dnmr}`;
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
