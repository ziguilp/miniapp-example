import dayjs from 'dayjs';
import jwtDecode from '../vendor/jwt-decode';
import { IAppOption, IUserInfo, TurboFn } from '../../typings';
import { login } from './http';

/**
 * 是否为空：null、undefined、''、'  '、{},[],Nan 都返回true
 * @param obj 
 */
export const isEmpty = (obj:any) => {
    if(typeof obj === 'number' && obj === NaN){
        return true;
    }
    if(typeof obj != 'number' && !obj){
        return true;
    }
    if(typeof obj === 'string'){
        return obj.replace(/\s/g,'') === '';
    }
    if(obj instanceof Array && obj.length == 0) {
        return true;
    }
    if(typeof obj === 'object'){
        return Object.keys(obj).length === 0; 
    }
    return false;
}

export const Log = () => {
    const log = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null
    return {
        info(...arg: any) {
            if (!log) return
            log.info(...arg)
        },
        log(...arg: any) {
            if (!log) return
            log.info(...arg)
        },
        warn(...arg: any) {
            if (!log) return
            log.warn(...arg)
        },
        error(...arg: any) {
            if (!log) return
            log.error(...arg)
        },
        setFilterMsg(msg: string) { // 从基础库2.7.3开始支持
            if (!log || !log.setFilterMsg) return
            if (typeof msg !== 'string') return
            log.setFilterMsg(msg)
        },
        addFilterMsg(msg: string) { // 从基础库2.8.1开始支持
            if (!log || !log.addFilterMsg) return
            if (typeof msg !== 'string') return
            log.addFilterMsg(msg)
        }
    }
}



/**
 * 下划线转换驼峰
 * @param string 
 * @returns 
 */
export const toHump = (string: string) => {
    return string.replace(/\_(\w)/g, function (all, letter) {
        return letter.toUpperCase();
    });
}

/**
 * 驼峰转换下划线
 * @param string 
 * @returns 
 */
export const toLine = (string: string) => {
    return string.replace(/([A-Z])/g, "_$1").toLowerCase();
}


/**
 * Object-key
 */
export const hasKey = (obj: Record<string, unknown> | any, key: string): boolean => {
    return obj && obj instanceof Object ? Object.hasOwnProperty.call(obj, key) : false;
}

/**
 * 扫码
 * 注：scanType，不传参则默认['barCode'], 传参则使用参数值
 * @param { Array } scanType:['barCode],['qrCode],['barCode','qrCode']
 */
export const TurboScanCode = (scanType: ("barCode" | "qrCode" | "datamatrix" | "pdf417")[] = ['barCode']) => {
    return new Promise((resolve, reject) => {
        wx.scanCode({
            scanType: scanType ? scanType : ['barCode'],
            success(res) {
                if (res.errMsg === 'scanCode:ok') {
                    resolve(res)
                } else {
                    reject(res)
                }
            }
        })
    })
}

/**
 * 模态框
 * @param param0 
 */
export const TurboModal = ({
    title = "提示",
    content,
    confirmText = "确定",
    cancelText = "取消",
    showCancel = true,
    confirmColor = '#DD0022' }: WechatMiniprogram.ShowModalOption): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        wx.showModal({
            title,
            content,
            confirmText,
            cancelText,
            showCancel,
            confirmColor,
            success: (res) => {
                if (res.confirm) {
                    // 确定
                    resolve(true);
                } else {
                    // 取消
                    reject(false);
                }
            },
            fail: (e) => {
                reject(e)
            }
        });
    });
}



/**
 * 获取用户授权情况
 * @param { authType}, 权限类型名称 取值：userInfo userLocation address invoiceTitle writePhotosAlbum
 * 详见： https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/authorize.html
 */
export const getSetting = (authType: string) => {
    return new Promise((resolve) => {
        wx.getSetting({
            async success(res) {
                if (!hasKey(res.authSetting, `scope.${authType}`)) {
                    // 无权限,设置授权
                    authSetting(authType).then((ares) => {
                        resolve(ares)
                    }).catch(console.error)
                } else {
                    // 有权限
                    resolve(true)
                }
            }
        })
    })
}


/**
 * 设置授权信息
 *
 */
