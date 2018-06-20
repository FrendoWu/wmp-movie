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
// 录音授权状态
const UNVERIFIED = 0 // 未验证
const UNAUTHORIZED = 1 // 未授权
const AUTHORIZED = 2 // 已授权

Page({
  data: {
    recordStatusTip: ['按 住 录 音', '松 开 结 束', '重 新 录 制'], //录音按钮的文字显示与状态的对应关系
    userInfo: null,
    movie: null,
    commentContent: "", //文本内容，只有在影评内容是text时起效
    commentType: 'text', // 影评类型，默认为文本
    editMode: true, // 是否处于编辑状态
    recordStatus: UNRECORDED, // 录音状态，默认处于未录音
    recordAudio: null, // 音频对象，只有在影评内容是voice时起效
    audioStatus: UNPLAYING, // 音频播放状态
    recordAuthStatus: UNVERIFIED // 录音授权状态
  },
  /**
   * 监听页面加载事件
   * 绑定影评类型
   * 获取电影详情
   */
  onLoad: function(options) {
    let commentType = options.commentType
    let movieId = options.movieId
    this.setData({
      commentType: commentType
    })
    this.getRecordAuth();
    this.getMovie(movieId);
  },
  getRecordAuth() {
    // 获取用户录音授权状态
    wx.getSetting({
      success: (res) => {
        let auth = res.authSetting['scope.record']
        if (auth === undefined) {
          // 未验证
          this.setData({
            recordAuthStatus: UNVERIFIED
          })
        } else if (auth === false) {
          // 未授权
          this.setData({
            recordAuthStatus: UNAUTHORIZED
          })
        } else if (auth === undefined || auth === true) {
          // 已授权
          this.setData({
            recordAuthStatus: AUTHORIZED
          })
        }
      },
      fail: res => {}
    })
  },
  /**
   * 监听音频点击事件
   * 播放或暂停音频
   */
  onTapAudio() {
    if (this.data.audioStatus === UNPLAYING) {
      innerAudioContext.play()
    } else if (this.data.audioStatus === PLAYING) {
      innerAudioContext.pause()
    }
  },
  /**
   * 设置音频参数
   */
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
    innerAudioContext.onError((res) => {})
  },
  /**
   * 绑定录音按钮按下事件
   * 开始录音
   */
  startRecord() {
    const options = {
      duration: 60000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3',
      frameSize: 50
    }
    if (this.data.recordAuthStatus === UNVERIFIED) {
      recorderManager.onStart(() => {
        console.log('recorder start')
        recorderManager.stop();
      })
      recorderManager.onPause(() => {
        console.log('recorder pause')
      })
      recorderManager.onStop((res) => {
        console.log('recorder stop', res)
        const { tempFilePath } = res
      })
      recorderManager.onFrameRecorded((res) => {
        const { frameBuffer } = res
        console.log('frameBuffer.byteLength', frameBuffer.byteLength)
      })
      recorderManager.onError((res) => {
        console.log('recorder error', res)
      })
      recorderManager.start(options)
    } else if (this.data.recordAuthStatus === AUTHORIZED) {
      recorderManager.onStart(() => {
        wx.vibrateShort();
        innerAudioContext.stop()
        this.setData({
          recordStatus: RECORDING,
          recordAudio: null
        })
      })
      recorderManager.start(options)
    }
  },
  endRecord() {
    if (this.data.recordAuthStatus === AUTHORIZED) {

    } else if (this.data.recordAuthStatus === AUTHORIZED) {
      recorderManager.stop()
      recorderManager.onStop((res) => {
        res['durationText'] = Math.floor(res.duration / 1000 * 100) / 100 + "''"
        this.setData({
          recordAudio: res,
          recordStatus: RECORDED
        })
        innerAudioContext.src = res.tempFilePath
      })
    }
  },
  onTapLogin(e) {
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
      fail: (error) => {}
    })
  },
  getMovie(movieId) {
    wx.showLoading({
      title: '电影详情加载中'
    })
    qcloud.request({
      url: config.service.movieDetail + movieId,
      success: result => {
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
    // comment = comment.replace(/\\/g, '\\\\');
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
        cb && cb(content)
      },
      fail: (err) => {
        wx.hideLoading();
      }
    })
  },
  sendComment() {
    let movieId = this.data.movie.id;
    let comment = this.data.commentContent;
    let commentType = this.data.commentType;
    let duration = this.data.recordAudio ? this.data.recordAudio.duration : null;
    if (commentType === 'text') {
      this.addComment(movieId, comment, commentType, duration)
    } else if (commentType === 'voice') {
      this.uploadVoice((content) => {
        this.addComment(movieId, content, commentType, duration)
      })
    }
  }
})