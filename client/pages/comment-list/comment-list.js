const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const util = require('../../utils/util.js');
const app = getApp();

Page({

  data: {
    comments: []
  },
  onLoad: function (options) {
    let movieId = options.movieId;
    this.getComments(movieId);
  },
  goToHome() {
    wx.navigateTo({
      url: '/pages/home/home'
    })
  },
  getComments(movieId){
    wx.showLoading({
      title: '正在获取影评列表'
    })
    qcloud.request({
      url: config.service.commentList + `?movieId=${movieId}`,
      data: {
        movieId: movieId
      },
      method: 'GET',
      success: result => {
        wx.hideLoading();
        if (!result.data.code) {
          let comments = result.data.data;
          comments.forEach(comment => {
            comment.create_time = util.formatTime(new Date(comment.create_time))
          })
          this.setData({
            comments: result.data.data
          })
          wx.showToast({
            title: '获取影评成功'
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '获取影评失败'
          })
        }
      },
      fail: result => {
        console.log(result);
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '获取影评失败'
        })
      }
    })
  }
})