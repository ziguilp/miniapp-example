import { TurboFn } from "../../../typings";

export enum QiniuRegionList {
    'ECN' = 'ECN',
    'SCN' = 'SCN',
    'NCN' = 'NCN',
    'NA' = 'NA',
    'ASG' = 'ASG'
}

export interface QiniuConfig {
    qiniuRegion?: QiniuRegionList,
    qiniuImageURLPrefix?: string,
    qiniuUploadToken?: string,
    qiniuUploadTokenURL?: string,
    qiniuUploadTokenFunction?: TurboFn | null,
    qiniuShouldUseQiniuFileName?: boolean
}

export interface QiniuConfigParam extends QiniuConfig {
    key?: string
}

/**
 * 七牛云上传
 */
export class QiniuUploader {

    private config: QiniuConfig = {
        qiniuRegion: QiniuRegionList.ECN,
        qiniuImageURLPrefix: '',
        qiniuUploadToken: '',
        qiniuUploadTokenURL: '',
        qiniuUploadTokenFunction: null,
        qiniuShouldUseQiniuFileName: false
    }

    /**
     * 初始化
     * @param options 
     */
    init(options: QiniuConfig = {}) {
        this.updateConfigWithOptions(options || {});
    }

    /**
     * 根据传入的参数，重新给config对象赋值
     */
    updateConfigWithOptions(options: QiniuConfig) {
        this.config = Object.assign(this.config, options || {})
        if (!this.config.qiniuRegion || !this.config.qiniuUploadToken) {
            throw new Error(`参数错误`)
        }
    }

    /**
     * 开始上传文件以及上传前的一些参数校验
    */
    upload(filePath: string, success: TurboFn, fail: TurboFn, options: QiniuConfigParam, progress: TurboFn, cancelTask: TurboFn, before: TurboFn, complete: TurboFn, showLoading = true) {
        if (!filePath) {
            console.error('qiniu uploader need filePath to upload');
            return;
        }

        if (options) {
            this.updateConfigWithOptions(options);
        }

        if (!this.config.qiniuUploadToken) {
            console.error('qiniu uploader need one of [uptoken, uptokenURL, uptokenFunc]');
            return;
        }

        const url = this.uploadURLFromRegionCode(this.config.qiniuRegion);

        let fileName = filePath.split('//')[1];

        if (options && options.key) {
            fileName = options.key;
        }

        let formData: Record<string, any> = {
            'token': this.config.qiniuUploadToken
        };

        if (!this.config.qiniuShouldUseQiniuFileName) {
            formData['key'] = fileName
        }

        before && before();

        const uploadTask = wx.uploadFile({
            url: url, // https://up-z2.qiniup.com
            filePath: filePath,
            name: 'file',
            formData: formData,
            success: (res) => {
                const dataString = res.data
                //   // this if case is a compatibility with wechat server returned a charcode, but was fixed
                //   if(res.data.hasOwnProperty('type') && res.data.type === 'Buffer'){
                //     dataString = String.fromCharCode.apply(null, res.data.data)
                //   }
                try {
                    const dataObject = JSON.parse(dataString);
                    //do something
                    const fileUrl = (this.config.qiniuImageURLPrefix + '/' + dataObject.key).replace(/([^https?\:\/])(\/\/)/g,'$1/');
                    dataObject.fileUrl = fileUrl
                    dataObject.imageURL = fileUrl;
                    if (success) {
                        success(dataObject);
                    }
                } catch (e) {
                    console.log('parse JSON failed, origin String is: ' + dataString)
                    if (fail) {
                        fail(e);
                    }
                }
            },
            fail: function (error) {
                console.error(error);
                if (fail) {
                    fail(error);
                }
            },
            complete: function (err) {
                complete && complete(err);
            }
        })

        uploadTask.onProgressUpdate((res) => {
            //console.log('uploadTask onProgressUpdate', res);
            if (res.progress !== 100 && showLoading !== false) {
                wx.showToast({ title: `上传中...`, icon: 'loading' })
            } else {
                wx.hideToast();
            }
            progress && progress({
                progress: res.progress,
                totalSize: res.totalBytesExpectedToSend,
                uploadedSize: res.totalBytesSent
            })
        })

        cancelTask && cancelTask(() => {
            uploadTask.abort()
        })
    }

    uploadURLFromRegionCode(code = 'ECN') {
        let uploadURL = 'https://up.qiniup.com';
        switch (code) {
            case 'ECN': uploadURL = 'https://up.qiniup.com'; break;
            case 'NCN': uploadURL = 'https://up-z1.qiniup.com'; break;
            case 'SCN': uploadURL = 'https://up-z2.qiniup.com'; break;
            case 'NA': uploadURL = 'https://up-na0.qiniup.com'; break;
            case 'ASG': uploadURL = 'https://up-as0.qiniup.com'; break;
        }
        return uploadURL;
    }
}
