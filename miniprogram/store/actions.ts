import { IUserInfo } from "typings";
import commonApi from "../api/common.api";
import userApi from "../api/user.api";
import { appConfig } from "../config";
import { login } from "../utils/http";

export default {
    async toggleEnv() {
        switch (appConfig.env) {
            case 'prod':
                appConfig.env = 'dev'
                break;
            case 'dev':
                appConfig.env = 'prod'
                break;
            default:
                appConfig.env = 'prod'
                break;
        }
        if (appConfig.env !== 'prod') {
            wx.setScreenBrightness({
                value: 1
            })
        } else {
            wx.setScreenBrightness({
                value: 0.5
            })
        }
        wx.showToast({
            title: appConfig.env
        })
        login();
        console.log('switch env to "' + appConfig.env + '".')
        return {
            env: appConfig.env
        }
    },

    // 获取CMS的配置信息
    async getCmsInfo({
        state
    }:any) {
        let cmsInfo = state.cmsInfo || await commonApi.getCmsInfo({
            pageId: ''
        });
        return {
            cmsInfo
        }
    },

    async getUserInfo() {
        let res = (await userApi.getUserInfo());
        if(!res || !res.id){
            return {
                userInfo: null
            }
        }
        return {
            userInfo: res
        }
    },

    async setUserInfo({
        state
    }:any, userInfo:IUserInfo) {
        return {
            userInfo
        }
    },

    /**
     * 设置选择的收货地址
     */
    setSelectedAddress({
        state
    }:any, {
        address = null
    } = {}) {
        return {
            selectedAddress: address
        }
    },
}