export const authSetting = (authType: string) => {
    return new Promise((resolve) => {
        wx.authorize({
            scope: `scope.${authType}`,
            success(res) {
                // 同意授权，则执行下一步
                console.log('authSetting success', res)
                resolve(true)
            },
            fail(res) {
                // 拒绝授权，弹窗询问（只要拒绝过一次，以后每次都执行这里）
                console.log('authSetting fail', res)
                wx.showModal({
                    title: '访问您的相册权限',
                    content: '去获取相册权限？',
                    showCancel: true,
                    confirmText: '去授权',
                    confirmColor: '#3CC51F',
                    success: (result) => {
                        if (result.confirm) {
                            openSetting(authType)
                        }
                    }
                });

            }
        })
    })
}

/**
 * 打开授权设置界面
 */
export const openSetting = (authType: string) => {
    wx.openSetting({
        success() {
            authSetting(authType)
        }
    })
}

/**
 * 保存图片 
 */
export const saveImageToPhotosAlbum = (filePath: string) => {
    return new Promise((resolve, reject) => {
        getSetting('writePhotosAlbum')
            .then(() => {
                wx.saveImageToPhotosAlbum({ filePath })
                    .then(() => {
                        resolve(filePath)
                    }).catch((err) => {
                        console.log(err);
                        wx.showToast({ title: '保存失败', icon: 'none' })
                        reject(err)
                    })
            })
    })
}

/**
 * 执行某页面的方法
 * @param {*} pageLoaded 
 * @param {*} methodName 
 */
export const execPageMethod = (pageLoaded: number, methodName: string, args: any) => {
    const pages = getCurrentPages();
    if (pages.length > pageLoaded) {
        const prePage = pages[pages.length - pageLoaded - 1];
        prePage[methodName] && prePage[methodName](args)
    }
}

/**
 * 获取当前页面对象
 */
export const getCurrentPageObj = () => {
    const len = getCurrentPages().length;
    return getCurrentPages()[len - 1]
}

/** 
* 获取当前页url
*/
export const getCurrentPageUrl = () => {
    const pageObj = getCurrentPageObj();
    return '/' + pageObj.route;
}

/** 
* 获取当前页带参数的url
*/
export const getCurrentPageUrlWithArgs = (args = {}) => {
    const pageObj = getCurrentPageObj();
    const url = pageObj.route;    //当前页面url
    let options = pageObj.options    //获取url中所带的参数对象options
    if (args) {
        options = Object.assign({}, options, args)
    }
    //拼接url的参数
    let urlWithArgs = '/' + url + '?';
    for (let key in options) {
        const value = options[key];
        urlWithArgs += key + '=' + value + '&'
    }
    urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)

    return urlWithArgs
}


/**
 * 星期转换
 */
export const weekParse = (num: number) => {
    return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][num];
}

/**
 * 版本比较，兼容处理
 * v2:支持这个功能，需要的版本
 * return < 0 用户版本太低
 */
export const compareVersion = (version: string) => {
    const surVersion = wx.getSystemInfoSync().SDKVersion;
    // console.log(surVersion)
    const v1 = surVersion.split('.');
    const v2 = version.split('.');
    const len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }

    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i])
        const num2 = parseInt(v2[i])

        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }
    return 0
}

/**
 * 订阅号模板信息
 */
export const subscribeMessage = (tmplIds: string[]): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        if (compareVersion('2.8.2') >= 0) {
            wx.getSetting({
                withSubscriptions: true
            })
                .then((res) => {
                    if (res.subscriptionsSetting && !res.subscriptionsSetting.mainSwitch) {
                        TurboModal({
                            title: '提示',
                            content: '请前往右上角设置打开订阅消息开关哦，否则您可能无法接受到订单消息',
                            confirmText: '不设置',
                            cancelText: '去设置'
                        })
                            .then(() => {
                                Log().warn('warn: 未打开订阅消息权限');
                                reject(false)
                            }).catch((err: Error) => {
                                console.error(err)
                                wx.openSetting({
                                    withSubscriptions: true,
                                })
                                reject(false)
                            })
                    } else {
                        wx.requestSubscribeMessage({
                            tmplIds,
                            success: async (res) => {
                                // console.log(res)
                                const flag = tmplIds.findIndex((i) => res[i] == "reject") > -1; //有未选中的项
                                if (flag) {
                                    const confirm = await TurboModal({
                                        title: '提示',
                                        content: '没有勾选可能导致您不能收到相应的消息通知哟',
                                        confirmText: '我知道了',
                                        cancelText: '去设置'
                                    }).catch((e: Error) => {
                                        console.error(e)
                                        wx.openSetting({
                                            withSubscriptions: true,
                                        })
                                        reject(false)
                                    })
                                    if (confirm) {
                                        resolve(true)
                                    }
                                    reject(false)
                                } else {
                                    resolve(true)
                                }
                            },
                            fail(err) {
                                if (err && err.errMsg && err.errMsg.indexOf('fail can only be invoked by user TAP gesture') < 0) {
                                    wx.showToast({
                                        title: err.errMsg,
                                        icon: 'none'
                                    })
                                }
                                console.error(err)
                                reject(err)
                            }
                        })
                    }
                })
        } else {
            resolve(true);
        }
    })
}

