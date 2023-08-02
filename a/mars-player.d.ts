import type { Disposable, JSONValue, LostHandler, RestoreHandler, Scene, SceneLoadOptions, TransformProps } from '@galacean/mars-core';
import { Composition, GPUCapability, spec } from '@galacean/mars-core';
import type { GLRenderer } from '@galacean/mars-webgl';
import { Ticker } from './ticker';
/**
 * `onItemClicked` 点击回调函数的传入参数
 */
export interface ItemClickedData {
    name: string;
    player: MarsPlayer;
    id: number;
    hitPositions: spec.vec3[];
    compositionId: number;
}
/**
 * player 创建的构造参数
 */
export interface MarsPlayerConfig {
    /**
     * 播放器的容器，会在容器中创建 canvas，container 和 canvas 必传一个
     */
    container?: HTMLElement | null;
    /**
     * 指定 canvas 进行播放
     */
    canvas?: HTMLCanvasElement;
    /**
     * 画布比例，尽量使用默认值，如果不够清晰，可以写2，但是可能产生渲染卡顿
     */
    pixelRatio?: number | 'auto';
    /**
     * 播放器是否可交互
     */
    interactive?: boolean;
    /**
     * canvas 是否透明，如果不透明可以略微提升性能
     * @default true
     */
    transparentBackground?: boolean;
    /**
     * 渲染帧数
     * @default 60
     */
    fps?: number;
    /**
     * 是否停止计时器，否手动渲染
     * @default false
     */
    manualRender?: boolean;
    /**
     * 播放合成的环境
     * @default '' - 编辑器中为 'editor'
     */
    env?: string;
    /**
     * 指定 WebGL 创建的上下文类型，`debug-disable` 表示不创建
     */
    renderFramework?: 'webgl' | 'webgl2' | 'debug-disable';
    /**
     * player 的 name
     */
    name?: string;
    /**
     * @since 2.0.0
     */
    renderOptions?: {
        /**
         * 播放器是否需要截图（对应 WebGL 的 preserveDrawingBuffer 参数）
         */
        willCaptureImage?: boolean;
        /**
         * 图片预乘 Alpha
         * @default false
         */
        premultiplyAlpha?: boolean;
    };
    /**
     * 当 WebGL context lost 时候发出的回调，这个时候播放器已经自动被销毁，业务需要做兜底逻辑
     */
    onWebGLContextLost?: (event: Event) => void;
    /**
     * 当 WebGL context restore 时候发出的回调，这个时候播放器已经自动恢复，业务可视情况做逻辑处理
     * @since 2.0.0
     */
    onWebGLContextRestored?: () => void;
    /**
     * 播放器被元素暂停的回调
     */
    onPausedByItem?: (data: {
        name: string;
        player: MarsPlayer;
    }) => void;
    /**
     * 交互元素被点击的回调
     */
    onItemClicked?: (data: ItemClickedData) => void;
    /**
     * 交互元素发送 message 的回调
     */
    onMessageItem?: (data: {
        name: string;
        phrase: number;
    }) => void;
    /**
     * 播放器更新的回调
     */
    onPlayableUpdate?: (data: {
        playing: boolean;
        time?: number;
        player: MarsPlayer;
    }) => void;
    /**
     * 渲染出错时候的回调
     * @param - err
     */
    onRenderError?: (err: Error) => void;
    /**
     * 每帧渲染调用后的回调，WebGL2 上下文生效
     * @param time - GPU 渲染使用的时间，秒
     */
    reportGPUTime?: (time: number) => void;
    /**
     * @internal
     * @deprecated since 2.0.0 - use in `renderOptions`
     */
    willCaptureImage?: boolean;
    /**
     * @internal
     * @deprecated since 2.0.0 - use in `renderOptions`
     */
    premultiplyAlpha?: boolean;
    [key: string]: any;
}
/**
 * `player.play` 的可选参数
 */
