import util from "../../utils/util";
import { IAppOption, SystemInfo } from "typings";
import { TurboTrackQueueItem, TurboTrackWechatEventItem, eventConf } from "./config";
import dayjs from "dayjs";

class TrackReport {

    public queue!: TurboTrackQueueItem[];
    public timerId: any = null;
    public config!: Record<string, TurboTrackWechatEventItem>;
    public systemInfo!: SystemInfo;
    public deviceId: string | null = null;
    public openId: string | null = null;
    public appId: string | null = null;

    constructor() {
        // 需要发送的追踪信息的队列
        this.queue = [];
        this.timerId = null;
        this.config = eventConf
        let existdeviceId = wx.getStorageSync('turbo_tracker:client_id')
        if (!existdeviceId) {
            existdeviceId = this.uuid()
            wx.setStorageSync('turbo_tracker:client_id', existdeviceId)
        }
        this.deviceId = existdeviceId;
        this.appId = (wx.getAccountInfoSync()).miniProgram.appId;
    }

    /**
     * 设置客户端唯一ID,登录后应设置
     */
    setOpenId(openId: any) {
        this.openId = openId
    }

    /**
     * 模拟生成UUID
     */
    uuid() {
        let s: string[] = [];
        const hexDigits = "0123456789abcdef";
        for (let i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        // s[14] = "4";
        // @ts-ignore
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = "-";

        return s.join("");
    }

    /**
     * 上报服务器存储
     */
    async reportToServer(eventName: string, data: Record<string, any>) {
        // 实现数据上报
    }

    /**
     * 执行队列中的任务(执行上报发送追踪信息)
     */
    async _flush() {
        // 队列中有数据时进行请求
        if (!this.systemInfo) {
            const app = getApp<IAppOption>();
            this.systemInfo = app.systemInfo as SystemInfo;
        }

        if (this.queue.length > 0) {
            const data = this.queue.shift();
            if (!data) return;
            try {
                const eventName = data.wxEventName;
                let opts = data.data;
                opts.openId = this.openId;
                opts.deviceId = this.deviceId;
                opts.systemInfo = this.systemInfo;
                opts.appId = this.appId;
                console.log(`事件${eventName}请求上报`, opts)
                const eventConfig = this.config
                if (eventConfig.hasOwnProperty(eventName)) {
                    console.log(`事件${eventName}可以上报到we分析`)
                    const wxEv = eventConfig[eventName]
                    let p: any = {};
                    for (const key in wxEv.param) {
                        const ele = wxEv.param[key]
                        if (opts.hasOwnProperty(key)) {
                            p[key] = ele.type(opts[key])
                        } else {
                            p[key] = ele.default
                        }
                    }
                    console.log(`事件${eventName}上报到we分析`, p)
                    wx.reportEvent(data.wxEventName, p)
                }
                // 这里上报到指定平台
                this.reportToServer(eventName, opts)
            } catch (error) {

            } finally {
                this._flush()
            }

        } else {
            this.timerId = null;
        }
    }
}

export const tr = new TrackReport()

export const report = (name: string, params: Record<string, any> = {}) => {

    let opts: Record<string, any> = {};

    Object.keys(params).forEach(keyOld => {
        let key = keyOld.replace(/\./g, '_').toLowerCase();
        opts[key] = params[keyOld]
    })
    if (!opts.hasOwnProperty("route") || !(opts.route.replace(/\s/g, ''))) {
        try {
            let pages = getCurrentPages()
            if (pages.length > 0) {
                opts.route = pages[pages.length - 1].route
            }
        } catch (error) {
            console.error(error)
        }
    }

    const eventName = util.toLine(name).replace(/\//g, '_').replace(/#/g, '__').toLowerCase()

    tr.queue.push({
        wxEventName: eventName,
        data: {
            ...opts,
            date: dayjs().format()
        }
    } as TurboTrackQueueItem)

    if (!tr.timerId) {
        // 为了不影响正常的业务请求，这里延时发出我们的埋点信息
        tr.timerId = setTimeout(() => {
            tr._flush();
        }, 100);
    }
}