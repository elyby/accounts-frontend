import Point from './Point';
import Box from './Box';

interface Params {
  countBoxes: number;
  boxMinSize: number;
  boxMaxSize: number;
  backgroundColor: string;
  lightColor: string;
  shadowColor: string;
  boxColors: ReadonlyArray<string>;
}

/**
 * Based on http://codepen.io/mladen___/pen/gbvqBo
 */
export default class BoxesField {
  private readonly elem: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly params: Params;

  private light: Point;
  private boxes: Array<Box>;

  /**
   * @param {HTMLCanvasElement} elem - canvas DOM node
   * @param {object} params
   */
  constructor(
    elem: HTMLCanvasElement,
    params: Params = {
      countBoxes: 14,
      boxMinSize: 20,
      boxMaxSize: 75,
      backgroundColor: '#233d49',
      lightColor: '#28555b',
      shadowColor: '#274451',
      boxColors: [
        '#207e5c',
        '#5b9aa9',
        '#e66c69',
        '#6b5b8c',
        '#8b5d79',
        '#dd8650',
      ],
    },
  ) {
    this.elem = elem;
    const ctx = elem.getContext('2d');

    if (!ctx) {
      throw new Error('Cannot get canvas 2d context');
    }

    this.ctx = ctx;
    this.params = params;

    this.light = {
      x: 160,
      y: 200,
    };

    this.resize();
    this.drawLoop();
    this.bindWindowListeners();

    this.boxes = [];

    while (this.boxes.length < this.params.countBoxes) {
      this.boxes.push(
        new Box(
          Math.floor(
            Math.random() * (this.params.boxMaxSize - this.params.boxMinSize) +
              this.params.boxMinSize,
          ),
          {
            x: Math.floor(Math.random() * elem.width + 1),
            y: Math.floor(Math.random() * elem.height + 1),
          },
          Math.random() * Math.PI,
          this.getRandomColor(),
          this.params.shadowColor,
        ),
      );
    }
  }

  resize(): void {
    const { width, height } = this.elem.getBoundingClientRect();
    this.elem.width = width;
    this.elem.height = height;
  }

  drawLight(light: Point): void {
    const greaterSize =
      window.screen.width > window.screen.height
        ? window.screen.width
        : window.screen.height;
    // еее, теорема пифагора и описывание окружности вокруг квадрата, не зря в универ ходил!!!
    const lightRadius = greaterSize * Math.sqrt(2);

    this.ctx.beginPath();
    this.ctx.arc(light.x, light.y, lightRadius, 0, 2 * Math.PI);
    const gradient = this.ctx.createRadialGradient(
      light.x,
      light.y,
      0,
      light.x,
      light.y,
      lightRadius,
    );
    gradient.addColorStop(0, this.params.lightColor);
    gradient.addColorStop(1, this.params.backgroundColor);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
  }

  drawLoop(): void {
    this.ctx.clearRect(0, 0, this.elem.width, this.elem.height);
    this.drawLight(this.light);

    for (const i in this.boxes) {
      if (!this.boxes.hasOwnProperty(i)) {
        continue;
      }

      const box = this.boxes[i];
      box.rotate();
      box.drawShadow(this.ctx, this.light);
    }

    for (const i in this.boxes) {
      if (!this.boxes.hasOwnProperty(i)) {
        continue;
      }

      const box = this.boxes[i];
      box.draw(this.ctx);

      // When box leaves window boundaries
      let shouldUpdateBox = false;

      if (box.position.y - box.halfSize > this.elem.height) {
        box.position.y -= this.elem.height + 100;
        shouldUpdateBox = true;
      }

      if (box.position.x - box.halfSize > this.elem.width) {
        box.position.x -= this.elem.width + 100;
        shouldUpdateBox = true;
      }

      if (shouldUpdateBox) {
        this.updateBox(box);
      }
    }

    requestAnimationFrame(this.drawLoop.bind(this));
  }

  bindWindowListeners() {
    window.addEventListener('resize', this.resize.bind(this));
    window.addEventListener('mousemove', (event) => {
      this.light.x = event.clientX;
      this.light.y = event.clientY;
    });
  }

  updateBox(box: Box): void {
    box.color = this.getRandomColor();
  }

  getRandomColor(): string {
    return this.params.boxColors[
      Math.floor(Math.random() * this.params.boxColors.length)
    ];
  }
}
