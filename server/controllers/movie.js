// 登录授权接口
const DB = require('../utils/db.js')

module.exports = {
  list: async ctx => {
    ctx.state.data = await DB.query("Select * from movie");
  },
  detail: async ctx => {
    ctx.state.data = await DB.query("Select * from movie");
  }
}