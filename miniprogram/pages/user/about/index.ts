// pages/user/about/index.ts
import { appConfig } from '../../../config';
import { IAppOption, SystemInfo } from 'typings';
import util from '../../../utils/util';
import { login } from '../../../utils/http';
const app = getApp<IAppOption>()
Page({
    data: {
        h5Url: appConfig.h5Url
    },

    onLoad () {
        //低版本库不显示(产品反馈)吐槽入口，高版本可进入吐槽小程序
        let tucaoShow;
        let systemInfo = (app.systemInfo || {}) as SystemInfo;
        if(util.compareVersion('2.4.0') < 0){
            // 用户版本过低
            tucaoShow = false; 
        } else {
            tucaoShow = true;
        }
        this.setData({
            appVersion: appConfig.version,
            tucaoShow: tucaoShow,
            'tucaoPlugin.extraData.customData': {
                clientInfo: systemInfo.brand + systemInfo.model ,
                clientVersion: systemInfo.version,
                os:systemInfo.system,
                customInfo: 'SDKVersion:' + systemInfo.SDKVersion +' ; pixelRatio:' + systemInfo.pixelRatio
            }
        });
    },

    async clean() {
        app.clearEnvStorageSync();
        await login();
        wx.showToast({title:'缓存清理完成'});
    }
})