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
                resolve(res.imageURL.replace(/^(https?\:\/\/https?\:\/\/)/,'https://'))
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
        }
    }
}