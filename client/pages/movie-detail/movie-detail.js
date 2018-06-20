const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');

Page({
  data: {
    movie: null
  },
  /**
   * 监听页面加载事件
   * 根据跳转参数获取电影详情
   */
  onLoad: function(options) {
    let movieId = options.id;
    this.getMovie(movieId);
  },
  /**
   * 跳转至电影影评列表界面
   */
  goToCommentList(event) {
    let movieId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/comment-list/comment-list?movieId=' + movieId,
    })
  },
  /**
   * 监听图片点击事件
   * 放大浏览大图
   */
  imgZoom() {
    wx.previewImage({
      current: this.data.movie.image, // 当前显示图片的http链接
      urls: [this.data.movie.image] // 需要预览的图片http链接列表
    })
  },
  /**
   * 获取电影详情
   */
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
  /**
   * 监听点击添加影评按钮
   * 带电影id和类型跳转至影评编辑页面
   */
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
      }
    })
  }
})