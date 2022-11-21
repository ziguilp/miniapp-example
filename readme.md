## 以 typescript + sass 为 基础的小程序开发基础框架

### 使用了npm包
```
1 终端执行 `yarn` 或者 `npm i` 安装依赖
2 微信小程序开发工具 -> 工具 -> 构建npm
```

## 特性
### 1、使用的 UI 组件为 vant
``` 
文档： https://vant-contrib.gitee.io/vant-weapp/
```

### 2、拓展了Number原型，可直接进行高精度计算
```

--加法
console.log(Number(1.2).add(1.4)) // 2.6

--乘法
console.log(Number(1.2).mul(1.4)) //1.68

--减法
console.log(Number(1.7).sub(1.1)) //0.6

--除法
console.log(Number(1.7).div(1.1)) //1.545454545454...
```

### 3、网络请求已使用flyio封装
```
#文件：uitls/http
#示例

import { httpRequest } from "../utils/http"; 
const res = await httpRequest({
    url: `http://ip.json-json.com/`
});
console.log(`请求结果`, res)
```

### 4、常用工具函数已封装，详情可进入查看具体方法
```
#文件：uitls/util
```


### 5、封装实现了简易store[APP实例中已经挂载]
```
#文件：uitls/store

 1.使用示例
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


### 6、封装实现了eventBus[APP实例中已经挂载]
```
#文件：uitls/eventbus
 
 1.使用示例
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


### 7、已经开启eslint
- 默认开启eslint校验
- 每次编译前均检测是否有错误，如果有错误无法完成编译
- 如有错误，请根据控制台错误信息改正
- 如需关闭eslint校验，在项目设置中关闭自定义预处理


### 8、支持埋点数据上报至we分析【需配置事件】
- APP和Page生命周期函数自动埋点
- Page其他函数埋点方法名需为xx__track格式
```
#示例
async clickClose__track(){
    
}
```


