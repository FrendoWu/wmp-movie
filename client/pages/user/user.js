const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const app = getApp();
// 列表类型
const COLLECTION = 0
const PUBLISH = 1

Page({
  data: {
    userInfo: null,
    comments: [],
    listType: COLLECTION
  },
  onLoad: function (options) {
    app.login({
      success: (userInfo) => {
        this.setData({
          userInfo: userInfo
        })
        this.getList();
      },
      fail: () => {
        console.log('fail')
      }
    })
  },
  onTapListType(event) {
    let listType = +event.currentTarget.dataset.type;
    this.setData({
      listType: listType
    })
    this.getList();
  },
  onPullDownRefresh() {
    this.getList(() => {
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
          let comments = result.data.data;
          comments.forEach(comment => {
            comment['durationText'] = Math.floor(comment.duration / 1000 * 100) / 100 + "''"
          })
          this.setData({
            comments: comments
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
  getUserComments(cb) {
    wx.showLoading({
      title: '发布影评加载中'
    })
    qcloud.request({
      url: config.service.userComment,
      success: result => {
        console.log(result)
        wx.hideLoading();
        if (!result.data.code) {
          let comments = result.data.data;
          comments.forEach(comment => {
            comment['durationText'] = Math.floor(comment.duration / 1000 * 100) / 100 + "''"
          })
          this.setData({
            comments: comments
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '发布影评加载失败'
          })
        }
      },
      fail: err => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '发布影评加载失败'
        })
      },
      complete: result => {
        cb && cb()
      }
    })
  },
  getList(cb){
    if (this.data.listType === COLLECTION) {
      this.getCollection(cb);
    } else if (this.data.listType === PUBLISH){
      this.getUserComments(cb);
    }
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