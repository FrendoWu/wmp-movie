// pages/movie-list/movie-list.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    movies: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getMovieList();
  },
  onPullDownRefresh: function() {
    this.getMovieList(() => {
      wx.stopPullDownRefresh();
    })
  },
  goToDetail(event) {
    let movieId = event.currentTarget.dataset.id;
    console.log(movieId)
    wx.navigateTo({
      url: '/pages/movie-detail/movie-detail?id=' + movieId,
    })
  },
  getMovieList(cb) {
    wx.showLoading({
      title: '电影列表加载中'
    })
    qcloud.request({
      url: config.service.movieList,
      success: result => {
        console.log(result)
        if (!result.data.code && result.data.data !== {}) {
          this.setData({
            movies: result.data.data
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '电影列表加载失败'
          })
        }
      },
      fail: err => {
        console.log(err);
        wx.showToast({
          icon: 'none',
          title: '电影列表加载失败'
        })
      },
      complete: result => {
        wx.hideLoading();
        cb && cb()
      }
    });
  },
})