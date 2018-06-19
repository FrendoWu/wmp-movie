//app.js
const qcloud = require('./vendor/wafer2-client-sdk/index')
const config = require('./config')

let userInfo

App({
  onLaunch: function () {
    qcloud.setLoginUrl(config.service.loginUrl);
  },

  login({ success, fail, complete }) {
    if (userInfo) {
      return success && success(userInfo);
    }
    qcloud.login({
      success: result => {
        if (result) {
          userInfo = result
          success && success(userInfo)
        } else {
          // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
          this.getUserInfo({ success, fail, complete })
        }
      },
      fail: () => {
        fail && fail()
      },
      complete: () => {
        complete && complete()
      }
    })
  },

  getUserInfo({ success, fail, complete }) {
    qcloud.request({
      url: config.service.requestUrl,
      login: true,
      success: result => {
        let data = result.data

        if (!data.code) {
          userInfo = data.data

          success && success(userInfo)
        } else {
          fail && fail()
        }
      },
      fail: () => {
        fail && fail()
      },
      complete: () => {
        complete && complete()
      }
    })
  }

})