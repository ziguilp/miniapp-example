/// <reference path="./types/index.d.ts" />

import { EventBus } from "miniprogram/utils/eventbus";
import { Store } from "../miniprogram/utils/store";

/**
 * 通用函数
 */
export type TurboFn = (...args:any) => void;

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

export interface SystemInfo extends WechatMiniprogram.SystemInfo {
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
    parseScanUri(options: WechatMiniprogram.App.LaunchShowOption): void,
    sceneReport(options: WechatMiniprogram.App.LaunchShowOption, isAppOnLanch: boolean): void,
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

export interface AppConfigHostConfig{
    /**
     * 接口服务
     */
    host: string;
    /**
     * 海报生成服务
     */
    posterHost: string;
    /**
     * 短链生成key
     */
    shortLinkApiKey: string;
    /**
     * graphql服务
     */
    graphql: {
        url: string
    };
}

export interface AppConfigProp {
    /**
     * 环境配置
     */
    env: 'dev' | 'test' | 'prod',
    /**
     * 小程序版本号
     */
    version: string,
    /**
     * CMS客户端版本号
     */
    cmsVersion:string,
    /**
     * 路由未找到时处理规则
     */
    appNotFindRules: {
        [key:string]: any
    },
    /**
     * 开发环境
     */
    dev: AppConfigHostConfig,
    /**
     * 测试环境
     */
    test: AppConfigHostConfig,
    /**
     * 生产环境
     */
    prod: AppConfigHostConfig,
    /**
     * 默认分享配置
     */
    share: {
        title: string,
        image?:string
    },
    /**
     * H5连接配置
     */
    h5Url: {
        [key:string]: string
    },
    [key:string]: any
}