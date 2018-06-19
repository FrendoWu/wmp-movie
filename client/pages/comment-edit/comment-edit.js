const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const app = getApp();

Page({

  data: {
    userInfo: null,
    movie: null,
    commentContent: "",
    commentType: 'text',
    editMode: true
  },
  onLoad: function (options) {
    console.log(options)
    let commentType = options.commentType
    let movieId = options.movieId
    this.setData({
      commentType: 'text'
    })
    this.getMovie(movieId);
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
        this.setData({ userInfo })
        console.log(userInfo)
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
  sendComment() {
    let movieId = this.data.movie.id;
    let comment = this.data.commentContent;
    let commentType = this.data.commentType;
    wx.showLoading({
      title: '正在发布影评'
    })
    qcloud.request({
      url: config.service.addComment,
      data: {
        movieId: movieId,
        content: comment,
        commentType: commentType
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
  }
})