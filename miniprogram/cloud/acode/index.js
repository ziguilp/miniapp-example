// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()


/**
 * 生成不限制的小程序码
 * 此接口限流5000次/分
 */
const createdAcodeBySceene = async function ({scene, page, isHyaline = true}){
  try {
    const result = await cloud.openapi.wxacode.getUnlimited({
        scene: encodeURIComponent(scene),
        width: 280,
        page,
        isHyaline
      })
    return result
  } catch (err) {
    console.error(err)
    return null
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  switch(event.action){
    //使用场景码生成小程序码
    case 'getAcodeByScene':
      if(!event.scene){
        return null
      }
      return await createdAcodeBySceene({scene: event.scene})
      break;
      default:
        return wxContext
  }
}