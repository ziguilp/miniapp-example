import { appConfig } from "../config";
import { httpRequest } from "../utils/http";
import util from "../utils/util";
import sceneApi from "./scene.api";


export default {
    /**
     * CMS配置
     */
    async getCmsInfo({
        pageId = '',
        position = ''
    } = {}) {
        const list = (await httpRequest({
            url: `/cms/contentlist`,
            data: {
                pagePath: pageId,
                position
            }
        })).data.data;
        return list.reduce((p: any, c: any) => {
            const key = `${c.page_path}_${c.position}`
            if (p[key]) {
                p[key].push(c)
            }
            else {
                p[key] = [c]
            }
            return p
        }, {})
    },
    /**
     * 直接生成海报
     * @param templateId
     * @param data
     * @param expiredTime 缓存时间(s) null 不使用缓存
     * @param cacheIdx 缓存关键字，如果设置缓存，必须传值，否则不缓存
     * @returns localPath
     */
    async generatePoster({
        templateId,
        data,
        expiredTime = 86400,
        cacheIdx = ''
    }: any) {
        //随机定义路径名称
        const times = new Date().getTime();
        const fileName = `${wx.env.USER_DATA_PATH}/template_poster_tid_${templateId}_${times}.png`;
        const cacheKey = `${wx.env.USER_DATA_PATH}/template_poster_tid_${templateId}_${cacheIdx}`;
        const fs = wx.getFileSystemManager();
        const localCache = getApp().getEnvStorageSync(`template_post_cache`) || {};
        if (expiredTime > 0 && cacheIdx) {
            if (localCache.hasOwnProperty(cacheKey) && localCache[cacheKey].localPath && localCache[cacheKey].expiredTime > times) {
                try {
                    let exist = fs.accessSync(localCache[cacheKey].localPath)
                    console.log("缓存是否存在", exist)
                    return localCache[cacheKey].localPath
                } catch (e) {
                    console.error(e)
                }
            }
        }

        let res = await httpRequest({
            url: `${appConfig.posterHost}/poster/generator`,
            method: 'POST',
            data: {
                templateId,
                params: data
            }
        });

        console.log("posterReqres", res)
        if (res.data.base64) {
            try {
                //将base64图片写入
                fs.writeFileSync(fileName, res.data.base64, 'base64')
            } catch (error) {
                console.error(error)
                wx.showToast({
                    title: '海报数据保存失败',
                    icon: 'none'
                })
                return false
            }
            if (expiredTime > 0) {
                //使用缓存
                localCache[cacheKey] = {
                    expiredTime: (new Date()).getTime() + expiredTime,
                    localPath: fileName
                }
                getApp().setEnvStorageSync(`template_post_cache`, localCache)
            }
            return fileName
        }
        wx.showToast({
            title: '海报生成失败',
            icon: 'none'
        })
        return false
    },

    /**
     * 根据模板ID获取海报/可携带二维码
     * @param templateId
     * @param {Object} data
     * @param {Object} acodeData 传值则使用小程序码，参数同获取场景码参数
     * @param expiredTime 缓存时间(s) null 不使用缓存
     * @param cacheIdx 缓存关键字，如果设置缓存，必须传值，否则不缓存
     * @returns tempPath 海报保存的本地路径
     */
    async getPosterByTemplateId({
        templateId,
        data,
        acodeData,
        expiredTime = 86400,
        cacheIdx
    }: any) {
        let qrcodeUrl = null;
        if (acodeData) {
            let sceneQrcodeData = await sceneApi.getSceneContent({
                ...acodeData,
                expiredTime,
                cacheIdx
            })
            if (sceneQrcodeData) {
                qrcodeUrl = sceneQrcodeData.qrcodeUrl
            }
        }

        return await this.generatePoster({
            templateId,
            data: {
                userInfo: await util.getUserInfoForce(),
                data,
                qrcode: qrcodeUrl
            },
            expiredTime,
            cacheIdx
        }).catch(console.error)
    }
}