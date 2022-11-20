// index.ts
import util, { openPage, TurboModal } from "../../utils/util"
import { IAppOption } from "../../../typings"
import { httpRequest } from "../../utils/http"

// 获取应用实例
const app = getApp<IAppOption>()

Page({
    data: {
        homeStyle: '',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        canIUseGetUserProfile: false,
        canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
    },
    // 事件处理函数
    bindViewTap() {
        util.openPage(`/pages/logs/logs`)
    },
    async confirm() {
        const cfm = await TurboModal({
            title: "提示",
            content: '确认删除吗？',
            showCancel: true,
            cancelText: "取消",
        })

        if (cfm) {
            wx.showToast({
                title: "删除成功",
                icon: 'none'
            })
        }

    },
    async testReq() {
        const res = await httpRequest({
            url: `http://ip.json-json.com/`
        });
        console.log(`请求结果`, res)
        wx.showToast({
            title: `请求结果:${res.data}`,
            icon: 'none'
        })
    },
    toCustom() {
        openPage('/pages/index/nav')
    },
    onLoad() {
        app.store.mapState(['userInfo'], this)

        // 使用EventBus监听事件
        app.eventBus.on(`setHomeColor`, (c: any) => {
            console.log(`设置首页样式`, c)
            this.setData({
                homeStyle: c
            })
        })

        if (typeof wx.getUserProfile == 'function') {
            this.setData({
                canIUseGetUserProfile: true
            })
        }
    },
    onUnload() {
        app.store.unInstall(this)
    },
    getUserProfile() {
        // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        wx.getUserProfile({
            desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                console.log(res)
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        })
    },
    getUserInfo(e: any) {
        // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
        console.log(e)
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    }
})
