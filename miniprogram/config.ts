import { AppConfigProp } from '../typings';

export const appConfig: AppConfigProp = {
    env: 'dev',
    version: "v1.0.0",
    cmsVersion: "1", //CMS配置版本
    get host() {
        return this[this.env]['host']
    },
    get posterHost() {
        return this[this.env]['posterHost']
    },
    get shortLinkApikey() {
        return this[this.env]['shortLinkApiKey']
    },
    get graphql() {
        return this[this.env]['graphql']
    },
    dev: {
        host: 'http://127.0.0.1:3000',
        posterHost: "http://192.168.31.81:3000",
        shortLinkApiKey: "5a63fe928ea2a67785840c3b6d1603",
        graphql: {
            url: 'http://127.0.0.1:8055/graphql',
        },
    },
    test: {
        host: 'https://api.test.com',
        posterHost: "http://192.168.31.81:3000",
        shortLinkApiKey: "5a63fe928ea2a67785840c3b6d1603",
        graphql: {
            url: 'http://127.0.0.1:8055/graphql',
        },
    },
    prod: {
        host: 'https://api.test.com',
        posterHost: "http://192.168.31.81:3000",
        shortLinkApiKey: "5a63fe928ea2a67785840c3b6d1603",
        graphql: {
            url: 'http://127.0.0.1:8055/graphql',
        },
    },
    h5Url: {
        service: 'https://www.iqiyi.com/kszt/membershipagreement_ipad.html'
    },
    share: {
        title: '分享给你一个小程序',
        image: 'https://img2.baidu.com/it/u=2760581014,818518184&fm=253&fmt=auto&app=120&f=JPEG?w=840&h=500'
    },
    /** 
     * notFound时的重定向
     * @obj rules 配置的是指定路由时的重定向目标页面
     * @rules key目前只支持正则表达式作为未找到路径的匹配方案，并区分大小写
     * @rules value 支持Object，{path:重定向目标地址【支持字符串和function】,method:跳转方式【微信支持的几种跳转方式，默认为redirectTo，当识别为tab页面时自动使用switchTab】,success:重定向成功后执行的方法}
     * @rules value 支持String，即等同于{path:value}
     * @rules value 支持function，需返回重定向目标地址
     */
    appNotFindRules: {
        "ugc\\/my\\/comment$": "/pages/ugc/pages/my/list?type=0",
        "ugc\\/my\\/list$": "/pages/ugc/pages/my/list?type=0",
        "ugc\\/create\\/comment$": () => {
            if (getApp().systemInfo.isIos) {
                return `/pages/ugc/pages/create/comment`
            }
            return `pages/ugc/pages/create/commentAndroid`
        },
        "pages\\/user\\/pages\\/book\\/notice$": (e: any) => {
            return `/pages/tabBar/cart`
        }
    },
}
