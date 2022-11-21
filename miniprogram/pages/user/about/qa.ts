import { IAppOption } from "typings";

// pages/user/about/qa.ts
const app = getApp<IAppOption>()

Page({
    data: {
        list: [],
        default: [
            {
                title: '1.提供什么服务？',
                answer: '我们目前提供包括黄金VIP会员、白金VIP会员、星钻VIP会员及学生VIP会员。',
                open: true
            },
            {
                title: '2.收费方式？',
                answer: '爱奇艺VIP会员服务为收费服务，您可通过爱奇艺实际支持的付费方式完成VIP会员费用的支付，如银行卡支付、第三方支付等。请您注意，若您使用您的苹果账户或与您的会员账号绑定的通信账户进行支付，此付费方式为代收费运营商托收的付款方式，您通过此种付费方式付费可能存在一定的商业风险（如不法分子利用您账户或银行卡等有价卡等进行违法活动），该等风险可能会给您造成相应的经济损失，您应自行承担全部损失。',
                open: true
            },
            {
                title: '3.未成年人保护',
                answer: `爱奇艺非常注重未成年人的保护。
          2.1  若您为未成年人，应在监护人监护、指导下阅读本协议，并且使用VIP会员服务已经得到监护人的同意。
          
          2.2  监护人应指导子女上网应该注意的安全问题，防患于未然。若监护人同意未成年人使用VIP会员服务，必须以监护人名义申请消费，并对未成年人使用VIP会员服务进行正确引导、监督。未成年人使用VIP会员服务，以及行使和履行本协议项下的权利和义务即视为已获得了监护人的认可。
          
          2.3  爱奇艺提醒未成年人在使用会员服务时，要善于网上学习，认清网络世界与现实世界的区别，避免沉迷于网络，影响日常的学习生活。
          
          3.   更多关于个人信息处理和保护规则、用户对个人信息的控制权等内容，请您至爱奇艺平台上查阅《爱奇艺隐私政策》的全文（例如：手机爱奇艺APP的查询路径为：我的-设置-隐私，点击“隐私政策”）。
           `,
                open: true
            },
        ],
    },
    onLoad(options:Record<string,string|undefined>) {
        let module = options.module || 'default';
        // @ts-ignore
        let list = this.data[module];
        let userInfo = app.getEnvStorageSync('userInfo') || null;
        this.setData({
            type: options.type,
            list,
            userInfo
        })
    },
    /**
  * 点击展开收起
  */
    toggleClick(e: any) {
        const { id } = e.currentTarget;
        const { list } = this.data;

        list.map((item: any, index: number) => {
            if (index == id) {
                item.open = !item.open
            }
        })
        this.setData({ list });
    },
})