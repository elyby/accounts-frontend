import React, { CSSProperties, FC, useEffect, useRef } from 'react';

type Rgb = readonly [number, number, number];

/**
 * The stages of a chunk's generation and their colors, as on Minecraft's world loading screen
 */
const STAGE_COLORS: ReadonlyArray<Rgb> = [
    [0x54, 0x54, 0x54], // empty
    [0x99, 0x99, 0x99], // structure starts
    [0x5f, 0x61, 0x91], // structure references
    [0x80, 0xb2, 0x52], // biomes
    [0xd1, 0xd1, 0xd1], // noise
    [0x72, 0x68, 0x09], // surface
    [0x30, 0x35, 0x72], // carvers
    [0x21, 0xc6, 0x00], // features
    [0xcc, 0xcc, 0xcc], // initialize light
    [0xff, 0xe0, 0xa0], // light
    [0xf2, 0x60, 0x60], // spawn
    [0xff, 0xff, 0xff], // full
];

const LAST_STAGE = STAGE_COLORS.length - 1;

/**
 * The picture, which is generated: the generated chunks of the checkmark become white, and the rest ones become
 * the accent color, so the final picture looks like the checked checkbox.
 * Based on https://icomoon.io/images/pixelified/checkmark.png, the margins are added, and vertically
 * the checkmark is a bit higher than the center, as in the original
 */
const CHECKMARK: ReadonlyArray<string> = [
    '..............',
    '..............',
    '..............',
    '..........##..',
    '.........####.',
    '........####..',
    '..##...####...',
    '.####.####....',
    '..#######.....',
    '...#####......',
    '....###.......',
    '.....#........',
    '..............',
    '..............',
];

const GRID_SIZE = CHECKMARK.length;

const CELL_SIZE = 4;

/**
 * The size of the map in CSS pixels
 */
export const MAP_SIZE = GRID_SIZE * CELL_SIZE;

/**
 * DEPENDENCY_RADIUS[s] is the radius of the neighbors, which must reach the stage s,
 * before the chunk can advance to the stage s + 1. The values aren't the game's ones:
 * they're picked to make the same picture on a small grid
 */
const DEPENDENCY_RADIUS: ReadonlyArray<number> = [0, 2, 0, 1, 0, 1, 1, 1, 1, 0, 0];

/**
 * The share of the remaining work, which is done per frame, while the simulation catches up with the progress
 */
const CATCH_UP_RATE = 0.12;

/**
 * How many times the checkmark's chunks are more likely to be picked
 */
const CHECKMARK_PRIORITY = 6;

/**
 * How many stages the checkmark's chunks may outrun the rest of the map. The bigger it is, the earlier
 * the checkmark shows up: with 1 it becomes white at about 60–85% of the generation, without the limit at about 30%
 */
const CHECKMARK_LEAD = 1;

/**
 * The fast devices solve the challenge in a few hundreds of milliseconds, which is too fast to see the generation.
 * So the generation doesn't run ahead of the time, but the token is passed to the form at once anyway.
 * The time is counted from the first progress, i.e. from the start of the solving, so the challenge's request
 * doesn't eat it up
 */
const MIN_DURATION = 1000;

function isCheckmark(index: number): boolean {
    return CHECKMARK[Math.floor(index / GRID_SIZE)][index % GRID_SIZE] === '#';
}

class Simulation {
    readonly stages = new Uint8Array(GRID_SIZE * GRID_SIZE);
    private readonly weights = new Float32Array(GRID_SIZE * GRID_SIZE);
    private advanced = 0;

    constructor() {
        const center = (GRID_SIZE - 1) / 2;

        for (let index = 0; index < this.weights.length; index++) {
            // The chunks near the center are generated first
            const distance = Math.hypot((index % GRID_SIZE) - center, Math.floor(index / GRID_SIZE) - center);
            this.weights[index] = (isCheckmark(index) ? CHECKMARK_PRIORITY : 1) / (1 + distance) ** 2;
        }
    }

    get completion(): number {
        return this.advanced / (this.stages.length * LAST_STAGE);
    }