export interface PlayOptions {
    /**
     * 播放开始时间
     * @default 0
     */
    currentTime?: number;
    /**
     * 播放第一帧后暂停播放器
     */
    pauseOnFirstFrame?: boolean;
    /**
     * 播放完成后不销毁 texture 对象，`loadScene` 的结果能再次被播放
     */
    keepResource?: boolean;
    /**
     * @internal
     * @deprecated since 2.0.0 - use `reusable` instead
     */
    willReverseTime?: boolean;
    /**
     * 合成播放完成后是否需要再使用，是的话生命周期结束后不会 `dispose`
     * @default false
     */
    reusable?: boolean;
    /**
     * 播放速度，当速度为负数时，合成倒播
     */
    speed?: number;
    /**
     * 是否为多合成播放
     * @default false - 会替换当前播放的合成
     */
    multipleCompositions?: boolean;
    /**
     * 多合成播放时的基础渲染顺序，数字小的先渲染
     */
    baseRenderOrder?: number;
    /**
     * 如果动画配置有多个合成，设置要播放的合成名称
     */
    compositionName?: string;
    /**
     * 合成的基础位置偏移
     */
    transform?: TransformProps;
    /**
     * 合成结束时的回调
     */
    onEnd?: (composition: Composition) => void;
}
/**
 * `player.config` 传入的合成播放配置参数，目前仅支持速度
 */
export interface MarsPlayerConfiguration {
    speed?: number;
    compositionName?: string;
}
/**
 * Mars 播放器
 */
