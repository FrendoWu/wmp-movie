const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const util = require('../../utils/util.js');
const app = getApp();

const innerAudioContext = wx.createInnerAudioContext()
// 播放状态
const UNPLAYING = 0
const PLAYING = 1
// 收藏状态
const UNSTAR = 0
const STARED = 1

Page({

  /**
   * 页面的初始数据
   */
  data: {
    comment: null,
    audioStatus: UNPLAYING,
    userInfo: null,
    starStatus: null
  },
  onLoad: function (options) {
    let commentId = options.commentId;
    this.getCommentDetail(commentId);
  },
  onShow() {
    app.login({
      success: (userInfo) => {
        this.setData({
          userInfo: userInfo
        })
        this.setAudioOptions()

      },
      fail: () => {
        console.log('fail')
      }
    })
  },
  onTapAudio() {
    if (this.data.audioStatus === UNPLAYING) {
      innerAudioContext.play()
    } else if (this.data.audioStatus === PLAYING) {
      innerAudioContext.pause()
    }
  },
  onTapStar() {
    let commentId = this.data.comment.commentId;
    // 待修改后的starStatus
    let starStatus = this.data.comment.collectionId ? UNSTAR : STARED;
    let text = this.data.comment.collectionId ? '取消收藏' : '收藏';
    wx.showLoading({
      title: '正在' + text
    })
    qcloud.request({
      url: config.service.updateCollection,
      method: 'POST',
      data: {
        commentId: commentId,
        starStatus: starStatus
      },
      success: result => {
        wx.hideLoading();
        this.getCommentDetail(commentId)
        if (!result.data.code) {
          wx.showToast({
            title: text + '成功'
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: text + '失败'
          })
        }
      },
      fail: result => {

        console.log('1234',result);
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: text + '失败'
        })
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
  onTapEdit() {
    let movieId = this.data.comment.movieId;
    let commentType = this.data.comment.type;
    wx.showActionSheet({
      itemList: ['文字', '音频'],
      success: function (res) {
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
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  setAudioOptions() {
    innerAudioContext.onPlay(() => {
      this.setData({
        audioStatus: PLAYING
      })
    })
    innerAudioContext.onPause(() => {
      this.setData({
        audioStatus: UNPLAYING
      })
    })
    innerAudioContext.onStop(() => {
      this.setData({
        audioStatus: UNPLAYING
      })
    })
    innerAudioContext.onEnded(() => {
      this.setData({
        audioStatus: UNPLAYING
      })
    })
    innerAudioContext.onError((res) => {
      console.log(res)
    })
  },
  getCommentDetail(commentId) {
    qcloud.request({
      url: config.service.commentDetail + commentId,
      method: 'GET',
      success: result => {
        if (!result.data.code) {
          let comment = result.data.data;
          console.log(comment)
          comment.createTime = util.formatTime(new Date(comment.createTime))
          comment['durationText'] = Math.floor(comment.duration / 1000 * 100) / 100 + "''"
          this.setData({
            comment: comment
          })
          innerAudioContext.src = this.data.comment.content;
        } else {
          wx.showToast({
            icon: 'none',
            title: '获取影评失败'
          })
        }
      },
      fail: result => {
        console.log(result);
        wx.showToast({
          icon: 'none',
          title: '获取影评失败'
        })
      }
    })
  }
})