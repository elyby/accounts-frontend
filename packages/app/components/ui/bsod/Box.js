export default class Box {
  constructor({ size, startX, startY, startRotate, color, shadowColor }) {
    this.color = color;
    this.shadowColor = shadowColor;
    this.halfSize = 0;
    this.setSize(size);
    this.x = startX;
    this.y = startY;
    this.angle = startRotate;
    this.shadowLength = 2000; // TODO: should be calculated
  }

  get size() {
    return this._initialSize;
  }

  get dots() {
    const full = (Math.PI * 2) / 4;

    const p1 = {
      x: this.x + this.halfSize * Math.sin(this.angle),
      y: this.y + this.halfSize * Math.cos(this.angle),
    };

    const p2 = {
      x: this.x + this.halfSize * Math.sin(this.angle + full),
      y: this.y + this.halfSize * Math.cos(this.angle + full),
    };

    const p3 = {
      x: this.x + this.halfSize * Math.sin(this.angle + full * 2),
      y: this.y + this.halfSize * Math.cos(this.angle + full * 2),
    };

    const p4 = {
      x: this.x + this.halfSize * Math.sin(this.angle + full * 3),
      y: this.y + this.halfSize * Math.cos(this.angle + full * 3),
    };

    return { p1, p2, p3, p4 };
  }

  rotate() {
    const speed = (60 - this.halfSize) / 20;
    this.angle += speed * 0.002;
    this.x += speed;
    this.y += speed;
  }

  draw(ctx) {
    const { dots } = this;
    ctx.beginPath();
    ctx.moveTo(dots.p1.x, dots.p1.y);
    ctx.lineTo(dots.p2.x, dots.p2.y);
    ctx.lineTo(dots.p3.x, dots.p3.y);
    ctx.lineTo(dots.p4.x, dots.p4.y);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  drawShadow(ctx, light) {
    const { dots } = this;
    const angles = [];
    const points = [];

    for (const i in dots) {
      if (!dots.hasOwnProperty(i)) {
        continue;
      }

      const dot = dots[i];
      const angle = Math.atan2(light.y - dot.y, light.x - dot.x);
      const endX = dot.x + this.shadowLength * Math.sin(-angle - Math.PI / 2);
      const endY = dot.y + this.shadowLength * Math.cos(-angle - Math.PI / 2);
      angles.push(angle);
      points.push({
        endX,
        endY,
        startX: dot.x,
        startY: dot.y,
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

  setSize(size) {
    this._initialSize = size;
    this.halfSize = Math.floor(size / 2);
  }
}
