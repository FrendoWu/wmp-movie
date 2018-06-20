const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const app = getApp();

Page({
  data: {
    userInfo: null,
    collections: []
  },
  
  onLoad: function (options) {
    app.login({
      success: (userInfo) => {
        this.setData({
          userInfo: userInfo
        })
        this.getCollection();
      },
      fail: () => {
        console.log('fail')
      }
    })
  },
  onPullDownRefresh() {
    this.getCollection(() => {
      wx.stopPullDownRefresh();
    });
  },
  getCollection(cb) {
    wx.showLoading({
      title: '收藏影评加载中'
    })
    qcloud.request({
      url: config.service.collectionList,
      success: result => {
        console.log(result)
        wx.hideLoading();
        if (!result.data.code) {
          let collections = result.data.data;
          collections.forEach(collection => {
            collection['durationText'] = Math.floor(collection.duration / 1000 * 100) / 100 + "''"
          })
          this.setData({
            collections: collections
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '收藏影评加载失败'
          })
        }
      },
      fail: err => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '收藏影评加载失败'
        })
      },
      complete: result => {
        cb && cb()
      }
    })
  },
  onTapLogin(e) {
    console.log(e)
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo
      })
    }
  },
  goToHome() {
    wx.navigateTo({
      url: '/pages/home/home'
    })
  },
  goToCommentDetail(event) {
    let commentId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/comment-detail/comment-detail?commentId=${commentId}`,
    })
  },
  onShow: function () {
    app.login({
      success: (userInfo) => {
        this.setData({
          userInfo: userInfo
        })
      },
      fail: () => {
        console.log('fail')
      }
    })
  }
})