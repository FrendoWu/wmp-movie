// 登录授权接口
const DB = require('../utils/db.js')

module.exports = {
  list: async ctx => {
    ctx.state.data = await DB.query("Select * from movie");
  },
  detail: async ctx => {
    
    movieId = + ctx.params.id
    if (!isNaN(movieId)) {
      ctx.state.data = (await DB.query("Select * from movie where id = ?", [movieId]))[0]
    } else {
      ctx.state.data = {}
    }
  }
}