/**
 * 线上版本库：1.4.4
 * 
 * 1.wx.canIUse() 兼容性处理，函数封装 
 * 
 * 2.(注意此处有坑)此接口某些兼容性官方文档有bug，测试不了，
 * 请用上面的compareVersion函数做版本号处理兼容性，坑如下：
 * navigator.target.miniProgram(2.0.7)
 * 整理中...
 **/
export const canIUse = (str: string) => {
    if (!wx.canIUse(str)) {
        wx.showModal({
            title: '提示',
            content: '当前微信版本过低，请升级到最新版本'
        })
        return;
    }
    return true;
}


/**
 * 获取app实例或者已缓存的基础用户信息
 */
export const getUserInfo = () => {
    const app: IAppOption = getApp();
    let userInfo: IUserInfo | null = null;
    try {
        if (app.globalData.userInfo && hasKey(app.globalData.userInfo, 'userId') && hasKey(app.globalData.userInfo, 'access_token')) {
            userInfo = app.globalData.userInfo
        } else {
            userInfo = app.getEnvStorageSync('userInfo') || null
            if (userInfo && userInfo.access_token && !userInfo.expires_time) {
                const jwtToken = jwtDecode(userInfo.access_token)
                userInfo.expires_time = jwtToken.exp || 0;
            }
        }
        Log().info(`userInfo`, userInfo)
        return userInfo
    } catch (error) {
        console.error(error)
    }
    return null
}

/**
 * 获取基础用户信息[未登录的会自动登录]
 */
export const getUserInfoForce = async () => {
    let userInfo = getUserInfo()
    let isExpired = false
    if (userInfo) {
        isExpired = (new Date()).getTime() > ((userInfo.expires_time || 0) - 180) * 1000 //提前3分钟
    }

    if (!userInfo || isExpired) {
        userInfo = await login()
    }
    return userInfo
}

/**
 * 获取用户ID
 */
export const getUserId = () => {
    const userInfo = getUserInfo();
    if (userInfo) {
        return userInfo.userId || userInfo.id;
    }
    return '';
}

/**
 * 强制获取用户ID[没登录的会自动登录]
 */
export const getUserIdForce = async () => {
    const userInfo = await getUserInfoForce();
    if (userInfo) {
        return userInfo.userId || userInfo.id;
    }
    return '';
}

/**
 * 通过云函数获取用户ID
 */
const getUserOpenIdAndUnionId = async ({
    force = false
} = {}) => {
    let openId = '';
    let unionId = '';
    try {
        openId = getApp().globalData.userInfo.openId
        unionId = getApp().globalData.userInfo.unionId
    } catch (error) {
        console.error(error)
    }
    if (force && !(openId)) {
        wx.cloud.init()
        const cloudUser: any = (await wx.cloud.callFunction({
            name: 'user',
            data: {
                action: 'getOpenId'
            }
        }))
        if (cloudUser && cloudUser.result) {
            const {
                openid,
                unionid
            } = cloudUser.result
            openId = openid
            unionId = unionid

            if (!getApp().globalData.userInfo) {
                getApp().globalData.userInfo = {}
            }

            getApp().globalData.userInfo = {
                ...getApp().globalData.userInfo,
                openId,
                unionId
            }
        }
    }
    return {
        openId,
        unionId
    }
}


/**
 * 获取用户Token
 * @returns string
 */
export const getUserToken = ({
    checkExpire = true
} = {}) => {
    const userInfo = getUserInfo();
    if (userInfo) {
        if (checkExpire) {
            return (userInfo.expires_time || 0) > (new Date()).getTime() / 1000 ? userInfo.access_token : ''
        }
        return userInfo.access_token;
    }
    return '';
}

/***
 * 打开新页面的方法,自动识别navigateTo,switchTab和web页面和其他小程序
 * @param url 路径：miniapp#appId#path#extraData
 */
