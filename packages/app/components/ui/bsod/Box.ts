import Point from './Point';

const shadowLength = 2000; // TODO: should be calculated

export default class Box {
  public position: Point;
  private angle: number;
  public color: string;
  private readonly shadowColor: string;

  private _size: number;
  private _halfSize: number;

  constructor(
    size: number,
    position: Point,
    startRotate: number,
    color: string,
    shadowColor: string,
  ) {
    this.size = size;
    this.position = position;
    this.color = color;
    this.angle = startRotate;
    this.shadowColor = shadowColor;
  }

  public get size(): number {
    return this._size;
  }

  public set size(size: number) {
    this._size = size;
    this._halfSize = Math.floor(size / 2);
  }

  public get halfSize(): number {
    return this._halfSize;
  }

  get points(): { p1: Point; p2: Point; p3: Point; p4: Point } {
    const full = (Math.PI * 2) / 4;

    const p1: Point = {
      x: this.position.x + this._halfSize * Math.sin(this.angle),
      y: this.position.y + this._halfSize * Math.cos(this.angle),
    };

    const p2: Point = {
      x: this.position.x + this._halfSize * Math.sin(this.angle + full),
      y: this.position.y + this._halfSize * Math.cos(this.angle + full),
    };

    const p3: Point = {
      x: this.position.x + this._halfSize * Math.sin(this.angle + full * 2),
      y: this.position.y + this._halfSize * Math.cos(this.angle + full * 2),
    };

    const p4: Point = {
      x: this.position.x + this._halfSize * Math.sin(this.angle + full * 3),
      y: this.position.y + this._halfSize * Math.cos(this.angle + full * 3),
    };

    return { p1, p2, p3, p4 };
  }

  rotate(): void {
    const speed = (60 - this._halfSize) / 20;
    this.angle += speed * 0.002;
    this.position.x += speed;
    this.position.y += speed;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { points } = this;
    ctx.beginPath();
    ctx.moveTo(points.p1.x, points.p1.y);
    ctx.lineTo(points.p2.x, points.p2.y);
    ctx.lineTo(points.p3.x, points.p3.y);
    ctx.lineTo(points.p4.x, points.p4.y);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  drawShadow(ctx: CanvasRenderingContext2D, light: Point): void {
    const boxPoints = this.points;
    const points: Array<{
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }> = [];

    // eslint-disable-next-line guard-for-in
    for (const i in boxPoints) {
      const point = boxPoints[i];
      const angle = Math.atan2(light.y - point.y, light.x - point.x);
      const endX = point.x + shadowLength * Math.sin(-angle - Math.PI / 2);
      const endY = point.y + shadowLength * Math.cos(-angle - Math.PI / 2);
      points.push({
        startX: point.x,
        startY: point.y,
        endX,
        endY,
      });
    }

    for (let i = points.length - 1; i >= 0; i--) {
      const n = i === 3 ? 0 : i + 1;
      ctx.beginPath();
      ctx.moveTo(points[i].startX, points[i].startY);
      ctx.lineTo(points[n].startX, points[n].startY);
      ctx.lineTo(points[n].endX, points[n].endY);
      ctx.lineTo(points[i].endX, points[i].endY);
      ctx.fillStyle = this.shadowColor;
      ctx.fill();
    }
  }
}
