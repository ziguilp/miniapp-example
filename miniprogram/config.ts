export interface AppConfigProp {
    env: 'dev' | 'test' | 'prod',
    version: string,
    cmsVersion:string,
    appNotFindRules: {
        [key:string]: any
    },
    [key:string]: any
}

export const appConfig:AppConfigProp = {
    env: 'dev', 
    version: "v1.0.0",
    cmsVersion: "0.3", //CMS配置版本
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
    get jwt() {
        return this[this.env]['jwt']
    },
    dev: {
        host: 'https://yuejie.tsingc.com/api',
        imgHost: "http://192.168.31.81:3000",
        acodeHost: 'http://192.168.31.81:3001',
        posterHost: "http://192.168.31.81:3000", //海报生成
        shortLinkApiKey: "5a63fe928ea2a67785840c3b6d1603",
        graphql: {
            url: 'http://127.0.0.1:8055/graphql',
        },
        jwt: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFiNWFmMTg1LTk2NTktNDlmMC04ZjJiLTY5YTEzNGQ5OTA3OCIsImlhdCI6MTYyMzY3MTIzNiwiZXhwIjoxNzEwMDcxMjM2fQ.AzAfdWG7lc37KdldCSQab5F0IjZP8WdGKFSC_HGKZPU',
        },

    },
    test: {
        host: 'https://yuejie.tsingc.com/api',
        imgHost: "https://img.woodylibrary.com",
        acodeHost: 'https://lite.stage.woodylibrary.com',
        posterHost: "https://stage.woodylibrary.com", //海报生成
        shortLinkApiKey: "5a63fe928ea2a67785840c3b6d1603",
        graphql: {
            url: 'https://lite.stage.woodylibrary.com/graphql',
        },
        jwt: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFiNWFmMTg1LTk2NTktNDlmMC04ZjJiLTY5YTEzNGQ5OTA3OCIsImlhdCI6MTYyMzY3MTIzNiwiZXhwIjoxNzEwMDcxMjM2fQ.AzAfdWG7lc37KdldCSQab5F0IjZP8WdGKFSC_HGKZPU',
        },

    },
    prod: {
        host: "https://yuejie.tsingc.com/api",
        imgHost: "https://img.woodylibrary.com",
        acodeHost: 'https://lite.woody.tsingc.com',
        posterHost: "https://api.woody.tsingc.com", //海报生成
        shortLinkApiKey: "bae999c5bdffdb37931fe5044325f7 ",
        graphql: {
            url: 'https://lite.woody.tsingc.com/graphql',
        },
        jwt: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJlMmU1NDQ4LWQ2MGMtNDNlNS05YWRkLTBlNDU4MzFhYmNkNCIsImlhdCI6MTYyNTAwMzMzMCwiZXhwIjoyNDg5MDAzMzMwfQ.UrIhmYJ6BpP2ZbdS1PShieJnmnfQwmDXJ_8IhO_1QxU'
        },
    },
    h5Url: {
        service: 'https://yuejie.tsingc.com/cms/detail/aggreement',
        yinsi: 'https://yuejie.tsingc.com/cms/detail/privatepolicy',
        // fee: 'https://h5.qn.woody.tsingc.com/lite/%E6%94%B6%E8%B4%B9%E8%A7%84%E5%88%99v5.html',
        // usage: 'https://h5.qn.woody.tsingc.com/lite/usage_v6.html?v=2',
        // mpsubscribe: `https://mp.weixin.qq.com/s/DFeJn5sFdBXa4HWhWAilQA`
    },
    share: {
        title: '书非借不能读，最新的文艺小说悬疑科幻，随心借阅，极速发货。看书不囤书，阅读不插电。',
        image: 'https://img.qn.woody.tsingc.com/img_v2_5e4a7426-6fc9-47a6-97cb-9a96bf855beg'
    },
    appNotFindRules: {
        "ugc\\/my\\/comment$": "/pages/ugc/pages/my/list?type=0",
        "ugc\\/my\\/list$": "/pages/ugc/pages/my/list?type=0",
        "ugc\\/create\\/comment$": () => {
            if (getApp().systemInfo.isIos) {
                return `/pages/ugc/pages/create/comment`
            }
            return `pages/ugc/pages/create/commentAndroid`
        },
        "pages\\/user\\/pages\\/book\\/notice$": (e:any) => {
            return `/pages/tabBar/cart`
        }
    },
}
