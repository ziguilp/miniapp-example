import upload from "../vendor/upload/index";
import util from "./util";

export default {
    onInput(e: any) {
        let {
            detail: {
                value
            },
            currentTarget: {
                dataset: {
                    field
                }
            }
        } = e;
        
        // @ts-ignore
        if (typeof this.inputValueDeal === 'function') {
            // @ts-ignore
            value = this.inputValueDeal(field, value)
        }

        // @ts-ignore
        this.setData({
            [`form.${field}`]: value,
        })
        // @ts-ignore
        if (typeof this.checkCanISave === 'function') this.checkCanISave()
    },
    /**
     * 扫码
     * @param e 
     */
    scan(e: any) {
        let {
            currentTarget: {
                dataset: {
                    field,
                }
            }
        } = e;
        wx.scanCode({
            onlyFromCamera: false,
            success: (res) => {
                console.log(res)
                let value = res.result

                // @ts-ignore
                if (typeof this.inputValueDeal === 'function') {
                    // @ts-ignore
                    value = this.inputValueDeal(field, value)
                }

                // @ts-ignore
                this.setData({
                    [`form.${field}`]: value,
                })

                // @ts-ignore
                if (typeof this.checkCanISave === 'function') this.checkCanISave()
            },
            fail: (err) => {
                return wx.showToast({
                    title: `扫码失败:${err.errMsg}`,
                })
            }
        })
    },
    async chooseImage(e:any) {
        let {
            currentTarget: {
                dataset: {
                    field,
                    count = 1,
                    water = ''
                }
            }
        } = e
        wx.chooseMedia({
            count: parseInt(count),
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: async (res) => {
                const {
                    tempFiles
                } = res
                if (tempFiles.length > 0) {
                    const url = (await upload.upload(tempFiles[0].tempFilePath, (e) => {
                        console.log(`上传进度`, e)
                    })) + (water ? `?x-oss-process=style/${water}` : '')
                    console.log(`上传结果`, url)

                    // @ts-ignore
                    this.setData({
                        // @ts-ignore
                        [`form.${field}`]: count == 1 ? url : (this.data.form[field] || []).concat(url),
                    })
                    // @ts-ignore
                    if (typeof this.checkCanISave === 'function') this.checkCanISave()
                }
            }
        })
    },
    privewImage(e:any) {
        const {
            imgs,
            url
        } = e.currentTarget.dataset;
        wx.previewImage({
            urls: imgs,
            current: url
        })
    },
    async delImage(e:any) {
        const cfm = await util.TurboModal({
            content: `删除当前图片吗`,
        })
        if (!cfm) return;

        const {
            imgs,
            url,
            field
        } = e.currentTarget.dataset;
        // @ts-ignore
        this.setData({
            // @ts-ignore
            [`form.${field}`]: imgs.filter((e) => e != url)
        })
        // @ts-ignore
        if (typeof this.checkCanISave === 'function') this.checkCanISave()
    },
    showTip(e:any) {
        const {
            tip,
            icon = 'none',
        } = e.currentTarget.dataset;
        if (tip) {
            wx.showToast({
                title: tip,
                icon,
                duration: 3000
            })
        }
    },
    openPage(e:any) {
        const { url } = e.currentTarget.dataset;
        util.openPage(url)
    },
    copyText(e:any) {
        const { text } = e.currentTarget.dataset;
        wx.setClipboardData({
            data: text,
        })
    },
    callPhone(e:any) {
        const { mobile } = e.currentTarget.dataset;
        wx.makePhoneCall({
            phoneNumber: mobile,
        })
    }
}