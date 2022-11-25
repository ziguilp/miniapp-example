# 以 typescript + sass 为 基础的小程序开发基础框架


### -使用了npm包
```
1 终端执行 `yarn` 安装依赖 
2 微信小程序开发工具 -> 工具 -> 构建npm
```

### -使用的 UI 组件为 vant
[点击这里查看vant文档]( https://vant-contrib.gitee.io/vant-weapp/)

### -预置了一些基本的UI规范
* 预置一些颜色和基本布局UI，详见文件夹 miniprogram/style
```html
    <!-- 示例 -->
    <view class="pannel-body">
        <view class="u-p-l-20 u-p-t-10"></view>
        <button class="btn"></button>
    </view>
```

---

## 其他已具备的特性

-  ### 拓展了Number原型，可直接进行高精度计算

    ```javascript 

    // --加法
    console.log(Number(1.2).add(1.4)) // 2.6

    // --乘法
    console.log(Number(1.2).mul(1.4)) //1.68

    // --减法
    console.log(Number(1.7).sub(1.1)) //0.6

    // --除法
    console.log(Number(1.7).div(1.1)) //1.545454545454...
    ```

- ### 网络请求已使用flyio封装
    ```javascript 
    // #文件：uitls/http
    // #示例

    import { httpRequest } from "../utils/http"; 
    const res = await httpRequest({
        url: `http://ip.json-json.com/`
    });
    console.log(`请求结果`, res)
    ```

- ### 常用工具函数已封装，详情可进入查看具体方法
    ```
    #文件：uitls/util
    ```


- ### 封装实现了简易store[APP实例中已经挂载]
    ```javascript 
    // #文件：uitls/store
    // 使用示例

    /**
     * 页面或者组件加载时
     */
    onLoad(){
        app.store.mapState(['userInfo'], this)
    },
    /**
     * 页面或者组件卸载时
     */
    onUnload(){
        app.store.unInstall(this)
    },
    ```


- ### 封装实现了eventBus，帮助跨页面方法调用[APP实例中已经挂载]
    ```javascript 
    // #文件：uitls/eventbus
    //  使用示例
    /**
     * 合适的契机监听事件
     */
    onLoad(){
    // 使用EventBus监听事件
        app.eventBus.on(`setHomeColor`, (c: any) => {
            console.log(`设置首页样式`, c)
        })
    },
    /**
     * 合适的契机触发事件
     */
    app.eventBus.emit(`setHomeColor`, 'background: red;')

    ```

- ### 支持阿里云OSS和七牛云直传

    ```javascript
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
            
            if(res.tempFiles.length == 1){
                const image = await uploader.upload(res.tempFiles[0].tempFilePath, (process) => {
                    console.log(`上传进度`, process)
                }, 'qiniu').catch(console.error)
                console.log(`上传结果`, image)
            }
        }
    })._throttle(),
    ```

- ### 内置了FormUtil通用[可以辅助构造表单页面]
    ```typescript
    // pages/index.ts

    // 内置了字段赋值，上传、扫码等
    import formUtil from "../../utils/formUtil" 

    // 获取应用实例
    const app = getApp<IAppOption>()

    Page({
        ...formUtil,
        data: {
            form: {
                name: '',
                image: '',
                intro: '',
                province: '',
                city: '',
                area: '',
                qualifications: [],
            },
            canSave: false,
            ec2:  {
                InstanceId: '',
            } as Ec2BaseInfo
        },
        /**
         * 校验数据格式
        */
        checkCanISave() {
            const { form } = this.data;
            if (/^[a-z0-9|\-]{10,32}$/i.test(form.name)) {
                this.setData({
                    canSave: true
                })
                return true
            }
            
            this.setData({
                canSave: false
            })
            return '请输入实例ID'
        },
    })
    ```

    ```html
    <!-- pages/index.wxml -->
       <view class="container u-flex-col u-p-t-40">
        <text class="text-xlarge color-gray">基本信息</text>
        <view class="pannel-block  u-p-t-0 u-p-b-0">
            <view class="profile-cell u-flex u-row-between u-col-center">
                <text class="text-nm color-gray">名称</text>
                <view class="u-flex u-col-center">
                    <input data-field="name" value="{{form.name}}" bindinput="onInput"></input>
                    <icon class="icon iconfont icon-you color-gray u-m-l-25"></icon>
                </view>
            </view>
            <view class="profile-cell u-flex u-row-between u-col-center" bindtap="chooseImage" data-field="image">
                <text class="text-nm color-gray">头像</text>
                <view class="u-flex u-col-center" >
                    <image class="avatar circle" src="{{form.image}}"></image>
                </view>
            </view>
            <view class="profile-cell u-flex u-row-between u-col-center">
                <text class="text-nm color-gray">简介</text>
                <view class="u-flex u-col-center">
                    <textarea data-field="intro" value="{{form.intro}}" bindinput="onInput" auto-height></textarea>
                    <icon class="icon iconfont icon-you color-gray u-m-l-25"></icon>
                </view>
            </view>
            <view class="profile-cell u-flex u-row-between u-col-center">
                <text class="text-nm color-gray">所在地</text>
                <picker mode="region" level="city" bindchange="onInput" data-field="location">
                    <view class="u-flex u-col-center">
                        <text>{{form.province}}{{form.city}}{{form.area}}</text>
                        <icon class="icon iconfont icon-you color-gray u-m-l-25"></icon>
                    </view>
                </picker>
            </view> 


            <view class="profile-cell u-flex u-row-between u-col-center">
                <text class="text-nm color-gray">联系电话</text>
                <view class="u-flex u-col-center">
                    <input data-field="mobile" value="{{form.mobile}}" bindinput="onInput"></input>
                    <icon class="icon iconfont icon-you color-gray u-m-l-25"></icon>
                </view>
            </view>

            <view class="profile-cell u-flex u-row-between u-col-center" bindtap="chooseImage" data-field="qualifications" data-water="water_check" data-count="9">
                <text class="text-nm color-gray">营业执照&资质</text>
                <view class="u-flex u-col-center">
                    <image class="avatar" wx:if="{{!form.qualifications || form.qualifications.length == 0}}"></image>
                    <image class="avatar" wx:for="{{form.qualifications}}" wx:key="qualifications" catchtap="privewImage" src="{{item}}" data-imgs="{{form.qualifications}}" data-url="{{item}}" bindlongtap="delImage" data-field="qualifications" data-index="{{index}}" ></image>
                </view>
            </view>
        </view>
        
        <button wx:if="{{cansave}}" bindtap="submit" class="btn u-m-t-40 save-profile">提交</button>
        <button wx:else class="btn u-m-t-40 save-profile disabled" bindtap="submit">提交</button>
    </view>
    ```

- ### 支持埋点[可通过配置上报we分析]
    - Page生命周期函数已经自动埋点
    - Page其他函数埋点方法名需为xx__track格式
    - 其他需上报数据调用格式可使用app上挂载的方法 `app.$teaReport(eventName,data)`
    - 数据实现了埋点，但是未进行上报，如需上报服务器请完善`miniprogram/vendor/track/report.ts`中 `reportToServer(eventName,data)`方法
    - 由于we分析新配置才能上报，上报配置在`miniprogram/vendor/track/config.ts`（由于上报会把事件名称驼峰转为下划线且大写转为小写，配置需注意）
    - 上报的数据会经过处理，会自动添加如下数据，不需要在上报前添加
        ```javascript 
        {
            appId: "wx77cdf481c1a6deb5",//小程序的appid
            date: "2022-11-22T11:58:29+08:00", //事件上报时间
            route: "pages/index/index",//事件发生所在页面路由
        }
        ```

        #### -示例 
        ```javascript 
        // 1、Page中xx__track格式方法名
        async clickClose__track(){
            
        }

        // 2、普通任意方法
        async clickCoupon(){
            app.$teaReport('click_coupon', {
                type: ’领取双十一优惠券‘,
                data: {
                    id: 1,
                }
            })
        }
        ```

- ### 已经开启eslint
    - 默认开启eslint校验
    - 每次编译前均检测是否有错误，如果有错误无法完成编译
    - 如有错误，请根据控制台错误信息改正
    - 如需关闭eslint校验，在项目设置中关闭自定义预处理