export declare class MarsPlayer implements Disposable, LostHandler, RestoreHandler {
    readonly env: string;
    readonly pixelRatio: number;
    readonly canvas: HTMLCanvasElement;
    readonly name: string;
    readonly gpuCapability: GPUCapability;
    readonly container: HTMLElement | null;
    /**
     * 当前播放的合成对象数组，请不要修改内容
     */
    protected compositions: Composition[];
    /**
     * 播放器的渲染对象
     */
    readonly renderer: GLRenderer;
    /**
     * 计时器
     * 手动渲染 `manualRender=true` 时不创建计时器
     */
    readonly ticker: Ticker;
    private readonly event;
    private readonly handleWebGLContextLost?;
    private readonly handleWebGLContextRestored?;
    private readonly handleMessageItem?;
    private readonly handlePlayerPause?;
    private readonly reportGPUTime?;
    private readonly handleItemClicked?;
    private readonly handlePlayableUpdate?;
    private readonly handleRenderError?;
    private handleEnd?;
    private displayAspect;
    private displayScale;
    private forceRenderNextFrame;
    private forwardingTime;
    private clearPipeline;
    private resumePending;
    private offscreenMode;
    private disposed;
    private assetManager;
    /**
     * 播放器的构造函数
     * @param config
     */
    constructor(config: MarsPlayerConfig);
    /**
     * 获取当前播放合成，如果是多个合成同时播放，返回第一个合成
     * @since 2.0.0
     */
    get currentComposition(): Composition;
    /**
     * 当前播放的合成名称，如果是多个合成同时播放，返回第一个合成名称
     * @internal
     * @deprecated since 2.0.0 - use `currentComposition.name` instead
     */
    get currentCompositionName(): string;
    /**
     * 是否有合成在播放
     */
    get hasPlayable(): boolean;
    /**
     * 播放器是否已暂停
     */
    get paused(): boolean;
    /**
     * 获取播放器是否可交互
     */
    get interactive(): boolean;
    /**
     * 设置播放器是否可交互
     */
    set interactive(enable: boolean);
    /**
     * 异步加载动画资源
     * @since 2.0.0
     * @param url - URL 或者通过 URL 请求的 JSONObject
     * @param options - 加载可选参数
     * @returns
     */
    loadScene(url: string | JSONValue, options?: SceneLoadOptions): Promise<Scene>;
    /**
     * @internal
     * @deprecated since 2.0.0 - use `loadScene` instead
     */
    loadSceneAsync(url: string | JSONValue, options?: SceneLoadOptions): Promise<Scene>;
    /**
     * 创建并播放合成对象
     * > 此方法会进行 shader 异步编译（如果 MarsPlayer 要和 CSS 同时使用可避免卡顿）
     * @since 2.0.0
     * @param scene - 合成对象或加载好的动画网络资源
     * @param options - 播放可选参数
     * @returns
     */
    play(scene: Scene | Composition, options?: PlayOptions): Promise<Composition>;
    /**
     * @internal
     * @deprecated since 2.0.0 - use `play` instead
     */
    playAsync(scene: Scene | Composition, options?: PlayOptions): Promise<Composition | null>;
    /**
     * 暂停播放器
     * @param options
     * @param options.offloadTexture - 是否卸载贴图纹理，减少内存
     * @returns
     */
    pause(options?: {
        offloadTexture?: boolean;
    }): true | undefined;
    /**
     * 恢复播放器
     * > 如果暂停时卸载了纹理贴图，此函数将自动请求网络重新加载纹理
     * @since 2.0.0
     * @returns
     */
    resume(): Promise<void>;
    /**
     * @internal
     * @deprecated since 2.0.0 - use `resume` instead
     */
    resumeAsync(): Promise<void>;
    /**
     * player 在定时器每帧的回调
     * @param dt - 时间差，毫秒
     */
    tick(dt: number): void;
    private doTick;
    /**
     * 调整画布的宽高比
     * @param aspect
     * @param scale
     */
    resizeToAspect(aspect: number, scale?: number): void;
    /**
     * 将播放器重新和父容器大小对齐
     */
    resize(): void;
    /**
     * 修改播放器的配置
     * @param config - 播放配置，当前仅支持修改合成播放速度
     */
    config(config: MarsPlayerConfiguration): void;
    /**
     * 快进/快退指定时间间隔
     * @param composition - 要快进的合成
     * @param timeInSeconds - 需要快进/快退的时间长度（秒），可正可负
     */
    forwardCompositionTime(composition: Composition, timeInSeconds: number): void;
    /**
     * 清空 canvas 的画面
     * @param immediate - 如果立即清理，当前画面将会消失，如果 player 还有合成在渲染，可能出现闪烁
     */
    clearCanvas(immediate?: boolean): void;
    /**
     * @internal
     * @deprecated since 2.0.0
     * @param id
     * @param options
     */
    destroyItem(id: string, options?: {}): void;
    /**
     * 设置 Canvas 的背景图片用于降级
     * @internal
     * @deprecated since 2.0.0
     * @param url
     * @param container - 在 player 被销毁的时候，会使用这个 container 降级
     */
    useDowngradeImage(url: string, container?: HTMLElement): void;
    /**
     * 播放器在 `webglcontextlost` 时执行的操作
     * @param e - Event
     */
    lost: (e: Event) => void;
    /**
     * 播放器在 `webglcontextrestored` 时执行的操作
     * @returns
     */
    restore: () => Promise<void>;
    /**
     * 销毁播放器
     * @since 2.0.0
     * @param keepCanvas - 是否保留 canvas 画面，默认不保留，canvas 不能再被使用
     */
    dispose(keepCanvas?: boolean): void;
    /**
     * @internal
     * @deprecated since 2.0.0 - use `dispose` instead
     */
    destroy(keepCanvas?: boolean): void;
    private renderFrame;
    private handleResume;
    private offloadTexture;
    private handleClick;
    private getTargetSize;
}
/**
 * 禁止/允许创建新的播放器，已创建的不受影响
 * @param disable - 是否禁止
 */
export declare function disableAllPlayer(disable: boolean): void;
/**
 * 判断指定的 canvas 是否有播放器正在使用
 * @param canvas - 指定的 canvas
 * @returns
 */
export declare function isCanvasUsedByPlayer(canvas: HTMLCanvasElement): boolean;
/**
 * 获取 canvas 对应的播放器
 * @param canvas - 指定的 canvas
 * @returns
 */
export declare function getPlayerByCanvas(canvas: HTMLCanvasElement): MarsPlayer | undefined;
/**
 * 获取使用中的播放器
 * @returns
 */
export declare function getActivePlayers(): MarsPlayer[];
