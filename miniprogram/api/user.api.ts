import { httpRequest } from "../utils/http";
import util, { buildLocalUserInfo, TurboModal } from "../utils/util";


/**
 * 获取用户信息
 */
const getUserInfo = async () => {
    try {
        let res = await httpRequest({
            url: '/auth/userInfo'
        })
        const userInfoRes = res.data.data;
        let userInfo = buildLocalUserInfo(userInfoRes)
        return userInfo
    } catch (error) {
        console.error(`用户信息读取失败`, error)
    }
    return getApp().globalData.userInfo || {}
}


/**
 * 更新用户头像昵称
 */
const updateUserProfile = async ({ userInfo }: any) => {
    console.log(`updateUserProfile`, userInfo)
    let res = await httpRequest({
        url: '/auth/modify/baseuserInfo',
        method: "POST",
        data: {
            ...userInfo
        }
    })
    let u = buildLocalUserInfo(res.data.data)
    console.log(`更新完毕后`, u)
    return u
}

/**
 * 用户授权微信信息并且自动向服务端发起保存
 */
const getWechatUserInfo = async () => {

    const cfm = await TurboModal({
        title: '基本信息',
        content: '授权获取昵称头像信息'
    })

    if (!cfm) return

    let { userInfo, encryptedData, iv, signature } = await wx.getUserProfile({
        desc: "用于完善会员资料"
    })
    if (!userInfo) {
        wx.showToast({
            title: '授权失败',
            icon: 'none'
        })
        return false
    }



    let localUserInfo = (await util.getUserInfoForce()) || {}
    localUserInfo = {
        ...localUserInfo,
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl,
        gender: userInfo.gender,
    }

    try {
        updateUserProfile({
            userInfo: localUserInfo
        })
    } catch (error) {
        console.error(error)
    }

    getApp().globalData.userInfo = {
        ...(getApp().globalData.userInfo || {}),
        ...localUserInfo
    }

    getApp().setEnvStorageSync('userInfo', getApp().globalData.userInfo)

    return {
        userInfo,
        localUserInfo,
        encryptedData,
        iv,
        signature
    }
}



/**
 * 用户手机号微信授权登录 
 */
const autoLoginPlus = async ({
    code,
}: any) => {
    console.log(`autoLoginPlus`, code)
    if (!code) {
        wx.showToast({
            title: '授权失败',
            icon: 'none'
        })
        return false
    }
    // console.log('wechat_miniapp_mobile', code);
    try {
        const res = (await httpRequest({
            url: `/auth/third/login/wechat_miniapp_mobile?code=${code}`,
            method: 'POST',
        })).data.data
        console.log(`手机号登录`, res)


        let { access_token, userInfo: userInfoRes } = res;

        let userInfo = buildLocalUserInfo({
            ...userInfoRes,
            access_token
        })
        return userInfo

    } catch (error) {
        console.error(error)
    }
};

/**
 * 获取用户最后一次保存的地址
 */
const getLatesAddressOfUser = async () => {
    const address = (await httpRequest({
        url: `/userext/address/list`
    })).data.data
    if (address && address.length > 0) return address[0]
    return null
}

const saveAddress = async (address: any) => {
    return (await httpRequest({
        url: `/userext/address/create`,
        method: 'POST',
        data: address
    })).data.data
}

export default {
    updateUserProfile,
    getWechatUserInfo,
    getUserInfo,
    autoLoginPlus,
    getLatesAddressOfUser,
    saveAddress
}
