
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
 * 由于上报会把事件名称驼峰转为下划线且大写转为小写，需注意
 */
export const eventConf: Record<string, TurboTrackWechatEventItem> = {
    goods_show: {
        wxEventName: "goodsShow",
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
    to_goods_detail: {
        wxEventName: "toGoodsDetail",
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
    test_req: {
        wxEventName: "testReq",
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
            }
        }
    },
}