export const openPage = (url: string, callback?: TurboFn) => {
    if (!url) {
        return console.warn("空的跳转链接")
    }
    if (url.startsWith('miniapp')) {
        // 说明是走打开小程序的路子
        try {
            const params = url.split("#");
            const appId = params[1],
                path = params.length > 2 ? params[2] : '',
                extraDataString = params.length > 3 ? params[3] : '{}';
            const extraData = JSON.parse(extraDataString)
            wx.navigateToMiniProgram({
                appId,
                path,
                extraData
            })

        } catch (error) {
            console.error(error)
        }

        return;
    }

    if (/^https?:\/\//i.test(url)) {
        // webview
        return wx.navigateTo({
            url: `/pages/web/index?url=${encodeURIComponent(url)}`,
            success() {
                callback && 'function' == typeof callback && callback()
            },
            fail: (e) => {
                console.error(e)
            }
        })
    }

    // 小程序内
    if (!url.startsWith('/')) {
        url = '/' + url;
    }

    const testSwtich = (url: string) => {
        // 失败则尝试switchTab
        const query = parseQueryParams(url)
        if (query && Object.keys(query).length > 0) {
            getApp().store.state.current_etc = {
                onLoadOptions: {
                    ...query
                }
            }
        }
        wx.switchTab({
            url,
            success() {
                callback && 'function' == typeof callback && callback()
            }
        });
    }

    if (getCurrentPages().length > 9) {
        return wx.reLaunch({
            url,
            success() {
                callback && 'function' == typeof callback && callback()
            }
        })
    }

    wx.navigateTo({
        url,
        fail() {
            testSwtich(url)
        },
        success() {
            callback && 'function' == typeof callback && callback()
        }
    });
}

/**
 * 计算折扣
 * @param originalPrice 原价
 * @param presentPrice 现价
 * @param format 返回格式 例如：presentPrice/originalPrice=6.5,那么d.d返回6.5,dd返回65,d返回6,s返回六,ss返回六五
 */
export const calcDicount = ({
    originalPrice,
    presentPrice,
    format = 'd.d'
}: any) => {
    format = format.toLocaleUpperCase()
    originalPrice = Number(originalPrice)
    presentPrice = Number(presentPrice)
    if (!originalPrice || !presentPrice || originalPrice <= 0 || originalPrice <= presentPrice) {
        console.error(`Params For Price Is Invalid: originalPrice:${originalPrice} presentPrice:${presentPrice}`)
        return '';
    }
    if (['D', 'DD', 'D.D', 'S', 'SS', 'S.S'].indexOf(format) < 0) {
        format = 'D.D';
    }
    const discout: string = (presentPrice / originalPrice * 100).toFixed(1),
        numStr: string[] = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    return format.replace(/([\\D|\\S])(\.?)([\\D|\\S]?)/, (rs: any, s1: any, s2: any, s3: any) => {
        const d0: number = parseInt(discout[0]);
        const d1: number = parseInt(discout[1]);
        const res = [s1 == 'D' ? d0 : numStr[d0], s2, d1 ? '' : (s3 == 'D' ? d1 : numStr[d1])];
        return res.join("").replace(/\.$/, '');
    })
}

/**
 * 睡眠
 * @param time 毫秒
 */
export const sleep = (time: number) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, time)
    })
}

/**
 * 解析路径中的query参数
 * @returns Object || null
 */
export const parseQueryParams = (url: string) => {
    if (!url || !/\?(.*?)$/.test(url)) {
        return null
    }
    const queryStr = url.replace(/^([^\?]*?)\?(.*?)$/, "$2")
    if (!queryStr) {
        return null
    }
    let res: any = {};
    const queryStrArr = queryStr.split("&");
    queryStrArr.forEach((e) => {
        try {
            const kv: string[] = e.split("=");
            res[kv[0]] = kv[1]
        } catch (error) {
            console.error(error)
        }
    })
    return res
}


/**
 * 跳转到物流详情
 * @param trackingNo 物流单号
 * @param type 0=正向 1=反向
 */
export const toLogisticsDetail = (trackingNo: string, type = 0) => {
    let url = ``
    if (trackingNo.indexOf('JD') > -1) {
        if (type == 0)
            url = `miniapp#wx73247c7819d61796#/packageSub/packageOrder/order/orderDetail?id=${trackingNo}&type=2`
        else
            url = `miniapp#wx73247c7819d61796#/packageSub/packageOrder/order/orderDetail?id=${trackingNo}&type=1`
    }
    openPage(url)
    getApp().$teaReport('toLogisticsDetail', {
        trackingNo,
        type,
        url
    })
}

/**
 * 比较差异
 * @param {*} obja 
 * @param {*} objb 
 * @return 返回objb中和obja中不同的值(仅仅比较相同key值),没有则返回null
 */
