/// <reference path="./types/index.d.ts" />

import { EventBus } from "miniprogram/utils/eventbus";
import { Store } from "../miniprogram/utils/store";

export interface IUserInfo extends WechatMiniprogram.UserInfo {
    id: string,
    userId: string,
    nickname: string,
    avatar: string,
    access_token?: string,
    refresh_token?: string,
    expires_time?: number,
    vip_expire_time?: number,
    date_created?: Date,
    birthday?: string,
}

export interface Inavigator {
    path: string,
    method?: "redirectTo" | "navigateTo" | 'switchTab',
    success?: Function
}

export interface SystemInfo extends WechatMiniprogram.SystemInfo{
    rpxRate: number,
    isIos: boolean
}

export interface IAppOption {
    store: Store,
    eventBus: EventBus,
    storage: {
        [key: string]: any
    },
    globalData: {
        userInfo?: IUserInfo,
    },
    /**
     * timer_env_storage
     */
    timer_env_storage: {
        [key: string]: any
    },
    systemInfo?: SystemInfo,
    userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
    $sentry: any,
    $teaReport(event: string, data: any): void,
    navigator(opt: Inavigator): void,
    parseScanUri(options:any):void,
    sceneReport(options: any, isAppOnLanch: boolean): void,
    setToken(token: string): void,
    getEnvStorageSync(key: string): any,
    setEnvStorageSync(key: string, data: any): void,
    setEnvStorageSyncDebounce(key: string, data: any, delay: number): void,
    setEnvStorage({
        key,
        data
    }: any): void,
    removeEnvStorageSync(key: string): void,
    clearEnvStorageSync(): void,
}