    /**
     * Advances the given number of chunks by one stage. The chunks are picked randomly among the eligible ones,
     * preferring the weighted ones (the weighted sampling by Efraimidis and Spirakis)
     */
    step(count: number): void {
        const candidates: Array<{ index: number; key: number }> = [];

        for (let index = 0; index < this.stages.length; index++) {
            if (this.isEligible(index)) {
                candidates.push({ index, key: Math.random() ** (1 / this.weights[index]) });
            }
        }

        candidates.sort((left, right) => right.key - left.key);

        for (const { index } of candidates.slice(0, count)) {
            this.stages[index]++;
            this.advanced++;
        }
    }

    private isEligible(index: number): boolean {
        const stage = this.stages[index];

        if (stage === LAST_STAGE) {
            return false;
        }

        const radius = DEPENDENCY_RADIUS[stage];
        const cx = index % GRID_SIZE;
        const cy = Math.floor(index / GRID_SIZE);
        // The checkmark's chunks are allowed to outrun the rest of the map a bit
        const isCheckmarkChunk = isCheckmark(index);

        // The chunks outside the grid are considered generated, so the whole grid can be completed
        for (let y = Math.max(0, cy - radius); y <= Math.min(GRID_SIZE - 1, cy + radius); y++) {
            for (let x = Math.max(0, cx - radius); x <= Math.min(GRID_SIZE - 1, cx + radius); x++) {
                const neighbor = y * GRID_SIZE + x;

                const requiredStage = isCheckmarkChunk && !isCheckmark(neighbor) ? stage - CHECKMARK_LEAD : stage;

                if (this.stages[neighbor] < requiredStage) {
                    return false;
                }
            }
        }

        return true;
    }
}

/**
 * Parses the '#rrggbb' color
 */
function parseColor(value: string): Rgb | null {
    const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value.trim());

    return match ? [Number.parseInt(match[1], 16), Number.parseInt(match[2], 16), Number.parseInt(match[3], 16)] : null;
}

interface Props {
    /**
     * From 0 to 1. The simulation follows it smoothly and never goes back
     */
    progress: number;
    /**
     * Called once, when all the chunks are generated
     */
    onComplete(): void;
    style?: CSSProperties;
}

/**
 * Mimics Minecraft's world loading screen: the chunks pass the generation stages, each stage has its color.
 * The final color of the chunks outside the checkmark is taken from the --altcha-accent CSS variable
 */
const WorldGeneration: FC<Props> = ({ progress, onComplete, style }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const progressRef = useRef(progress);
    progressRef.current = progress;
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    useEffect(() => {
        const canvas = canvasRef.current!;
        // Absent in the environments without the canvas support
        const context = canvas.getContext('2d');
        const image = context?.createImageData(GRID_SIZE, GRID_SIZE);
        const simulation = new Simulation();
        const totalSteps = simulation.stages.length * LAST_STAGE;
        let startedAt: number | undefined;
        const accent = parseColor(getComputedStyle(canvas).getPropertyValue('--altcha-accent')) || STAGE_COLORS[LAST_STAGE];

        let frame: number;
        let isDrawn = false;

        const render = () => {
            if (startedAt === undefined && progressRef.current > 0) {
                startedAt = performance.now();
            }

            const target =
                startedAt === undefined ? 0 : Math.min(progressRef.current, (performance.now() - startedAt) / MIN_DURATION);
            const deficit = target - simulation.completion;

            if (deficit > 0) {
                simulation.step(Math.ceil(deficit * totalSteps * CATCH_UP_RATE));
            }

            // The picture changes only, when the simulation advances
            if (context && image && (deficit > 0 || !isDrawn)) {
                isDrawn = true;

                simulation.stages.forEach((stage, index) => {
                    image.data.set(stage === LAST_STAGE && !isCheckmark(index) ? accent : STAGE_COLORS[stage], index * 4);
                    image.data[index * 4 + 3] = 0xff;
                });

                context.putImageData(image, 0, 0);
            }

            if (simulation.completion >= 1) {
                onCompleteRef.current();

                return;
            }

            frame = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={GRID_SIZE}
            height={GRID_SIZE}
            style={{ width: MAP_SIZE, height: MAP_SIZE, imageRendering: 'pixelated', ...style }}
        />
    );
};

export default WorldGeneration;
