import { TurboFn } from "../../typings";

export interface DebounceThrottleConstructor {
    fn: TurboFn,
    delay?: number
}

/** 防抖与节流
 * @param { Function } fn 被执行函数
 * @param { Number } delay 延迟/间隔的毫秒数
 */
export class DebounceThrottle {

    /**
     * 执行函数
     */
    private fn: TurboFn;

    /**
     * 执行延迟毫秒
     */
    private delay: number = 400;

    constructor({ fn, delay = 400 }: DebounceThrottleConstructor) {
        this.fn = fn;
        if (delay >= 0) this.delay = delay;
    }

    /**
     * 防抖
     * 
     * 每次执行都会延迟${delay}毫秒，因此首次执行具有延迟
     */
    _debounce() {
        let timer: any;
        const { fn, delay } = this;
        return function (...args: any[]) {
            // @ts-ignore
            const ctx = this;
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
                // @ts-ignore
                fn.apply(ctx, args)
            }, delay)
        }
    }
    /**
     * 节流
     * 
     * 每两次执行至少都会间隔${delay}毫秒，因此首次执行无延迟
     */
    _throttle() {
        const { fn, delay } = this;
        let enterTime = 0;
        return function (...args: any[]) {
            // @ts-ignore
            const ctx = this;
            const backTime = (new Date()) as any;
            if (backTime - enterTime > delay) {
                // @ts-ignore
                fn.apply(ctx, args);
                enterTime = backTime;
            }
        };
    }
}