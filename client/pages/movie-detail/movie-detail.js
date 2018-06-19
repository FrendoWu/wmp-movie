const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    movie: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let movieId = options.id;
    this.getMovie(movieId);
  },
  goToCommentList(event) {
    let movieId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/comment-list/comment-list?movieId=' + movieId,
    })
  },
  getMovie(movieId) {
    wx.showLoading({
      title: '电影详情加载中'
    })
    qcloud.request({
      url: config.service.movieDetail + movieId,
      success: result => {
        console.log(result)
        if (!result.data.code && result.data.data !== {}) {
          this.setData({
            movie: result.data.data
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '电影详情加载失败'
          })
        }
      },
      fail: err => {
        console.log(err);
        wx.showToast({
          icon: 'none',
          title: '电影详情加载失败'
        })
      },
      complete: result => {
        wx.hideLoading();
      }
    });
  },
  addComment(event) {
    let movieId = event.currentTarget.dataset.id;
    let commentType = '';
    wx.showActionSheet({
      itemList: ['文字', '音频'],
      success: function(res) {
        if (res.tapIndex === 0) {
          // 文字
          commentType = 'text'
        } else {
          // 音频
          commentType = 'voice'
        }
        wx.navigateTo({
          url: `/pages/comment-edit/comment-edit?movieId=${movieId}&commentType=${commentType}`
        })
      },
      fail: function(res) {
        console.log(res.errMsg)
      }
    })
  }
})