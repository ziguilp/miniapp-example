// index.ts
import util, { openPage, TurboModal } from "../../utils/util"
import { IAppOption } from "../../../typings"
import { httpRequest } from "../../utils/http"
import { DebounceThrottle } from "../../utils/debounce-throttle"
import uploader from "../../vendor/upload/index"

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
    async testReq__track(e: any) {
        console.log('发起请求', e)
        const res = await httpRequest({
            url: `http://ip.json-json.com/`,
            options: {
                showLoading: true
            }
        });
        console.log(`请求结果`, res)
        wx.showToast({
            title: `请求结果:${res.data}`,
            icon: 'none'
        })
    },
    /**
     * 防抖
     */
    debounce: new DebounceThrottle({
        fn: function (e: any) {
            console.log('防抖', e, this)
        }
    })._debounce(),
    /**
     * 节流
     */
    throttle: new DebounceThrottle({
        fn: function (e: any) {
            console.log(`节流`, e)
        }
    })._throttle(),
    /**
     * 上传
     */
    upload: new DebounceThrottle({
        fn: async function(){
            const res  = await wx.chooseMedia({
                count: 1,
                mediaType: ['image','video'],
                sourceType: ['album', 'camera'],
                maxDuration: 30,
                camera: 'back',
            })
            // console.log(res)
            if(res.tempFiles.length == 1){
                const image = await uploader.upload(res.tempFiles[0].tempFilePath, (process) => {
                    console.log(`上传进度`, process)
                }, 'qiniu').catch(console.error)
                console.log(`上传结果`, image)
            }
        }
    })._throttle(),
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
