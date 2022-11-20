// components/empty/index.ts
Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    properties: {
        customStyle: {
            type: String,
            value: ''
        },
        content: {
            type: String,
            value: '这里什么都没有呢'
        },
        image: {
            type: String,
            value: 'https://fenhol.oss-cn-beijing.aliyuncs.com/xiquecrm/imgs/empty.png'
        },
    },

    data: {

    },

    async created() {

    },

    methods: {

    },
});