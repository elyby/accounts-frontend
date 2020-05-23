declare module 'multi-progress' {
    export default class MultiProgress {
        constructor(stream?: string);
        newBar(schema: string, options: ProgressBar.ProgressBarOptions): ProgressBar;
        terminate(): void;
        move(index: number): void;
        tick(index: number, value?: number, options?: any): void;
        update(index: number, value?: number, options?: any): void;
    }
}
