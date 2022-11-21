// app.ts
import { IAppOption, Inavigator } from '../typings';
import store from './store/index';
// @ts-ignore
import { } from './utils/number';
import { appConfig as config } from './config';
import { EventBus } from './utils/eventbus';
import util from './utils/util';
import sceneApi from './api/scene.api';
import { login } from './utils/http';

App<IAppOption>({
    storage: {},
    eventBus: new EventBus(),
    timer_env_storage: {},
    store,
    globalData: {},
    $teaReport: (event:string,data:any) => {
        //埋点数据上报
        console.log(`埋点数据上报`, {
            event,
            data
        })
    },
    $sentry: {
        captureMessage: (...arg: any) => {
            console.log(`captureMessage`, arg)
        },
        captureException: (...arg: any) => {
            console.log(`captureException`, arg)
        },
        captureEvent: (...arg: any) => {
            console.log(`captureEvent`, arg)
        },
    },
    async onLaunch(options: WechatMiniprogram.App.LaunchShowOption) {
        console.log('---------onLaunch-----------', options)

        // let {openId,unionId} = await util.getUserOpenIdAndUnionId({force: true})
        // try{
        //   let reportData = {}
        //   if(openId){ 
        //     tea.config({ user_unique_id: openId})
        //     // sentry.configureScope(scope => {
        //     //   scope.setUser({ openId, unionId });
        //     // });
        //     reportData = {
        //       success: true,
        //       openId,
        //       unionId
        //     }
        //   }else{
        //     reportData = {
        //       success: false,
        //       openId: '',
        //       unionId: ''
        //     }
        //   }
        //   report("cloud_login", {...reportData,...options});
        //   // sentry.captureEvent({
        //   //   message: 'cloud_login',
        //   //   stacktrace: [
        //   //   ],
        //   //   params: {
        //   //     ...reportData,...options
        //   //   }
        //   // });
        // }catch(e){
        //   console.error(e)
        // } 

        try {
            //code登录、注册一体
            await login(options);
        } catch (error) {
            console.error("登录失败", error)
        }

        const systemInfo = wx.getSystemInfoSync()
        this.systemInfo = {
            ...systemInfo,
            rpxRate: Number((750 / systemInfo.screenWidth).toFixed(2)),
            isIos: /(IOS|IPAD)/.test(systemInfo.system.toUpperCase())
        }

        try {
            // 是否是扫码的
            this.parseScanUri(options)
        } catch (error) {
            console.error(error)
        }

        try {
            // 渠道和来源数据上报
            this.sceneReport(options, true);
        } catch (error) {
            console.error(error)
        }

        try {
            const sysInfo = wx.getSystemInfoSync()
            if (sysInfo.platform !== 'devtools' && sysInfo.version !== '0') {
                config.env = 'prod'
            }
            //console.log(config.env)
            if (config.env !== 'prod') {
                wx.setScreenBrightness({
                    value: 1
                })
            }
            const updateManager = wx.getUpdateManager();
            updateManager.onCheckForUpdate((res) => {
                // 请求完新版本信息的回调
                console.log("请求完新版本信息的回调", res.hasUpdate)
            })
            updateManager.onUpdateReady(() => {
                wx.showModal({
                    title: '更新提示',
                    content: '新版本已经准备好，是否重启小程序？',
                    success: function (res) {
                        if (res.confirm) {
                            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                            updateManager.applyUpdate()
                        }
                    }
                })
            })
            updateManager.onUpdateFailed(function () {
                // 新的版本下载失败
                wx.showToast({
                    title: '新版本更新失败',
                    icon: 'none'
                });
            })

        } catch (ex) {
            console.error(ex)
        }
    },
    async onShow(options: WechatMiniprogram.App.LaunchShowOption) {
        // decorator Page Function
        console.log("--------appOnShow--------", e)
        const originPage = Page; // Page源对象的引用
        Page = (pageOption: Record<string,any>) => {
            Object.keys(pageOption).forEach((methodName) =>{
                console.log('解析page', methodName, pageOption[methodName])
                if('function' === typeof pageOption[methodName]){
                    if(/\_\_track$/.test(methodName)){
                        const oldFn = pageOption[methodName]
                        pageOption[methodName] = (...args:any) =>{
                            this.$teaReport(methodName, args)
                            oldFn(...args)
                        }
                    }
                }
            })
            return originPage(pageOption);
        };
    },
    /**
     * 页面未找到时的核心处理方法
     * 默认跳转至首页
     * 规则可在config中配置支持
     */
    onPageNotFound(e: WechatMiniprogram.App.PageNotFoundOption) {
        console.warn("-----pageNotFound-----", e)
        let path = `/pages/index/index`,
            method = 'redirectTo',
            query = [],
            success = undefined;
        if (e.query) {
            for (const key in e.query) {
                if (e.query.hasOwnProperty(key)) {
                    query.push(`${key}=${encodeURIComponent(e.query[key])}`)
                }
            }
        }
        const queryStr: string = query.join("&")
        for (const reg in config.appNotFindRules) {
            if (config.appNotFindRules.hasOwnProperty(reg)) {
                const ele = config.appNotFindRules[reg];
                const regExp = new RegExp(reg)
                if (regExp.test(e.path)) {
                    if ('object' == typeof ele) {
                        if (ele.hasOwnProperty("method") && ['redirectTo', 'navigatorTo', 'switchTab'].indexOf(ele.method)) {
                            method = ele.method
                        }
                        if (ele.hasOwnProperty("path") && ele.path) {
                            path = 'function' == typeof ele.path ? ele.path.call(this, e) : ele.path
                        }
                        if (ele.hasOwnProperty("success") && 'function' == typeof ele.success) {
                            success = ele.success
                        }
                    } else {
                        path = 'function' == typeof ele ? ele.call(this, e) : ele
                    }
                    if (queryStr) {
                        path += path.indexOf('?') > -1 ? `&${queryStr}` : `?${queryStr}`
                    }
                    this.navigator({
                        path,
                        method,
                        success
                    } as Inavigator)
                }
            }
        }
    },
    navigator({
        path,
        method = "redirectTo",
        success
    }: Inavigator) {
        // @ts-ignore
        wx[method].call(this, {
            url: path
        }).then(() => {
            success && success.call(this)
        }).catch((e: any) => {
            console.error(e)
            try {
                const err = e instanceof Error ? e.message : (typeof e == 'object' ? (JSON.stringify(e)) : e)
                if (/tab\s?bar\s?page/.test(err)) {
                    wx.switchTab({
                        url: path,
                        success: () => {
                            success && success.call(this)
                        }
                    })
                }
            } catch (error) {
                console.error(error)
                wx.switchTab({
                    url: `/pages/index/index`,
                    success: () => {
                        success && success.call(this)
                    }
                })
            }
        })
    },
    /**
     * 场景上报
     * @param options 
     * @param isAppOnLanch 
     */
    async sceneReport(options: WechatMiniprogram.App.LaunchShowOption, isAppOnLanch = false) {
        // 从分享或者扫码进来的
        if (options && Object.keys(options).length) {
            let query = options.query || {};
            let scene = query.scene || options.scene || '';
            let uuid = (scene.length === 32 || scene.length === 36) ? scene : null; //uuid
            // @ts-ignore
            uuid && this.setEnvStorageSync("sceneId", uuid); // 存来源uuid
            if (uuid.length === 32) {
                uuid = uuid.slice(0, 8) + '-' + uuid.slice(8, 12) + '-' + uuid.slice(12, 16) + '-' + uuid.slice(16, 20) + '-' + uuid.slice(20)
            }
            // 为什么
            // if (isAppOnLanch) return true;
            let current_etc: any = null;
            if (uuid) {
                //如果未登录尝试登录
                if (util.getUserId()) {
                    //上报渠道信息
                    sceneApi.reportScene({
                        options,
                        scene: uuid
                    })
                } else {
                    //延迟上报
                    console.log(`场景延迟上报`)
                    setTimeout((e: any) => {
                        sceneApi.reportScene({
                            options,
                            scene: uuid
                        })
                    }, 1800)
                }

                //查询二维码渠道信息
                const {
                    etc
                }: any = uuid ? await sceneApi.getSceneInfo({
                    uuid
                }) : { etc: null };
                current_etc = etc;
            }
            console.log("-----current_etc-----", current_etc)


            try {
                if (current_etc && current_etc.type == 'simulation' && current_etc.access_token) {
                    //模拟用户启动
                    wx.showModal({
                        content: '是否模拟用户身份访问？模拟结束时请在调试console清除storage',
                        success: (c) => {
                            if (c.confirm) {
                                getApp<IAppOption>().setToken(current_etc.access_token)
                                setTimeout(() => {
                                    wx.switchTab({
                                        url: `/pages/index/index`,
                                    })
                                }, 100)
                            }
                        }
                    })
                }
            } catch (error) {
                console.error(error)
            }

            // @ts-ignore
            uuid && this.setEnvStorageSync("sceneId", uuid); // 存来源uuid 

            //重定向
            if (current_etc) {
                // @ts-ignore
                this.store.state.current_etc = current_etc
                if (current_etc.path) {
                    util.openPage(current_etc.path, () => {
                        setTimeout(() => {
                            // @ts-ignore
                            this.store.state.current_etc = null
                        }, 5000)
                    })
                }
            }
        }
    },
    /**
    * 扫码进入的数据
    */
    parseScanUri(options: WechatMiniprogram.App.LaunchShowOption) {
        if (options && options.hasOwnProperty('q')) {
            // 拦截扫码进入的数据
            try {

            } catch (error) {
                console.error(error)
            }
        }
    },
    setToken(token) {
        let userInfo = this.getEnvStorageSync("userInfo") || {}
        userInfo.access_token = token
        this.setEnvStorage({
            key: 'userInfo',
            data: userInfo
        })
    },
    getEnvStorageSync(key: string) {
        if (!this.storage[config.env + ':' + key]) {
            this.storage[config.env + ':' + key] = wx.getStorageSync(config.env + ':' + key)
        }
        return this.storage[config.env + ':' + key]
    },
    setEnvStorageSync(key: string, data: any) {
        this.setEnvStorage({
            key,
            data
        })
    },
    setEnvStorageSyncDebounce(key, data, delay = 100) {
        if (this.timer_env_storage[key]) {
            clearTimeout(this.timer_env_storage[key])
        }
        this.timer_env_storage[key] = setTimeout(() => {
            delete this.timer_env_storage[key]
            this.setEnvStorage({
                key,
                data
            })
        }, delay)
    },
    setEnvStorage({
        key,
        data
    }: any) {
        this.storage[config.env + ':' + key] = data
        wx.setStorage({
            key: config.env + ':' + key,
            data
        })
    },
    removeEnvStorageSync(key: string) {
        delete this.storage[config.env + ":" + key];
        wx.removeStorageSync(config.env + ':' + key);
    },
    clearEnvStorageSync() {
        this.storage = {}
        wx.clearStorageSync()
    },
})