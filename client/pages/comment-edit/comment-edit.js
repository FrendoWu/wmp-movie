const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const app = getApp();

const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()
// 录音状态
const UNRECORDED = 0
const RECORDING = 1
const RECORDED = 2
// 播放状态
const UNPLAYING = 0
const PLAYING = 1

Page({

  data: {
    recordStatusTip: ['按 住 录 音', '松 开 结 束', '重 新 录 制'],
    userInfo: null,
    movie: null,
    commentContent: "",
    commentType: 'text',
    editMode: true,
    recordStatus: UNRECORDED,
    recordAudio: null,
    audioStatus: UNPLAYING
  },
  onTapAudio() {
    if (this.data.audioStatus === UNPLAYING) {
      innerAudioContext.play()
    } else if (this.data.audioStatus === PLAYING) {
      innerAudioContext.pause()
    }
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
  onLoad: function (options) {
    console.log(options)
    let commentType = options.commentType
    let movieId = options.movieId
    this.setData({
      commentType: commentType
    })
    this.getMovie(movieId);
  },

  startRecord() {
    console.log('start record')
    const options = {
      duration: 60000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3',
      frameSize: 50
    }
    recorderManager.start(options)
    recorderManager.onStart(() => {
      wx.vibrateShort();
      innerAudioContext.stop()
      this.setData({
        recordStatus: RECORDING,
        recordAudio: null
      })
    })
  },
  endRecord() {

    recorderManager.stop()
    recorderManager.onStop((res) => {
      res['durationText'] = Math.floor(res.duration / 1000 * 100) / 100 + "''"
      console.log(res)
      this.setData({
        recordAudio: res,
        recordStatus: RECORDED
      })
      innerAudioContext.src = res.tempFilePath
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
  onTapFinishBtn() {
    this.setData({
      editMode: false
    })
    wx.setNavigationBarTitle({
      title: '影评预览'
    })
  },
  onTapEditBack() {
    this.setData({
      editMode: true
    })
    wx.setNavigationBarTitle({
      title: '编辑影评'
    })
  },
  onInputComment(event) {
    this.setData({
      commentContent: event.detail.value
    })
  },
  onShow() {
    app.login({
      success: (userInfo) => {
        this.setData({
          userInfo: userInfo,
          recordStatus: UNRECORDED
        })
        this.setAudioOptions()
      },
      fail: () => {
        console.log('fail')
      }
    })
  },
  getMovie(movieId) {
    wx.showLoading({
      title: '电影详情加载中'
    })
    qcloud.request({
      url: config.service.movieDetail + movieId,
      success: result => {
        console.log('<<<>>>')
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
  addComment(movieId, comment, commentType, duration) {
    wx.showLoading({
      title: '正在发布影评'
    })
    console.log(comment)
    // comment = comment.replace(/\\/g, '\\\\');
    console.log(comment)
    qcloud.request({
      url: config.service.addComment,
      data: {
        movieId: movieId,
        content: comment,
        commentType: commentType,
        duration: duration
      },
      method: 'POST',
      success: result => {
        wx.hideLoading();
        if (!result.data.code) {
          wx.showToast({
            title: '发布影评成功'
          })
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/comment-list/comment-list?movieId=' + movieId
            })
          }, 1500)
        } else {
          wx.showToast({
            icon: 'none',
            title: '发布影评失败'
          })
        }
      },
      fail: result => {
        console.log(result);
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '发布影评失败'
        })
      }
    })
  },
  uploadVoice(cb) {
    wx.showLoading({
      title: '正在发布影评'
    })
    let url = this.data.recordAudio.tempFilePath;
    console.log(url)
    wx.uploadFile({
      url: config.service.uploadUrl,
      filePath: url,
      name: 'file',
      header: {
        'content-type': 'multipart/form-data'
      },
      success: res => {
        wx.hideLoading();
        let content = JSON.parse(res.data).data.imgUrl;
        console.log(content);
        cb && cb(content)
      },
      fail: (err) => {
        wx.hideLoading();
        console.log(err)
      }
    })
  },
  
  sendComment() {
    let movieId = this.data.movie.id;
    let comment = this.data.commentContent;
    let commentType = this.data.commentType;
    let duration = this.data.recordAudio ? this.data.recordAudio.duration: null;
    if (commentType === 'text') {
      this.addComment(movieId, comment, commentType, duration)
    } else if (commentType === 'voice') {
      this.uploadVoice((content) => {
        this.addComment(movieId, content, commentType, duration)
      })
    }
  }
})