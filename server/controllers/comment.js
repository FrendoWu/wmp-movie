// 登录授权接口
const DB = require('../utils/db.js')

module.exports = {
  getOne: async ctx => {
    
  },
  list: async ctx => {
    let movieId = ctx.request.query.movieId;
    if (!isNaN(movieId)) {
      ctx.state.data = await DB.query('Select * from comment where movie_id = ? order by create_time desc', [movieId])
    }
  },
  add: async ctx => {
    let user = ctx.state.$wxInfo.userinfo.openId;
    let username = ctx.state.$wxInfo.userinfo.nickName;
    let avatar = ctx.state.$wxInfo.userinfo.avatarUrl;
    let movieId = ctx.request.body.movieId;
    let content = ctx.request.body.content;
    let commentType = ctx.request.body.commentType;

    if (!isNaN(movieId)) {
      await DB.query('INSERT INTO comment(movie_id, user_id, user_name, user_avatar, type, content) VALUES (?, ?, ?, ?, ?, ?)', [movieId, user, username, avatar, commentType, content])
    }
    ctx.state.data = {}
  }
}
