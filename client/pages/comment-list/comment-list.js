const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const util = require('../../utils/util.js');
const app = getApp();
const innerAudioContext = wx.createInnerAudioContext()

// 播放状态
const UNPLAYING = 0
const PLAYING = 1

Page({

  data: {
    comments: [],
    movieId: null,
    audioStatus: []
  },
  onLoad: function (options) {
    let movieId = options.movieId;
    this.setData({
      movieId: movieId
    })
    this.getComments(movieId);
  },
  onShow() {
    this.setAudioOptions();
  },
  onTapAudio(event) {
    let src = event.currentTarget.dataset.src;
    let index = event.currentTarget.dataset.index;
    innerAudioContext.src = src;
    let audioStatus = [];
    for (let i = 0; i < this.data.audioStatus.length; i++) {
      if (i === index) {
        audioStatus.push(PLAYING);
      } else {
        audioStatus.push(UNPLAYING);
      }
    }
    innerAudioContext.play()
    this.setData({
      audioStatus: audioStatus
    })
  },
  setAudioOptions() {
    innerAudioContext.onEnded(() => {
      let audioStatus = [];
      for (let i = 0; i < this.data.audioStatus.length; i++) {
          audioStatus.push(UNPLAYING);
      }
      this.setData({
        audioStatus: audioStatus
      })
    })
    innerAudioContext.onError((res) => {
      console.log(res)
    })
  },
  goToCommentDetail(event) {
    let commentId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/comment-detail/comment-detail?commentId=${commentId}`,
    })
  },
  goToHome() {
    wx.navigateTo({
      url: '/pages/home/home'
    })
  },
  onPullDownRefresh() {
    this.getComments(this.data.movieId, () => {
      wx.stopPullDownRefresh();
    });
  },
  getComments(movieId, cb){
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
          let audioStatus = [];
          comments.forEach(comment => {
            comment.createTime = util.formatTime(new Date(comment.createTime))
            comment['durationText'] = Math.floor(comment.duration / 1000 * 100) / 100 + "''"
            audioStatus.push(UNPLAYING)
          })
          this.setData({
            comments: comments,
            audioStatus: audioStatus
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
      },
      complete: () => {
        cb && cb()
      }
    })
  }
})