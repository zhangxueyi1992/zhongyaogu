const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer:{
    proxy:{
      '/api/medical/all':{
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  chainWebpack(config) {
    config.plugin('html').tap((args) => { //标题
      args[0].title = '药材展示';
      return args;
    })
  }
})
