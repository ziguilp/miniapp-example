/*
 * @Author        : turbo 664120459@qq.com
 * @Date          : 2023-03-25 15:33:25
 * @LastEditors   : turbo 664120459@qq.com
 * @LastEditTime  : 2023-03-25 15:34:17
 * @FilePath      : /miniprogram/miniprogram/components/oss-image/index.ts
 * @Description   : 
 * 
 * Copyright (c) 2023 by turbo 664120459@qq.com, All Rights Reserved. 
 */
// components/watermark/index.ts
import upload from '../../vendor/upload/index';

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        src: {
            type: String,
            observer: function () {
                this.init()
            }
        },
        imgStyle: {
            type: String,
            value: ''
        },
        mode: {
            type: String,
            value: "aspectFill"
        },
        style: {
            type: String,
            value: ''
        }
    },
    lifetimes: {
        attached: function () {
            this.init()
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        url: ''
    },
    methods: {
        async init() {
            const { src, imgStyle } = this.data;
            const realImgSrc = await upload.buildAliPrivateImageUrl(src, imgStyle)
            console.log({
                realImgSrc
            })
            this.setData({
                url: realImgSrc
            })
        },
    }
})