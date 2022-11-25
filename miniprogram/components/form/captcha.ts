// components/form/captcha.ts

import dayjs from "dayjs";
import { httpRequest } from "../../utils/http";

Component({
    /**
     * 定时器
     */
    // @ts-ignore
    timer: null,
    /**
     * 组件的属性列表
     */
    properties: {
        keyname: {
            type: String,
            value: "邮箱"
        },
        keytype: {
            type: String,
            value: 'email'
        },
        username: {
            type: String,
        },
        event: {
            type: String
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        sendTime: 0,
        cutdown: 0,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        async sendCode() {
            if (this.timer) return;
            if (!this.data.username) {
                return wx.showToast({
                    title: '请输入' + this.data.keyname,
                    icon: 'none'
                })
            }
            if (this.data.keytype == 'email') {
                if (!/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(this.data.username)) {
                    return wx.showToast({
                        title: '邮箱无效',
                        icon: 'none'
                    })
                }
            }
            if (this.data.keytype == 'mobile') {
                if (!/^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/.test(this.data.username)) {
                    return wx.showToast({
                        title: '手机号码无效',
                        icon: 'none'
                    })
                }
            }
            if (!this.data.event) {
                return wx.showToast({
                    title: '事件名称错误',
                    icon: 'none'
                })
            }
            const res = (await httpRequest({
                url: `/common/captcha/send`,
                method: 'POST',
                data: {
                    username: this.data.username,
                    event: this.data.event
                },
                options: {
                    withoutToken: true
                }
            }))

            if (res) {
                wx.showToast({
                    title: '发送成功',
                    icon: 'none'
                })
                // @ts-ignore
                this.setData({
                    sendTime: dayjs().unix()
                })
                this.setTimer()
            }
        },
        setTimer() {
            // @ts-ignore
            if (this.timer) clearInterval(this.timer)
            const { sendTime } = this.data;
            let cutdown = 60;
            // @ts-ignore
            this.timer = setInterval(() => {
                if (cutdown <= 0) {
                    // @ts-ignore
                    clearInterval(this.timer)
                    this.setData({ cutdown: 0 })
                } else {
                    // @ts-ignore
                    this.setData({ cutdown: parseInt(60 + sendTime - dayjs().unix()) })
                }
            }, 100)
        }
    }
})
