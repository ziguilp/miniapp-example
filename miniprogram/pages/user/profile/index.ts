import userApi from "../../../api/user.api"
import { IAppOption, IUserInfo } from "typings"
import util from "../../../utils/util"

const app = getApp<IAppOption>()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {
            userId: 1,
            nickname: "王大锤"
        } as any
    } as {
        userInfo: IUserInfo
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad (options:Record<string, string | undefined>) {
        // app.store.mapState(['userInfo','cmsInfo'], this)
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow () {
        app.store.dispatch("getUserInfo")
        app.store.dispatch("getCmsInfo")
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide () {

    },

    /**
     * 登录
     */
    async login__track(e:any) {
        console.log("登录")
        // if(!this.data.userInfo || !this.data.userInfo.nickname || !this.data.userInfo.avatar){
        const wxInfo = await userApi.getWechatUserInfo()
        if (wxInfo) {
            this.data.userInfo = wxInfo.localUserInfo;
            this.setData({ userInfo: this.data.userInfo })
            const { pos } = e.currentTarget.dataset
            if (pos && pos == 'contact') {
                wx.showToast({
                    title: '请再次点击联系客服',
                    icon: 'none'
                })
            } else {
                return util.openPage(`/pages/user/pages/profile/index?userId=${this.data.userInfo.userId}`)
            }
        }
        // }

    },
    openPage__track(e:any) {
        let { url } = e.currentTarget.dataset
        util.openPage(url)
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload () {
        app.store.unInstall(this)
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom () {

    },
})