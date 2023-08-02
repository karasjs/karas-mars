export declare class Ticker {
    tickers: ((dt: number) => void)[];
    private paused;
    private lastTime;
    private targetFPS;
    private interval;
    private intervalId;
    private resetTickers;
    constructor(fps?: number);
    getFPS(): number;
    setFPS(fps: number): void;
    getPaused(): boolean;
    start(): void;
    stop(): void;
    pause(): void;
    resume(): void;
    tick(): void;
    add(ticker: (dt: number) => void): void;
}
