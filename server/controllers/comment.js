// 登录授权接口
const DB = require('../utils/db.js')

module.exports = {
  getOne: async ctx => {
    // 随机返回一条非本人评论且本人未收藏的评论
    let user = ctx.state.$wxInfo.userinfo.openId;
    ctx.state.data = (await DB.query("Select comment.id as commentId, comment.movie_id as movieId, comment.user_name as userName, comment.user_avatar as userAvatar, movie.title as movieTitle, movie.image as movieImage,rand() as tag from comment left join movie on comment.movie_id = movie.id where comment.user_id <> ? and comment.id not in (SELECT collection.comment_id from collection where collection.user_id = ?) order by tag desc LIMIT 1", [user, user]))[0] || null
  },
  userList: async ctx => {
    let user = ctx.state.$wxInfo.userinfo.openId;
    ctx.state.data = await DB.query('Select comment.id as commentId, comment.content as content, comment.duration as duration, comment.type as type, comment.user_avatar as userAvatar, comment.user_name as userName, movie.image as movieImage, movie.title as movieTitle from comment left join movie on comment.movie_id = movie.id where user_id = ?', [user])
  },
  list: async ctx => {
    let movieId = ctx.request.query.movieId;
    if (!isNaN(movieId)) {
      ctx.state.data = await DB.query('Select id as id, movie_id as movieId, user_id as userId, user_name as userName, user_avatar as userAvatar, type as type, content as content, duration as duration, create_time as createTime from comment where movie_id = ? order by create_time desc', [movieId])
    }
  },
  detail: async ctx => {
    let user = ctx.state.$wxInfo.userinfo.openId;
    let id = +ctx.params.id;
    if (!isNaN(id)) {
      ctx.state.data = (await DB.query('Select comment.id as commentId, comment.movie_id as movieId, comment.user_id as userId, comment.user_name as userName, comment.user_avatar as userAvatar, type as type, comment.content as content, comment.duration as duration, comment.create_time as createTime, movie.title as movieTitle, movie.image as movieImage, collection.id as collectionId from comment left join movie on comment.movie_id = movie.id left join collection on comment.id = collection.comment_id and collection.user_id = ? where comment.id = ?', [user, id]))[0] || []
    }
  },
  add: async ctx => {
    let user = ctx.state.$wxInfo.userinfo.openId;
    let username = ctx.state.$wxInfo.userinfo.nickName;
    let avatar = ctx.state.$wxInfo.userinfo.avatarUrl;
    let movieId = ctx.request.body.movieId;
    let content = ctx.request.body.content;
    let commentType = ctx.request.body.commentType;
    let duration = ctx.request.body.duration;

    if (!isNaN(movieId)) {
      await DB.query('INSERT INTO comment(movie_id, user_id, user_name, user_avatar, type, content, duration) VALUES (?, ?, ?, ?, ?, ?, ?)', [movieId, user, username, avatar, commentType, content, duration])
    }
    ctx.state.data = {}
  }
}
