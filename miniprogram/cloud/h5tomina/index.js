// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  switch (event.action) {
    case 'getUrlScheme': {
		let path = event.path || '/pages/index/index',
		arr = path.split('?'),
		query = '';
		if(arr.length > 1){
			path = arr[0]
			query = arr[1]
    }
    console.log({
      path,query
    })
		return getUrlScheme(path,query)
    }
  }

  return 'action not found'
}

async function getUrlScheme(path,query) {
  return cloud.openapi.urlscheme.generate({
    jumpWxa: {
      path: path.replace('/index/index/index', '/pages/index/index'), // <!-- replace -->
      query,
    },
    // 如果想不过期则置为 false，并可以存到数据库
    isExpire: true,
    // 一分钟有效期
    expireTime: parseInt(Date.now() / 1000 + 60),
  })
}
