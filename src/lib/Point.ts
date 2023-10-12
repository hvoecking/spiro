export class Point {
  static zero() {
    return new Point(0, 0);
  }
  static one() {
    return new Point(1, 1);
  }

  constructor(public x: number, public y: number) {}

  subtract(other: Point) {
    return new Point(this.x - other.x, this.y - other.y);
  }

  scale(factor: number) {
    return new Point(this.x * factor, this.y * factor);
  }
}
