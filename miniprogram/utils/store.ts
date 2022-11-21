export interface IStoreState {
    [key: string]: any
}

export interface IStoreActionFn extends Function{
    '__id__'?: string
}

export interface IStoreAction {
    [key: string]:IStoreActionFn
}


export class Store {
    protected state: IStoreState = {};
    protected actions: IStoreAction = {};
    protected ctxs: WechatMiniprogram.Page.Instance<Record<string, any>, Record<string, any>>[] = [];

    constructor({state, actions, ctxs}:any){
        if(state){
            this.state = state
        }
        if(actions){
            this.actions = actions
        }
        if(ctxs  && ctxs instanceof Array && ctxs.length > 0){
            this.ctxs = ctxs
        }
    }

    // 派发action, 统一返回promise action可以直接返回state
    dispatch(type: string, payload?: any) {
        const update = (res: any) => {
            if (typeof res !== 'object') return res;
            this.setState(res)
            this.ctxs.map((ctx) => {
                if (!ctx || typeof ctx.setData !== 'function') return
                if (ctx.hasOwnProperty('$store_mapkey')) {
                    let updaetObj: any = {}
                    ctx.$store_mapkey.forEach((key: string) => { if (res.hasOwnProperty(key)) { updaetObj[key] = res[key] } })
                    if (Object.keys(updaetObj).length > 0) {
                        ctx.setData(updaetObj)
                        if ('function' == typeof ctx.onUpdataState) {
                            ctx.onUpdataState(updaetObj)
                        }
                    }
                }
            })
            return res
        }

        if (typeof this.actions[type] !== 'function') return
        const res = this.actions[type](this, payload)
        if (res.constructor.toString().match(/function\s*([^(]*)/)[1] === 'Promise') return res.then(update)
        else return new Promise((resolve) => {
            update(res)
            resolve(res)
        })
    }

    // 修改state的方法
    setState(data: any) {
        this.state = { ...this.state, ...data }
    }

    // 根据keys获取state
    getState(keys: string[]) {
        return keys.reduce((acc, key) => ({ ...acc, ...{ [key]: this.state[key] } }), {})
    }

    // 映射state到实例中，可在onload或onshow中调用
    mapState(keys: string[], ctx: WechatMiniprogram.Page.Instance<Record<string, any>, Record<string, any>>) {
        if (!ctx || typeof ctx.setData !== 'function') return
        ctx.setData(this.getState(keys))
        if (ctx.hasOwnProperty('$store_mapkey')) {
            ctx.$store_mapkey = [...ctx.$store_mapkey, ...keys];
        } else {
            ctx.$store_mapkey = keys
        }

        this.ctxs.push(ctx)
    }
    /**
     * 卸载
     */
    unInstall(ctx: WechatMiniprogram.Page.Instance<Record<string, any>, Record<string, any>>) {
        const __wxExparserNodeId__ = ctx.hasOwnProperty('__wxExparserNodeId__') ? ctx.__wxExparserNodeId__ : null
        if (__wxExparserNodeId__) {
            this.ctxs = this.ctxs.filter((ce) => {
                console.warn("正在卸载中")
                if (ce.hasOwnProperty('__wxExparserNodeId__') && ce.__wxExparserNodeId__ == __wxExparserNodeId__) {
                    console.warn("卸载完成")
                    return false;
                } else {
                    return true
                }
            })
        }
    }
}