export const objectDiff = (obja: { [key: string]: any }, objb: { [key: string]: any }) => {
    const kbs: string[] = Object.keys(objb).sort();
    let res: any = {}
    for (let index = 0; index < kbs.length; index++) {
        const k = kbs[index];
        if (obja[k] != objb[k]) {
            res[k] = objb[k]
        }
    }
    return Object.keys(res).length > 0 ? res : null
}


export const buildLocalUserInfo = (userInfoRes: IUserInfo) => {
    const app = getApp<IAppOption>();
    let userInfo = {
        ...(app.globalData.userInfo || {}),
        ...userInfoRes,
        vipExpireTime: dayjs(userInfoRes.vip_expire_time).format('YYYY-MM-DD HH:mm:ss'),
        date_created_text_zh: dayjs(userInfoRes.date_created).format("YYYY年MM月DD日"),
        joinDays: Math.ceil((dayjs().unix() - dayjs(userInfoRes.date_created).unix()) / 86400),
        birthday: dayjs(userInfoRes.birthday || ``).format(`YYYY-MM-DD`)
    }
    console.log(`buildUserinfo`, userInfoRes)
    if (userInfoRes.access_token) {
        userInfo.access_token = userInfoRes.access_token;
        userInfo.refresh_token = userInfoRes.access_token;
        const jwtToken = jwtDecode(userInfo.access_token)
        console.log(`jwtToken`, jwtToken)
        if (jwtToken) {
            userInfo.expires_time = jwtToken.exp
        }
    }
    app.globalData.userInfo = userInfo
    app.setEnvStorageSync("userInfo", app.globalData.userInfo)
    app.store.dispatch('setUserInfo', app.globalData.userInfo)
    return app.globalData.userInfo
}

/**
 * 因为安全原因 svg 需转译以便作为背景图使用，也可直接在浏览器中打开
 * 因为要保留 xvg 可读性，所以使用自定义方法进行转义
 */
export const svgToUrl = (str:string) => {
    return `data:image/svg+xml,${str
        .replace(/\n/g, '')
        .replace(/<!--(.*)-->/g, '') // 必须去掉注释
        .replace(/[\r\n]/g, ' ') // 最好去掉换行
        .replace(/"/g, "'") // 单引号是保留字符，双引号改成单引号减少编码
        .replace(/%/g, '%25')
        .replace(/&/g, '%26')
        .replace(/#/g, '%23')
        .replace(/{/g, '%7B')
        .replace(/}/g, '%7D')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E')}`;
};
/**
 * 生成 svg 字符串
 * @param {object} options 参数
 * text 水印文字
 * <text> 属性（x y transform） 方向位置按需调整
 * <svg> 中fill属性决定字体颜色
 */
export const getCanvasUrl = (options:any, user?:IUserInfo) => {
    const {
        text = `${new Date().toLocaleDateString()} ${user?.nickname || ''}`,
        width = 187.5,
        height = 112.5,
        fontSize = 16,
        color = 'rgb(128,128,128)',
        fontFamily = 'inherit',
    } = options || {};
    return `<svg
     width="${width}"
     height="${height}"
     fill="${color}"
     xmlns="http://www.w3.org/2000/svg"
   >
     <text
       x="65%"
       y="55%"
       transform="rotate(-31, 100 100)"
       font-size="${fontSize}"
       font-family="${fontFamily}"
       text-anchor="middle"
       dominant-baseline="middle"
     >${text}</text>
     <text
     x="65%"
     y="55%"
     transform="rotate(-31, 140 100)"
     font-size="13"
     font-family="${fontFamily}"
     text-anchor="middle"
     dominant-baseline="middle"
   >${user?.id || ''}</text>
   </svg>`;
}


export default {
    toHump,
    toLine,
    hasKey,
    TurboScanCode,
    TurboModal,
    execPageMethod,
    getCurrentPageObj,
    getCurrentPageUrl,
    getCurrentPageUrlWithArgs,
    saveImageToPhotosAlbum,
    openSetting,
    getSetting,
    authSetting,
    weekParse,
    compareVersion,
    canIUse,
    getUserId,
    getUserIdForce,
    getUserOpenIdAndUnionId,
    getUserInfo,
    getUserInfoForce,
    getUserToken,
    subscribeMessage,
    openPage,
    calcDicount,
    sleep,
    parseQueryParams,
    toLogisticsDetail,
    objectDiff,
    buildLocalUserInfo,
    isEmpty,
    svgToUrl,
    getCanvasUrl,
}
