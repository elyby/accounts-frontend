import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { IntlProvider } from 'components/i18n';
import appInfo from 'components/auth/appInfo/AppInfo.intl.json';
import messages from './BSoD.intl.json';
import { rAF as requestAnimationFrame } from 'functions';

import styles from './styles.scss';

// TODO: probably it is better to render this view from the App view
// to remove dependencies from store and IntlProvider
export default function BSoD({store}) {
    return (
        <IntlProvider store={store}>
            <div className={styles.body}>
                <canvas className={styles.canvas} ref={(el) => new BoxesField(el)} />

                <div className={styles.wrapper}>
                    <div className={styles.title}>
                        <Message {...appInfo.appName} />
                    </div>
                    <div className={styles.lineWithMargin}>
                        <Message {...messages.criticalErrorHappened} />
                    </div>
                    <div className={styles.line}>
                        <Message {...messages.reloadPageOrContactUs} />
                    </div>
                    <a href="mailto:support@ely.by" className={styles.support}>
                        support@ely.by
                    </a>
                    <div className={styles.easterEgg}>
                        <Message {...messages.alsoYouCanInteractWithBackground}/>
                    </div>
                </div>
            </div>
        </IntlProvider>
    );
}

class Box {

    constructor({size, startX, startY, startRotate, color, shadowColor}) {
        this.color = color;
        this.shadowColor = shadowColor;
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
            y: this.y + this.halfSize * Math.cos(this.angle)
        };

        const p2 = {
            x: this.x + this.halfSize * Math.sin(this.angle + full),
            y: this.y + this.halfSize * Math.cos(this.angle + full)
        };

        const p3 = {
            x: this.x + this.halfSize * Math.sin(this.angle + full * 2),
            y: this.y + this.halfSize * Math.cos(this.angle + full * 2)
        };

        const p4 = {
            x: this.x + this.halfSize * Math.sin(this.angle + full * 3),
            y: this.y + this.halfSize * Math.cos(this.angle + full * 3)
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
        const dots = this.dots;
        ctx.beginPath();
        ctx.moveTo(dots.p1.x, dots.p1.y);
        ctx.lineTo(dots.p2.x, dots.p2.y);
        ctx.lineTo(dots.p3.x, dots.p3.y);
        ctx.lineTo(dots.p4.x, dots.p4.y);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    drawShadow(ctx, light) {
        const dots = this.dots;
        const angles = [];
        const points = [];

        for (const i in dots) {
            const dot = dots[i];
            const angle = Math.atan2(light.y - dot.y, light.x - dot.x);
            const endX = dot.x + this.shadowLength * Math.sin(-angle - Math.PI / 2);
            const endY = dot.y + this.shadowLength * Math.cos(-angle - Math.PI / 2);
            angles.push(angle);
            points.push({
                endX,
                endY,
                startX: dot.x,
                startY: dot.y
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

/**
 * Основано на http://codepen.io/mladen___/pen/gbvqBo
 */
class BoxesField {

    /**
     * @param {Node} elem - canvas DOM node
     * @param {object} params
     */
    constructor(elem, params = {
        countBoxes: 14,
        boxMinSize: 20,
        boxMaxSize: 75,
        backgroundColor: '#233d49',
        lightColor: '#28555b',
        shadowColor: '#274451',
        boxColors: ['#207e5c', '#5b9aa9', '#e66c69', '#6b5b8c', '#8b5d79', '#dd8650']
    }) {
        this.elem = elem;
        this.ctx = elem.getContext('2d');
        this.params = params;

        this.light = {
            x: 160,
            y: 200
        };

        this.resize();
        this.drawLoop();
        this.bindWindowListeners();

        /**
         * @type {Box[]}
         */
        this.boxes = [];
        while (this.boxes.length < this.params.countBoxes) {
            this.boxes.push(new Box({
                size: Math.floor((Math.random() * (this.params.boxMaxSize - this.params.boxMinSize)) + this.params.boxMinSize),
                startX: Math.floor((Math.random() * elem.width) + 1),
                startY: Math.floor((Math.random() * elem.height) + 1),
                startRotate: Math.random() * Math.PI,
                color: this.getRandomColor(),
                shadowColor: this.params.shadowColor
            }));
        }
    }

    resize() {
        const { width, height } = this.elem.getBoundingClientRect();
        this.elem.width = width;
        this.elem.height = height;
    }

    drawLight(light) {
        const greaterSize = window.screen.width > window.screen.height ? window.screen.width : window.screen.height;
        // еее, теорема пифагора и описывание окружности вокруг квадрата, не зря в универ ходил!!!
        const lightRadius = greaterSize * Math.sqrt(2);

        this.ctx.beginPath();
        this.ctx.arc(light.x, light.y, lightRadius, 0, 2 * Math.PI);
        const gradient = this.ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, lightRadius);
        gradient.addColorStop(0, this.params.lightColor);
        gradient.addColorStop(1, this.params.backgroundColor);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    drawLoop() {
        this.ctx.clearRect(0, 0, this.elem.width, this.elem.height);
        this.drawLight(this.light);

        for (let i in this.boxes) {
            const box = this.boxes[i];
            box.rotate();
            box.drawShadow(this.ctx, this.light);
        }

        for (let i in this.boxes) {
            const box = this.boxes[i];
            box.draw(this.ctx);

            // Если квадратик вылетел за пределы экрана
            if (box.y - box.halfSize > this.elem.height) {
                box.y -= this.elem.height + 100;
                this.updateBox(box);
            }

            if (box.x - box.halfSize > this.elem.width) {
                box.x -= this.elem.width + 100;
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

    /**
     * @param {Box} box
     */
    updateBox(box) {
        box.color = this.getRandomColor();
    }

    getRandomColor() {
        return this.params.boxColors[Math.floor((Math.random() * this.params.boxColors.length))];
    }

}
