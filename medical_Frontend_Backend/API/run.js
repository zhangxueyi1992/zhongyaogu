const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const KoaMulter = require('koa-multer');
const path = require('path');
const KoaStatic = require('koa-static');
const query = require('./model/model');

const app = new Koa();
const router = new Router();

//配置 KoaStatic 中间件用于提供静态文件服务
app.use(KoaStatic('./'));

// 配置文件上传的存储位置和文件名
const storage = KoaMulter.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // 文件存储在项目根目录下的 uploads 文件夹中
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

app.use(bodyParser({
  enableTypes: ['json'],
  jsonLimit: '5mb' // 设置JSON数据的最大限制大小
}));

// 登录
router.post('/api/login', async (ctx) => {
  let result;
  try{
    const postData = ctx.request.body;
    result = await query.userLogin(postData.username, postData.password);
  }catch(err){
    result = err;
  }
  ctx.body = result;
});

// 获取菜单
router.post('/api/menu', async (ctx) => {
  let result;
  try{
    result = await query.getLeftMenu();
  }catch(err){
    result = err;
  }
  ctx.body = result;
});

// 获取药材列表（包含查询）
router.post('/api/medical/list', async (ctx) => {
  let result;
  try{
    const postData = ctx.request.body;
    result = await Promise.all([
      query.getAllMedicalInfo(postData),
      query.getAllMedicalTotal(postData)
    ])
    result = {
      code: 0,
      message: '查询成功',
      data: {
        codeList: result[0],
        total: result[1]
      }
    }
  }catch(err){
    err = err && typeof err === 'object' ? (err.errMsg || '未知错误') : err
    result = {code: 1000, message: err, data:null}
  }
  ctx.body = result;
});

// 获取所有的mediacal信息
router.post('api/medical/all', async (ctx)=>{
  let result;
  try{
    result = await query.getAllMedicalData()
    result = {
      code: 0,
      message: typeof result == 'string'?result:'药品获取成功',
      data: typeof result == 'string' ? null : result
    }
  }catch(err){
    err = err && typeof err === 'object' ? (err.errMsg || '未知错误') : err
    result = {code: 1000, message: err, data:null}
  }
  ctx.body = result;
})

//编辑药材列表
router.post('/api/medical/edit', async (ctx) => {
  let result;
  try{
    const postData = ctx.request.body;
    result = await query.editMedicalInfo(postData)
    result = {
      code: 0,
      message: '处理成功',
      data: result
    }
  }catch(err){
    err = err && typeof err === 'object' ? (err.errMsg || '未知错误') : err
    result = {code: 1000, message: err, data:null}
  }
  ctx.body = result;
});

// 删除药材列表
router.post('/api/medical/delete', async (ctx) => {
  let result;
  try{
    const postData = ctx.request.body;
    result = await query.delMedicalInfo(postData)
    result = {
      code: 0,
      message: '药品删除成功',
      data: result
    }
  }catch(err){
    err = err && typeof err === 'object' ? (err.errMsg || '未知错误') : err
    result = {code: 1000, message: err, data:null}
  }
  ctx.body = result;
});

// 批量删除药材
router.post('/api/medical/deleteMulti', async (ctx) => {
  let result;
  try{
    const postData = ctx.request.body;
    result = await query.delMedicalMultiInfo(postData)
    result = {
      code: 0,
      message: '药品删除成功',
      data: result
    }
  }catch(err){
    err = err && typeof err === 'object' ? (err.errMsg || '未知错误') : err
    result = {code: 1000, message: err, data:null}
  }
  ctx.body = result;
});


// 系统信息
router.post('/api/medical/sysconfig', async (ctx)=>{
  let result;
  try{
    const postData = ctx.request.body;
    result = await query.dealSysInfo(postData)
    result = {
      code: 0,
      message: typeof result == 'string'?result:'药品获取成功',
      data: typeof result == 'string' ? null : result
    }
  }catch(err){
    err = err && typeof err === 'object' ? (err.errMsg || '未知错误') : err
    result = {code: 1000, message: err, data:null}
  }
  ctx.body = result;
})

// 个人中心
router.post('/api/medical/center', async (ctx)=>{
  let result;
  try{
    const postData = ctx.request.body;
    result = await query.centerInfo(postData);
    result = {
      code: 0,
      message: typeof result == 'string'?result:'个人中心更新成功',
      data: typeof result == 'string' ? null : result
    }
  }catch(err){
    err = err && typeof err === 'object' ? (err.errMsg || '未知错误') : err
    result = {code: 1000, message: err, data:null}
  }
  ctx.body = result;
})

router.post('/api/medical/all', async (ctx) => {
  let result;
  try{
    const postData = ctx.request.body;
    result = await Promise.all([
      query.getAllMedicalData(),
      query.dealSysInfo()
    ])
    result = {
      code: 0,
      message: '查询成功',
      data: {
        list: result[0],
        time: result[1]
      }
    }
  }catch(err){
    err = err && typeof err === 'object' ? (err.errMsg || '未知错误') : err
    result = {code: 1000, message: err, data:null}
  }
  ctx.body = result;
});

// 上传文件
const upload = KoaMulter({ storage: storage });

// 处理文件上传的路由
router.post('/api/upload', upload.single('file'), (ctx) => {
  const file = ctx.req.file; // 从请求中获取上传的文件信息
  // 执行你的处理逻辑，例如将文件保存到特定位置或对文件进行进一步处理
  ctx.body = {file}; // 返回上传成功的响应
});

// 使用路由中间件
app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务器
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}, Please don't shutdown it !!!`);
}).timeout = 60000;
