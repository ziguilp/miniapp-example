// app.ts
import { IAppOption, Inavigator } from '../typings';
import store from './store/index';
// @ts-ignore
import 'turbo-number';
import { appConfig as config } from './config';
import { EventBus } from './utils/eventbus';
import util from './utils/util';
import sceneApi from './api/scene.api';
import { login } from './utils/http';
import TurboTracker from './vendor/xbossTrack/index';
import { tr, report } from './vendor/track/report';

new TurboTracker({ tracks: [], isUsingPlugin: false }, report);

App<IAppOption>({
    storage: {},
    eventBus: new EventBus(),
    timer_env_storage: {},
    store,
    globalData: {},
    $teaReport: report,
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
        //     tr.setOpenId(openId)
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
            //code?????????????????????
            const user = await login(options);
            if (user) {
                tr.setOpenId(user.userId)
            }
        } catch (error) {
            console.error("????????????", error)
        }

        const systemInfo = wx.getSystemInfoSync()
        this.systemInfo = {
            ...systemInfo,
            rpxRate: Number((750 / systemInfo.screenWidth).toFixed(2)),
            isIos: /(IOS|IPAD)/.test(systemInfo.system.toUpperCase())
        }

        try {
            // ??????????????????
            this.parseScanUri(options)
        } catch (error) {
            console.error(error)
        }

        try {
            // ?????????????????????
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
                // ?????????????????????????????????
                console.log("?????????????????????????????????", res.hasUpdate)
            })
            updateManager.onUpdateReady(() => {
                wx.showModal({
                    title: '????????????',
                    content: '???????????????????????????????????????????????????',
                    success: function (res) {
                        if (res.confirm) {
                            // ???????????????????????????????????? applyUpdate ????????????????????????
                            updateManager.applyUpdate()
                        }
                    }
                })
            })
            updateManager.onUpdateFailed(function () {
                // ????????????????????????
                wx.showToast({
                    title: '?????????????????????',
                    icon: 'none'
                });
            })

        } catch (ex) {
            console.error(ex)
        }
    },
    async onShow(options: WechatMiniprogram.App.LaunchShowOption) {
        // decorator Page Function
        console.log("--------appOnShow--------", options)

    },
    /**
     * ???????????????????????????????????????
     * ?????????????????????
     * ????????????config???????????????
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
     * ????????????
     * @param options 
     * @param isAppOnLanch 
     */
    async sceneReport(options: WechatMiniprogram.App.LaunchShowOption, isAppOnLanch = false) {
        // ??????????????????????????????
        if (options && Object.keys(options).length) {
            let query = options.query || {};
            let scene = query.scene || options.scene || '';
            let uuid = (scene.length === 32 || scene.length === 36) ? scene : null; //uuid
            // @ts-ignore
            uuid && this.setEnvStorageSync("sceneId", uuid); // ?????????uuid
            if (uuid.length === 32) {
                uuid = uuid.slice(0, 8) + '-' + uuid.slice(8, 12) + '-' + uuid.slice(12, 16) + '-' + uuid.slice(16, 20) + '-' + uuid.slice(20)
            }
            // ?????????
            // if (isAppOnLanch) return true;
            let current_etc: any = null;
            if (uuid) {
                //???????????????????????????
                if (util.getUserId()) {
                    //??????????????????
                    sceneApi.reportScene({
                        options,
                        scene: uuid
                    })
                } else {
                    //????????????
                    console.log(`??????????????????`)
                    setTimeout((e: any) => {
                        sceneApi.reportScene({
                            options,
                            scene: uuid
                        })
                    }, 1800)
                }

                //???????????????????????????
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
                    //??????????????????
                    wx.showModal({
                        content: '????????????????????????????????????????????????????????????console??????storage',
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
            uuid && this.setEnvStorageSync("sceneId", uuid); // ?????????uuid 

            //?????????
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
    * ?????????????????????
    */
    parseScanUri(options: WechatMiniprogram.App.LaunchShowOption) {
        if (options && options.hasOwnProperty('q')) {
            // ???????????????????????????
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