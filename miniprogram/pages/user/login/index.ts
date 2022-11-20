// pages/user/login/index.ts

import { IAppOption } from "../../../../typings";
import userApi from "../../../api/user.api";
import { appConfig } from "../../../config";
import util, { buildLocalUserInfo, openPage } from "../../../utils/util";

const app = getApp<IAppOption>();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: undefined,
        can_getuserinfo: 1
    },

    onLoad(){
        let userInfo = app.getEnvStorageSync('userInfo') || null;
        this.setData({
            userInfo
        })
        
    },

    async onShow() {},
    getError(){
        return wx.showToast({
            title: '请阅读并同意用户服务协议',
            icon: 'none'
        })
    },
    getUserInfo(){
        wx.getUserProfile({
            desc: '获取你的昵称、头像、地区及性别',    //不能为空
            success:(e)=>{
                console.log('getUserInfo111',e)
                this.getInfo(e.userInfo);
            }      
        }) 
    },
    async getInfo(Info:WechatMiniprogram.UserInfo){
        let localUserInfo = {
            nickname: Info.nickName,
            avatar: Info.avatarUrl,
            gender: Info.gender,
            status:'normal'
        }
        try {
             await userApi.updateUserProfile({userInfo:localUserInfo})
        } catch (error) {
            console.error(error)
        }

        let userInfo = buildLocalUserInfo({
            ...(app.globalData.userInfo || {} ),
            ...localUserInfo
        } as any) as any
        this.setData({
            can_getuserinfo:1,
            userInfo
        })
    },
    async getPhoneNumber(e:any){
        console.log('login',e)
        let userInfo = await userApi.autoLoginPlus({code:e.detail.code}).catch(e => console.error)
        console.log('autoLoginPlus', userInfo);
        if(!userInfo){
            return wx.showToast({
              title: '注册失败',
              icon: 'none'
            })
        }else{
            return openPage(`/pages/index/index`)
        }
 
    },
    async login(code:string) {
        // const {
        //     aggreeMent
        // } = this.data;
        // if (!aggreeMent) {
        //     return wx.showToast({
        //         title: '请阅读并同意用户服务协议',
        //         icon: 'none'
        //     })
        // }
        // let userInfo = await userApi.autoLoginPlus({code:code})
        // console.log();
        // const {userInfo,access_token} = (await httpRequest({
        //     url: `/auth/login`,
        //     method: 'POST',
        //     data: {
        //         username,
        //         password
        //     },
        //     options:{
        //         withoutToken: true
        //     }
        // })).data.data;

        // if(!userInfo){
        //     return wx.showToast({
        //       title: '注册失败',
        //       icon: 'none'
        //     })
        // }
 
        // try {
            // userInfo.access_token = access_token;
            // let jwtToken = jwtUtil(access_token)
            // userInfo.expires_time = jwtToken.exp;
            // app.globalData.userInfo  = userInfo
            // app.setEnvStorageSync("loginform", {
            //     username,
            //     password
            // })
            // app.setEnvStorageSync("userInfo", userInfo)
            // app.store.dispatch('setUserInfo', userInfo)
            // wx.showToast({
            //     title: '注册成功，请选择学校',
            //     icon: 'none'
            // })
            // setTimeout(function () {
            //     wx.redirectTo({
            //         url: '/pages/user/pages/login/select_school'
            //     })
            // }, 1000)
            // util.openPage(`/pages/index/index`)
            // return userInfo;
        // } catch (error) {
        //     console.error(error)
        // }
    },

    onChangeAggree(e:any) {
        this.setData({
            aggreeMent: e.detail
        })
        // console.log('aggreeMent',this.data.aggreeMent);
    },

    openAboutUserHandle() {
        util.openPage(appConfig.h5Url.service)
    },
    openYinsiHandle() {
        util.openPage(appConfig.h5Url.yinsi)
    },
    toreg(){
        util.openPage(`/pages/user/login/reg`)
    }
})