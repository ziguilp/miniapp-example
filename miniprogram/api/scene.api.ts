import { appConfig } from "../config";
import { httpRequest } from "../utils/http";
import util from "../utils/util";

 
export default {
    /**
     * 获取场景码
     * @returns string | null
     */
    async getScene({
        name,
        path,
        etc = {}
    }:any) {
        const res = (await httpRequest({
            url: `/common/scene/create`,
            method: 'POST',
            data: {
                name,
                path,
                extra: etc || {}
            }
        })).data.data

        return res.id
    },
    /**
     * 单纯的生成小程序码
     * @param {*} uuid 
     */
    getAcodeUrlBase(uuid:string) {
        uuid = uuid.replace(/-/g, '');
        return `/common/wxacode?scene=${uuid}`
    },

    /**
     * 单纯的获取H5地址
     * @param {*} uuid
     */
    getQrcodeUrlBase(uuid:string) {
        uuid = uuid.replace(/-/g, '');
        return `${appConfig.cloudHost}/h5tomina/index.html?path=/pages/index/index?scene=${uuid}`
    },

    /**
     * 单纯的获取H5地址短链接
     * @param {*} uuid
     */
    async getQrcodeUrlBaseShort(uuid:string) {
        let url = this.getQrcodeUrlBase(uuid)
        return await this.generatorShortLink(url)
    },


    /**
     * 1.获取场景值以及小程序码地址
     *
     * @parma name, 场景名
     * @param channel_id, 值为1
     * @param etc 格式 {"type":"开一家书店","user_id":120889768,"nickname":"黄黄黄","redirect":{"path":"","type":"web"}} // type: web || page
     * @param expiredTime 缓存时间(s) null 不使用缓存
     * @param cacheIdx 缓存关键字，如果设置缓存，必须传值，否则不缓存
     * @returns '{ scene,  path, qrcodeUrl, acodeUrl }'
     */
    async getSceneContent({
        name,
        path = '',
        etc = {},
        expiredTime = 864000,
        cacheIdx = ''
    }:any) {
        const cacheKey = `scene_cache_${cacheIdx}`;
        let localCache = getApp().getEnvStorageSync(`scene_cache`) || {};
        if (expiredTime > 0 && cacheIdx) {
            if (localCache[cacheKey] && localCache[cacheKey].expiredTime > (new Date()).getTime()) {
                let res = {
                    scene: localCache[cacheKey],
                    path: `/pages/index/index?scene=${localCache[cacheKey]}`,
                    acodeUrl: this.getAcodeUrlBase(localCache[cacheKey]),
                    qrcodeUrl: await this.getQrcodeUrlBaseShort(localCache[cacheKey])
                }
                return res
            }
        }

        let uuid = await this.getScene({
            name,
            path,
            etc
        }).catch(console.error)
        if (uuid) {
            let res = {
                scene: uuid,
                path: `/pages/index/index?scene=${uuid}`,
                acodeUrl: this.getAcodeUrlBase(uuid),
                qrcodeUrl: await this.getQrcodeUrlBaseShort(uuid)
            }
            localCache[cacheKey] = uuid
            return res
        }
        throw new Error("获取场景码失败")
    },

    /**
     * 1.获取场景值以及小程序码地址
     *
     * name, 场景名
     * user_id, 用户id
     * channel_id, 值为1
     * etc 格式 {"type":"开一家书店","user_id":120889768,"nickname":"黄黄黄","redirect":{"path":"","type":"web"}} // type: web || page
     */
    async getQrcodeUrl({
        name,
        path = ``,
        etc = {}
    }:any) {
        let uuid = await this.getScene({
            name,
            path,
            etc
        }).catch(console.error)
        if (uuid) {
            return this.getAcodeUrlBase(uuid)
        }
        throw new Error("获取场景码失败")
    },
    /**
     * 场景码上报GRPHAQL
     */
    async reportScene({
        scene,
        options = {}
    }:any) {

        try {
            console.log(`场景上报`, {
                scene,
                options
            })
            const log = (await httpRequest({
                url: `/common/scene/log`,
                method: 'POST',
                data: {
                    scene_id: scene
                }
            })).data.data;
            console.log(`场景上报结果`, log)
            if (!log) {
                console.log(`场景上报失败正在重试`)
                setTimeout(() => {
                    this.reportScene({
                        scene,
                        options,
                    })
                }, 100);
            }
        } catch (error) {
            console.error(error)
            console.log(`场景上报错误正在重试`)
            setTimeout(() => {
                this.reportScene({
                    scene,
                    options,
                })
            }, 100);
        }

    },

    /**
     * 场景码上报http版
     * @param {*} param0 
     */
    async reportSceneByApi({
        scene,
        options = {}
    }:any) {
        // custom/share/scenelog
        let {
            openId
        } = await util.getUserOpenIdAndUnionId({
            force: true
        })

        return await httpRequest({
            url: '/custom/share/scenelog',
            method: 'POST',
            data: {
                uuid: scene,
                userId: await util.getUserIdForce(),
                openId: openId,
                options
            }
        })
    },

    /**
     * 获取场景码信息
     */
    async getSceneInfo({
        uuid
    }:any) {
        const scene = (await httpRequest({
            url: `/common/sceneinfo/${uuid}`
        })).data.data
        if (scene) {
            return {
                uuid: scene.id,
                userId: scene.user_id,
                name: scene.name,
                etc: {
                    ...scene.extra,
                    path: scene.path,
                    user_id: scene.user_id
                },
            }
        }
        return {
            uuid,
            userId: '',
            channelId: '',
            name: '',
            etc: '',
        }
    },
    /**
     * 生成短链接
     * @returns string
     */
    async generatorShortLink(url:string) {
        // return url
        const res = await httpRequest({
            url: `https://p.woodyclub.tsingc.com/api/v2/action/shorten?key=${appConfig.shortLinkApikey}&url=${url}&is_secret=false&response_type=json`,
        })

        return res.data.result
    }
}