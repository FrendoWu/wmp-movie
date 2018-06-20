// pages/home/home.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    comment: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.login({
      success: (userInfo) => {
        this.setData({
          userInfo: userInfo
        })
        this.getRecommendComment();
      },
      fail: () => {
        console.log('fail')
      }
    })
  },
  onPullDownRefresh() {
    this.getRecommendComment(() => {
      wx.stopPullDownRefresh();
    });
  },
  goToCommentDetail() {
    let commentId = this.data.comment.commentId;
    wx.navigateTo({
      url: `/pages/comment-detail/comment-detail?commentId=${commentId}`,
    })
  },
  goToMovieDetail() {
    let movieId = this.data.comment.movieId;
    wx.navigateTo({
      url: '/pages/movie-detail/movie-detail?id=' + movieId,
    })
  },
  getRecommendComment(cb) {
    wx.showLoading({
      title: '电影加载中'
    })
    qcloud.request({
      url: config.service.commentRecommend,
      success: result => {
        console.log(result)
        wx.hideLoading();
        if (!result.data.code) {
          wx.showToast({
            icon: 'success',
            title: '电影加载完成'
          })
          this.setData({
            comment: result.data.data
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '电影加载失败'
          })
        }
      },
      fail: err => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '电影加载失败'
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
      this.getRecommendComment();
    }
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