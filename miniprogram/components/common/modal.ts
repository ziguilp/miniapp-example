import { IAppOption } from "typings"

// components/common/modal.ts
const app = getApp<IAppOption>()
Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    /**
     * 组件的属性列表
     */
    properties: {
        customId: {
            type: String
        },
        show: {
            type: Boolean,
            value: false,
            observer(data, old) {
                this.setData({
                    showPopup: data
                })
            }
        },
        label: {
            type: String,
            value: ''
        },
        title: {
            type: String,
            value: '提示'
        },
        icon: {
            type: String,
            value: ''
        },
        titleSub: {
            type: String,
            value: '',
            observer(data, old) {
                this.setData({
                    titleSubStr: data.replace(/\s/g, '')
                })
            }
        },
        useTitleSubSlot: {
            type: Boolean,
            value: false
        },
        content: {
            type: String,
            value: ''
        },
        showBgImg: {
            type: Boolean,
            value: true
        },
        showClose: {
            type: Boolean,
            value: true
        },
        confirmText: {
            type: String,
            value: '确定'
        },
        cancelText: {
            type: String,
            value: '取消'
        },
        customStyle: {
            type: String,
            value: ''
        },
        overlayStyle: {
            type: String,
            value: ''
        },
        modalStyle: {
            type: String,
            value: ''
        },
        contentStyle: {
            type: String,
            value: ''
        },
        btnWrapperStyle: {
            type: String,
            value: 'u-flex-col '
        },
        confirmBtnStyle: {
            type: String,
            value: ''
        },
        cancelBtnStyle: {
            type: String,
            value: ''
        },
        cancelOpenType: {
            type: String,
            value: ''
        },
        confirmOpenType: {
            type: String,
            value: ''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        showPopup: false
    },

    /**
     * 组件的方法列表
     */
    methods: {
        confirm(e: any) {
            app.$teaReport('modal_confirm', this.data)
            this.triggerEvent('confirm', e)
        },
        cancel(e: any) {
            app.$teaReport('modal_cancel', this.data)
            this.triggerEvent('cancel', e)
        },
        show(e:any){
            this.setData({
                showPopup: true
            })
            app.$teaReport('modal_show', this.data)
            this.triggerEvent('show', e)
        },
        close(e: any) {
            this.setData({
                showPopup: false
            })
            app.$teaReport('modal_close', this.data)
            this.triggerEvent('close', e)
        },
        clickbody(e: any) {
            app.$teaReport('modal_clickbody', this.data)
            this.triggerEvent('clickbody', e)
        },
        /**
         * 读取弹窗区域
         * @param {*} e 
         */
        async getQuery(selector: any) {
            if (!selector && this.data.customId) {
                selector = `#${this.data.customId}`;
            }
            return new Promise((resolve, reject) => {
                const query = this.createSelectorQuery()
                query.select(selector).boundingClientRect();
                query.selectViewport().scrollOffset();
                query.exec(function (res) {
                    // console.log(`modal2109`, res[0])
                    resolve({
                        query,
                        bounding: res
                    })
                })
            })
        },
    }
})
