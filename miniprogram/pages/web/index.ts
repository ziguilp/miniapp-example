// pages/web/index.ts
const noShareUrl:string[] = [];
Page({

    /**
     * 页面的初始数据
     */
    data: {
        originUrl: undefined,
        url: '',
        title: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options: any) {
        this.setData({
            originUrl: options.url,
            url: decodeURIComponent(options?.url || '')
        })
    },
    onShareAppMessage() {
        return {
            title: "阅读不插电，借书不囤书·阅借会员",
            path: `/pages/web/index?url=${this.data.originUrl}`
        }
    },
    loadDone(e:any) {
        console.log('loadDone', e)
        if (noShareUrl.indexOf(this.data.url) > -1) {
            wx.hideShareMenu({
                success: () => { },
            })
            return false;
        }
        this.getWebTitle()
    },
    async getWebTitle() {
        return new Promise((resolve, reject) => {
            if (this.data.title) {
                return Promise.resolve(this.data.title)
            }
            wx.request({
                url: this.data.url,
                success: (res) => {
                    let title = ""
                    try {
                        let webcontent  = res.data as string
                        let ogT = webcontent.match(/property\=\"og\:title\"\scontent\=\"([^\"].*?)\"/);
                        if (ogT && ogT.length > 1) {
                            title = ogT[1]
                        } else {
                            let toT = webcontent.match(/property\=\"twitter\:title\"\scontent\=\"([^\"].*?)\"/);
                            if (toT && toT.length > 1) {
                                title = toT[1]
                            }
                        }
                    } catch (error) {

                    }
                    this.setData({ title })
                    this.onShareAppMessage = () => {
                        return {
                            title,
                            path: `/pages/web/index?url=${this.data.originUrl}`
                        }
                    }
                    resolve(title)
                },
                fail: (e) => {
                    reject(e)
                }
            })
        })
    }
})