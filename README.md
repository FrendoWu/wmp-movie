# wmp-movie

### Udacity微信小程序纳米学位课程2项目--看看侃侃电影

### 项目简介

本项目为Udacity微信小程序纳米学位课程2项目--看看侃侃电影。主要功能包括推荐电影影评，电影列表和详情，编辑、收藏、影评， 影评列表和详情，查看收藏和发布的影评列表。


### 运行环境说明

由于本项目为学习项目，后台服务为`腾讯云微信小程序开发环境`，故在手机端需打开`调试模式`。



## 后端
数据库相关表可执行项目中的[movie.sql](https://github.com/NearZXH/wmp-movie/blob/master/movie.sql)导入

#### 数据字典

##### 电影信息 movie

| 中文          | 字段名      | 类型     | 说明                                |
| ------------- | ----------- | -------- | ----------------------------------- |
| ID            | id          | int(11) | 自增主键                            |
| 标题        | title       | varchar(255) |                |
| 图片url   | image       | varchar(255) |                                     |
| 标签        | category    | varchar(255) |                                     |
| 简介    | description | text |                                     |
| 记录生成事件 | create_time | decimal  | 自动生成         |

##### 影评信息 comment

| 中文          | 字段名      | 类型         | 说明                          |
| ------------- | ----------- | ------------ | ----------------------------- |
| ID            | id          | int(11)      | 自增主键                      |
| 电影ID        | movie_id    | int(11)      | 与movie表进行关联的id         |
| 用户ID        | user_id     | varchar(255) |                               |
| 用户名        | user_name   | varchar(255) |                               |
| 用户头像      | user_avatar | varchar(255) |                               |
| 影评类型      | type        | varchar(10)  | 文字：'text'; 音频: 'voice'   |
| 影评内容或url | content     | Text         | 文字: 评论内容，音频: 存储url |
| 音频时长      | duration    | int(5)       |                               |
| 记录生成时间  | create_time | datetime     | 自动生成                      |

##### 收藏信息 collection

| 中文          | 字段名      | 类型     | 说明                                |
| ------------- | ----------- | -------- | ----------------------------------- |
| ID            | id          | varchar2 | 自增主键                            |
| 用户ID        | user_id     | varchar2 |                                     |
| 影评ID        | comment_id  | decimal  | 与comment表进行关联的id             |
| 记录生成时间  | create_time | datetime | 自动生成                            |

### 接口列表

~~~javascript
// 获取电影列表
router.get('/movie', controllers.movie.list)
// 获取电影详情
router.get('/movie/:id', controllers.movie.detail)

// 随机获取一条影评
router.get('/comment/recommend', validationMiddleware, controllers.comment.getOne)
// 获取用户发布的影评
router.get('/comment/user', validationMiddleware, controllers.comment.userList)
// 提交影评
router.post('/comment', validationMiddleware, controllers.comment.add)
// 影评列表
router.get('/comment', controllers.comment.list)
// 获得影评详情
router.get('/comment/:id', validationMiddleware, controllers.comment.detail)

// 获得用户收藏列表
router.get('/collection', validationMiddleware, controllers.collection.list)
// 更新用户评论收藏状态
router.post('/collection', validationMiddleware, controllers.collection.update)
~~~



## 前端

#### 主要功能

- 小程序入口
  - 用户登录
  - 获取用户信息

- 首页

  - 随机向用户推荐一个影评
  - 下拉刷新
  - 跳转至`影评详情页`
  - 跳转至`电影详情页`

- 热门电影页

  - 获取电影列表
  - 跳转至`电影详情页`
  - 根据电影名称或者电影标签前台搜索电影
  - 下拉刷新

- 电影详情页

  - 获取电影详情
  - 跳转至`影评列表页`
  - 点击浏览大图
  - 获取用户对于该电影的影评，用于判断是否需要显示添加影评按钮
  - 对于该电影该用户有影评，跳转至该用户的`影评详情页`，否则跳转至`影评编辑页`

- 影评列表页

  - 获取影评列表

  - 播放音频
  - 跳转至`影评详情页`
  - 跳转至`首页`
  - 下拉刷新

- 影评编辑页/影评预览页

  - 根据`影评类型`进行不同的编辑
  - 获取用户录音授权
  - 播放音频
  - 在`预览`和`编辑`模式之间进行切换
  - 将音频上传至对象存储
  - 发布影评
  - 对于该电影该用户有影评，跳转至该用户的`影评详情页`，否则跳转至`影评编辑页`

- 影评详情页

  - 对于该电影该用户有影评，跳转至该用户的`影评详情页`，否则跳转至`影评编辑页
  - 收藏影评/取消收藏影评
  - 播放音频
  - 下拉刷新

- 我的

  - 查看收藏的影评
  - 查看发布的影评
  - 跳转至`影评详情页`

#### 界面截图
![screenshot](https://movies-1256897003.cos.ap-shanghai.myqcloud.com/screenshot/screenshot.png)

