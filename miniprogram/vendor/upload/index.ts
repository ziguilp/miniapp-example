/*
 * @Author        : turbo 664120459@qq.com
 * @Date          : 2022-11-22 15:03:03
 * @LastEditors   : turbo 664120459@qq.com
 * @LastEditTime  : 2023-03-25 15:31:40
 * @FilePath      : /miniprogram/miniprogram/vendor/upload/index.ts
 * @Description   : 
 * 
 * Copyright (c) 2023 by turbo 664120459@qq.com, All Rights Reserved. 
 */
import { QiniuUploader } from './qiniu';
import crypto from 'crypto-js';
import {
    Base64
} from 'js-base64';
import { TurboFn } from '../../../typings';
import dayjs from 'dayjs';
import { httpRequest } from '../../utils/http';

const qiniu = new QiniuUploader()


export interface UploadProcessRes {
    /**
     * 进度
     */
    progress: number;
    /**
     * 文件大小 单位 Bytes
     */
    totalSize: number;
    /**
     * 已上传大小 单位 Bytes
     */
    uploadedSize: number;
}

export default {
    /**
     * 获取七牛token
     * @returns string
     */
    async getQnToken() {
        return (await httpRequest({
            url: `/common/qiniu/uploadToken`
        })).data.data
    },
    async getAliToken() {
        return (await httpRequest({
            url: `/common/alioss/uploadToken`
        })).data.data
    },
    /**
     * 上传
     * @param {*} filePath 被上传的文件本地路径
     * @param {*} processCb 进度回调
     * @param {*} platform 上传通道 ali/qiniu
     * @returns string
     */
    async upload(filePath: string, processCb: (cb: UploadProcessRes) => any, platform: 'ali' | 'qiniu' = 'ali'): Promise<string> {
        if (platform != 'ali') return await this.uploadQn(filePath, processCb)

        const ali = await this.getAliFormData()

        const fileExt = filePath.replace(/.*?\.(.*?)$/, '$1')
        const date = dayjs().format('YYYYMMDDHHmmss');
        const key = `miniapp/${date}/${date}` + Math.ceil(Math.random() * 100000) + `.${fileExt}`;

        return new Promise((resolve, reject) => {
            const task = wx.uploadFile({
                url: ali.domain, // 开发者服务器的URL。
                filePath: filePath,
                name: 'file', // 必须填file。
                formData: {
                    key,
                    ...ali.formData
                },
                success: (res) => {
                    if (res.statusCode === 204) {
                        resolve(`${ali.domain}/${key}`)
                    } else {
                        reject(res)
                    }
                },
                fail: (err) => {
                    console.log(err);
                    reject(err)
                }
            });
            task.onProgressUpdate((e) => {
                processCb && processCb({
                    progress: e.progress,
                    totalSize: e.totalBytesExpectedToSend,
                    uploadedSize: e.totalBytesSent
                })
            })
        })
    },
    /**
     * 上传
     * @param {string}} filePath 
     */
    async uploadQn(filePath: string, processCb?: TurboFn): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const fileExt = filePath.replace(/.*?\.(.*?)$/, '$1')
            const fileNameForQn = `xiqueqcrm-miniapp` + dayjs().format('YYYYMMDDHHmmss') + Math.ceil(Math.random() * 100000) + `.${fileExt}`;

            const {
                token,
                domain
            } = await this.getQnToken();

            qiniu.upload(filePath, (res) => {
                console.log('upload success: ', res)
                resolve(res.imageURL.replace(/^(https?\:\/\/https?\:\/\/)/, 'https://'))
            }, (error) => {
                console.error('upload error: ', error);
                reject(error)
            }, {
                key: fileNameForQn,
                qiniuImageURLPrefix: domain,
                qiniuUploadToken: token,
                qiniuRegion: 'SCN' as any
            },
                (progress) => {
                    console.log("上传进度", progress)
                    if (processCb && typeof processCb == 'function') processCb(progress)
                }, () => { }, () => { }, () => { }, false)
        })
    },
    async getAliFormData() {
        const date = new Date();
        date.setHours(date.getHours() + 1);
        const policyText = {
            expiration: date.toISOString(), // 设置policy过期时间。
            conditions: [
                // 限制上传大小。
                ["content-length-range", 0, 1024 * 1024 * 1024],
            ],
        };
        const {
            bucket,
            region,
            domain,
            AccessKeyId,
            AccessKeySecret,
            SecurityToken
        } = await this.getAliToken()

        const policy = Base64.encode(JSON.stringify(policyText)) // policy必须为base64的string。
        const signature = crypto.enc.Base64.stringify(crypto.HmacSHA1(policy, AccessKeySecret))
        const formData = {
            OSSAccessKeyId: AccessKeyId,
            signature,
            policy,
            'x-oss-security-token': SecurityToken
        }
        return {
            formData,
            bucket,
            region,
            domain,
            AccessKeyId,
            AccessKeySecret,
            SecurityToken,
            expires: date.getTime()
        }
    },
    /**
     * 阿里云私有bucket的STS授权访问
     * https://help.aliyun.com/document_detail/100670.htm?spm=a2c4g.11186623.0.0.5555180fCZKybI#concept-xqh-2df-xdb
     * @param url 
     * @param ossProcess 
     */
    async buildAliPrivateImageUrl(url: string, ossProcess?: string) {
        url = (url || '').replace(/(\https?\:\/\/[^\/^\?]+)\/([^\?]+).*?$/, '$2');
        if (url.startsWith("/")) url = url.substring(1);

        const app: any = getApp();
        let aliOssAccess = app.globalData.aliOssAccess || null;
        if (!aliOssAccess || aliOssAccess.expires < (new Date()).getTime() - 120000) {
            aliOssAccess = await this.getAliFormData()
            app.globalData.aliOssAccess = aliOssAccess
        }

        let signStr = `${url}?security-token=${(aliOssAccess.SecurityToken)}`
        url += `?security-token=${encodeURIComponent(aliOssAccess.SecurityToken)}`
        if (ossProcess) {
            url += `&x-oss-process=${ossProcess}`
            signStr += `&x-oss-process=${ossProcess}`
        }

        // 构建签名
        const expires = parseInt((((new Date()).getTime()) / 1000) as any) + 300;
        const canonicalString = 'GET\n' + '\n' + '\n' + expires + '\n' + `/${aliOssAccess.bucket}/${signStr}`;

        const signature = crypto.enc.Base64.stringify(crypto.HmacSHA1(canonicalString, aliOssAccess.AccessKeySecret))

        return `https://${aliOssAccess.domain.replace(/^(https?\:\/\/)/, '')}/${url}&OSSAccessKeyId=${aliOssAccess.AccessKeyId}&Expires=${expires}&Signature=${encodeURIComponent(signature)}`
    }
}