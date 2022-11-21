import { IAppOption, SystemInfo } from "typings";

export interface TurboTrackWechatEventItemParam {
    type: any,
    default: any
}

export interface TurboTrackWechatEventItem {
    wxEventName: string,
    param: Record<string, TurboTrackWechatEventItemParam>
}

export interface TurboTrackQueueItem {
    wxEventName: string,
    data: any
}

/**
 * 微信事件上报配置
 */
const eventConf: Record<string, TurboTrackWechatEventItem> = {
    bookshow: {
        wxEventName: "bookshow",
        param: {
            id: {
                type: Number,
                default: 0
            },
            title: {
                type: String,
                default: ""
            },
            pos: {
                type: String,
                default: ""
            }
        }
    },
    tobookdetail: {
        wxEventName: "tobookdetail",
        param: {
            id: {
                type: Number,
                default: 0
            },
            title: {
                type: String,
                default: ""
            },
            pos: {
                type: String,
                default: ""
            }
        }
    },
    borrowbook: {
        wxEventName: "borrowbook",
        param: {
            id: {
                type: Number,
                default: 0
            },
            title: {
                type: String,
                default: ""
            },
            pos: {
                type: String,
                default: ""
            }
        }
    },
    submitpay: {
        wxEventName: "submitpay",
        param: {
            id: {
                type: Number,
                default: 0
            },
            title: {
                type: String,
                default: ""
            },
            pos: {
                type: String,
                default: ""
            },
            amount_depositamount: {
                type: Number,
                default: 0
            }
        }
    },
}


class TrackReport {

    public queue!: TurboTrackQueueItem[];
    public timerId: any = null;
    public config!: Record<string, TurboTrackWechatEventItem>;
    public systemInfo!:SystemInfo;

    constructor() {
        // 需要发送的追踪信息的队列
        this.queue = [];
        this.timerId = null;
        this.config = eventConf
        // this.systemInfo = getApp<IAppOption>().systemInfo as SystemInfo;
    }
    /**
     * 执行队列中的任务(执行上报发送追踪信息)
     */
    _flush() {
        // 队列中有数据时进行请求
        if(!this.systemInfo){
            this.systemInfo = getApp<IAppOption>().systemInfo as SystemInfo;
        }
        if (this.queue.length > 0) {
            const data = this.queue.shift();
            if (!data) return;
            try {
                wx.reportEvent(data.wxEventName, data?.data)
            } catch (error) {

            } finally {
                this._flush()
            }

        } else {
            this.timerId = null;
        }
    }
}

const tr = new TrackReport()

export const report = (eventName: string, opts: Record<string, any> = {}) => {

    console.log(`事件${eventName}请求上报`, opts)

    let eventConfig = eventConf
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
        // wx.reportEvent(wxEv.wxEventName, p)

        tr.queue.push({
            wxEventName: wxEv.wxEventName,
            data: {
                ...p,
                systemInfo: tr.systemInfo
            }
        } as TurboTrackQueueItem)

        if (!tr.timerId) {
            // 为了不影响正常的业务请求，这里延时发出我们的埋点信息
            tr.timerId = setTimeout(() => {
                tr._flush();
            }, 100);
        }
    }
}