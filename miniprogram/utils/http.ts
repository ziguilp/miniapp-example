import Fly, { FlyError, FlyPromise, FlyRequestConfig, FlyResponse, TurboRequestParam } from '../vendor/fly/index'
import { appConfig as config } from '../config';
import util, { buildLocalUserInfo, TurboModal } from './util';

const fly = Fly()
fly.config.baseURL = config.host;
fly.interceptors.request.use((request: FlyRequestConfig) => {
    console.log('[request]', request)
    if (typeof request.withoutToken == 'undefined' || request.withoutToken === false) {
        console.log(`需要token`)
        const token = util.getUserToken();
        console.log(`token`, token)
        if (token) request.headers.Authorization = `Bearer ${token}`
    } else {
        console.log(`不需要token`)
    }
    return request
})

fly.interceptors.response.use(
    async (response: FlyResponse) => {
        wx.stopPullDownRefresh()
        console.log('【RESPONCE】', response)
        try {
            const { request } = response;
            if (response.status == 200 && response.data && response.data.code == 200 && response.data.data && request && /\/api\/user\/login/.test(request.url || '') && request.body.hasOwnProperty('channelId')) {
                getApp().removeEnvStorageSync("channel_id");
            }
        } catch (error) {
            console.error("reponse.interceptors", error)
        }

        if (response.status && response.status >= 200 && response.status < 300) {
            return response
        }
        else if (response.status === 401 || response.status === 503) {
            // let result = await login()
            // 为了防止影响登录注册，故仅采取重试策略
            await util.sleep(1200);
            const result = await login();
            if (result) {
                //console.log('静默登录成功')
                return fly.request(response.request) //暂时先注掉，因为token是在url里面拼接的
            } else {
                redirectLogin();
                return Promise.reject('未登录')
            }
        } else {
            //console.log('statusCode异常---------',response)
            let showErrorMsg = true;
            try {
                if (response && response.request && response.request.hasOwnProperty("showErrorMsg")) {
                    showErrorMsg = response.request.showErrorMsg || true
                }

                if (showErrorMsg === true) {
                    const message = response.data.errors ? response.data.errors[0].message : '系统繁忙~'
                    message && wx.showToast({ title: message, icon: 'none' })
                } else if (showErrorMsg) {
                    wx.showToast({ title: showErrorMsg, icon: 'none' })
                }

            } catch (error) {
                console.error(error)
            }

        }
        return response
    },
    async (err: FlyError) => {
        console.error('【RESP】', err)
        // console.error(err)
        getApp().$sentry.captureException(err)
        try {
            const { response, request } = err
            console.log({ response, request })
            if (!response) {
                console.log(`空反馈`, response)
            } else if (response.status === 401 || response.status === 403) {
                // let result = await login()
                // 为了防止影响登录注册，故仅采取重试策略
                await util.sleep(1200);
                const result = await login();
                if (result) {
                    //console.log('静默登录成功')
                    return fly.request(request||{}) 
                } else {
                    redirectLogin();
                    return Promise.reject('未登录')
                }
            }
            const { data: { message } }: any = response;
            const showErrorMsg = request && request.hasOwnProperty('showErrorMsg') ? request.showErrorMsg : true
            console.log("[RESP_MESSAGE]", message)
            const messagestr = message instanceof Array ? message.join(",") : message;
            if (message) {
                if (showErrorMsg) {
                    wx.showToast({
                        title: messagestr,
                        icon: 'none'
                    })
                }
                await util.sleep(1000)
                return Promise.reject(messagestr)
            }
        } catch (error) {
            console.error(error)
        }

        wx.stopPullDownRefresh()
        let isShowNormalError = true
        const hideNormalMessage = () => isShowNormalError = false
        setTimeout(() => {
            if (isShowNormalError) {
                if (err.status === 0) {
                    wx.showToast({ title: '网络异常，请稍后重试~', icon: 'none', duration: 3000 });
                }
                else if (err.status === 1) {
                    wx.showToast({ title: '请求超时，请稍后重试~', icon: 'none', duration: 3000 });
                }
                else {
                    wx.showToast({ title: '系统开小差了啦~', icon: 'none', duration: 3000 });
                }
            }
        })
        //console.log({ ...err.response, hideNormalMessage })
        throw { ...err.response, hideNormalMessage }
    }
)

/**
 * @param {*} url //接口地址
 * @param {*} method // GET，POST等等请求方式
 * @param {*} options // 请求配置参数：例如 showErrorMsg
 * @param {*} data  //post请求带的body体的参数
 * @param {*} query  //Object类型，请求带的query的参数
 * @param {*} mustAuth 该页面是否引导授权
 */
export const httpRequest = (requestParam: TurboRequestParam):Promise<FlyPromise<any>> => {
    const { url, method = 'GET', data = {}, mustAuth, options = {} } = requestParam;
    const token = util.getUserToken();
    if (mustAuth && !token) {
        wx.navigateTo({ url: '/pages/user/pages/login/index' });
        return Promise.reject('暂未登录')
    }
    // @ts-ignore
    return fly[method.toLowerCase()](url, data, options);
}

/**
 * 未授权，跳转到登录页面
 */
let redirectLoginModal = false;
export const redirectLogin = () => {
    if (redirectLoginModal) return false;
    redirectLoginModal = true;
    return TurboModal({ title: '提示：您还没有登录', content: '登录后，方可以使用全部功能' }).then(() => {
        redirectLoginModal = false
        wx.navigateTo({ url: '/pages/user/pages/login/index' });
    }).catch(() => {
        redirectLoginModal = false
        return; // 拒绝跳转,则不作任何处理，只是把reject传递出去。
    });
}

const loginFly = Fly()
loginFly.config.baseURL = config.host;
/**
 * 自动登录
 */
export const login = async (opt?: WechatMiniprogram.App.LaunchShowOption) => {
    const options = opt|| {} as WechatMiniprogram.App.LaunchShowOption;
    const query = options.query || {}
    const scene = query.scene || options.scene || '';
    const uuid = (scene.length === 32 || scene.length === 36) ? scene : ''; //uuid
    // if(!uuid){
    //     uuid =  getApp().getEnvStorageSync("sceneId") || ''
    // }
    const { code } = await wx.login();
    console.log("----------登录-----------", { options, uuid, code })
    fly.lock()
    try {
        getApp().$teaReport('login', {
            options,
            code
        })
    } catch (error) {

    }
    const res = await loginFly.get({
        url: `/auth/third/login/wechat/wechat_miniapp?code=${code}&scene=${uuid}`
    }).catch(console.error)
    if (res && res.status == 200) {
        const userInfoRes = res.data.data.userInfo
        const userInfo = buildLocalUserInfo(userInfoRes)
        fly.unlock()
        return userInfo
    }
    fly.unlock()
    return Promise.reject(res)
}

export default {
    redirectLogin,
    login,
    httpRequest,
}