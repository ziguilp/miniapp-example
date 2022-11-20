// components/tab/bar.ts 
Component({
    lifetimes: {
        attached: function () {
            // 在组件实例进入页面节点树时执行
            this.init()
        },
        detached: function () {
            // 在组件实例被从页面节点树移除时执行
        },
    },
    // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
    attached: function () {
        // 在组件实例进入页面节点树时执行
        this.init()
    },
    detached: function () {
        // 在组件实例被从页面节点树移除时执行
    },
    /**
     * 组件的属性列表
     */
    properties: {
        rootStyle: {
            type: String,
            value: 'background:#FFF;'
        },
        /**
         * 标题
         */
        title: {
            type: String,
            value: ''
        },
        /**
         * 标题颜色
         */
        titleColor: {
            type: String,
            value: '#333'
        },
        /**
         * 标题位置 center left
         */
        titleAlign: {
            type: String,
            value: 'center'
        },
        /**
         * 是否拦截返回按钮事件
         * 如果拦截，请监听 navback 事件
         */
        captureNavBack: {
            type: Boolean,
            value: false
        },
        /**
         * 是否展示slot
         */
        slotType: {
            type: String,
            value: ''
        },
        /**
         * 开启透明渐变
         * 开启后自定义样式失效
         */
        transparentStop: {
            type: Number,
            value: 0
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        capsule: wx.getMenuButtonBoundingClientRect(),
    },

    /**
     * 组件的方法列表
     */
    methods: {
        init() {
            let { capsule }: any = this.data
            this.data.capsule = {
                ...capsule,
                titleWidth: capsule.left - capsule.height - 20,
                barHeight: capsule.bottom + 10,
            }
            this.setData({ capsule: this.data.capsule })
            let currentPage: any = this.selectOwnerComponent()
            if (!currentPage || !currentPage.route) {
                let pages = getCurrentPages()
                if (pages.length > 0 && pages[pages.length - 1]) {
                    currentPage = pages[pages.length - 1]
                }
            }
            currentPage.setData({
                capsule: this.data.capsule
            })
            if (this.data.transparentStop > 0) {
                const sc = currentPage.onPageScroll
                currentPage.onPageScroll = (e:any) => {
                    let { scrollTop } = e
                    this.setData({
                        customNavOpacity: scrollTop < 50 ? 0 : (scrollTop * 2 / this.data.transparentStop - 0.5)
                    })
                    sc && typeof sc === 'function' && sc(e)
                }
            }

        },
        /**
         * 点击返回
         */
        navBack(e: any) {
            if (this.data.captureNavBack === true) {
                return this.triggerEvent('navback', e)
            }
            this.ownNavBack(e)
        },
        ownNavBack(e = {}) {
            if (getCurrentPages().length > 1) {
                this.triggerEvent('navbacked', e)
                return wx.navigateBack({
                    delta: 0
                })
            } else {
                this.triggerEvent('navbacked', e)
                return wx.switchTab({
                    url: `/pages/index/index`,
                })
            }
        },
        clickSlot(e: any) {
            this.triggerEvent('clickSlot', e)
        }
    }
})
