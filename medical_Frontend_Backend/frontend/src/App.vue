<template>
  <div class="posRight">
    <el-button @click="handleFullScreen" type="primary" v-if="isBtnShow" v-loading.fullscreen.lock="fullscreenLoading" id="float-btn">
      <el-icon :color="'white'">
        <FullScreen />
      </el-icon>
      <span class="icon-txt">全屏</span>
    </el-button>
  </div>
  <el-row :gutter="0">
    <el-col :span="3" v-for="(item, index) in mediaList" :key="index">
      <el-card shadow="always" :body-style="bodyStyle" class="imgWrap">
        <img :src="item.url" @click="handleMediaFullScreen(index)" :id="'basic-image'+index" origin-image="/opend.jpg" class="add-transition" />
        <!-- 右下角掩盖文字 -->
        <div class="cover-font" @click="handleMediaFullScreen(index)">{{item.name}}</div>
        <div :class="'itemIndex'+index+' animate'+(item.isFullScreen?' fullScreen':'')" v-if="item.isImgShow" @click="handleMediaFullScreen(index)">
          <!-- 音频进度条 -->
          <div class="progress-bar" v-if="audioPlayer || videoPlayer" :style="'width:'+progressBarWidth"></div>
          <img :src="item.picture" />
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import { FullScreen } from '@element-plus/icons-vue';
import { localCall } from '@/utils/function'

export default {
  name: 'App',
  components: {
    FullScreen
  },
  data() {
    return {
      isAllow: true,	      //防止多次点击出问题
      bodyStyle: {
        borderRadius: '0',
        padding: '0px',
        position: 'relative'
      },
      mediaList: null,
      fullscreenLoading: false,
      isBtnShow: true,
      originalPosition: null,
      originalSize: null,
      audioPlayer: null,    //音乐播放器
      progressBarWidth: 0,  //音频进度条进度
      videoPlayer: null,    //视频播放器
      videoSrc: null,       //视频地址
      item: null,           //当前项
      timer: null,          //定时器
      mediaBaseUrl: 'http://localhost:3000/',
      audioTime: 0,
      videoTime: 0,
      autoTime: 0,
      maxMedicalBox: 0,	    //最大显示药箱数量
      boxPic: null,	        //药箱图片
      jump: false		        //是否跳过音频
    }
  },
  mounted(){
    this.listenEscDown()
    this.getList()
  },
  methods:{
    prompt(err){
      this.message(this.unifiedErr(err) || 'unknow error')
    },

    unifiedErr(err){
        if(!err) err = 'unknow error'
        return typeof err == 'string' ? err : (err && (err.errMsg || err.message) || (typeof err == 'object' ? err.toString() : 'unknow error'))
    },

    getList(){
      this.fullscreenLoading = true
      localCall('/api/medical/all', {}).then(result=>{
        this.fullscreenLoading = false
        result = result.data
        if(result['code']){
          this.message(result['message'])
        }else{
          const retData = result['data']

          if(retData && retData['time']){
            this.audioTime = retData['time'].audioTime * 1000
            this.videoTime = retData['time'].videoTime * 1000
            this.autoTime = retData['time'].autoTime * 1000
            this.maxMedicalBox = retData['time'].cabinets
            this.boxPic = retData['time'].picture
            this.jump = retData['time'].jump
          }

          if(Array.isArray(retData?.['list'])){
            if(this.maxMedicalBox && this.maxMedicalBox - retData['list'].length > 0){
              const v = this.maxMedicalBox - retData['list'].length
              for(let i=0;i < v;i++){
                retData['list'] = retData['list'].concat({})
              }
            }

            retData['list'] = retData['list'].map(item => {
              item['url'] = this.mediaBaseUrl + this.boxPic || '/example/before.jpg'
              item['isFullScreen'] = false
              item['isImgShow'] = false
              if(item['picture']) item['picture'] = this.mediaBaseUrl + item['picture']
              if(item['audioUrl']) item['audioUrl'] = this.mediaBaseUrl + item['audioUrl']
              if(item['videoUrl']) item['videoUrl'] = this.mediaBaseUrl + item['videoUrl']
              return item
            })

            this.mediaList = retData['list']
          }
        }
      }).catch(err=>{
        this.message(err)
        this.fullscreenLoading = false
      })
    },

    enterFullscreen() {
      const elem = document.documentElement; // 获取文档根元素
      if (elem.requestFullscreen) {
        elem.requestFullscreen(); // 标准方法
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen(); // Firefox
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(); // Chrome、Safari 和 Opera
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen(); // IE/Edge
      }
      this.isBtnShow = false
    },

    // 退出全屏模式
    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen(); // 标准方法
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen(); // Firefox
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen(); // Chrome、Safari 和 Opera
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen(); // IE/Edge
      }
    },

    //点击全屏按钮
    handleFullScreen(){
      this.enterFullscreen()
    },

    //监听Esc事件
    listenEscDown(){
      const _this = this
      window.onresize = function(){
        if(!_this.checkFull()){
          if(!_this.isBtnShow) _this.isBtnShow = true
        }
      }
    },

    //判断浏览器是否处于全屏状态 (需要考虑兼容问题)
    checkFull(){
        //火狐浏览器
        var isFull = document.mozFullScreen||
        document.fullScreen ||
        //谷歌浏览器及Webkit内核浏览器
        document.webkitIsFullScreen ||
        document.webkitRequestFullScreen ||
        document.mozRequestFullScreen ||
        document.msFullscreenEnabled
        if(isFull === undefined) isFull = false
        return isFull
    },
    
    //点击媒体全屏
    handleMediaFullScreen(index){
      const _this = this;
      if(!this.mediaList[index]['picture']) return false;
      if(!this.isAllow) return false;
      this.isAllow = false;
      if(this.mediaList[index]['isImgShow']){
        // 缩小
        this.destoryAudio() //销毁音频播放器
        this.destoryVideo() //销毁视频播放器
        this.mediaList[index]['isFullScreen'] = !this.mediaList[index]['isFullScreen']
        const timeout = setTimeout(()=>{
          clearTimeout(timeout)
          this.mediaList[index]['isImgShow'] = !this.mediaList[index]['isImgShow']

          const ele = document.getElementById('basic-image'+index)
          const attr = ele.getAttribute("origin-image")
          const url = ele.src
          ele.src = attr
          ele.setAttribute('origin-image', url)
          const ts = setInterval(()=>{
            if(_this.isAllow){
              clearInterval(ts) 
            }else{
              _this.isAllow = true
            }
          }, 450)
        },500)
      }else{
        // 放大
        this.mediaList[index]['isImgShow'] = !this.mediaList[index]['isImgShow']
        const timeout = setTimeout(()=>{
          clearTimeout(timeout)
          const ele = document.getElementById('basic-image'+index)
          const attr = ele.getAttribute("origin-image")
          const url = ele.src
          ele.src = attr
          ele.setAttribute('origin-image', url)
          const t2 = setTimeout(()=>{
            clearTimeout(t2)
            this.mediaList[index]['isFullScreen'] = !this.mediaList[index]['isFullScreen']
            this.item = index
            //开始播放背景声音
            if(this.mediaList[index]['audioUrl'] && !this.jump){
              this.createMusicVideo(this.mediaList[index]['audioUrl'])
            }else if(this.mediaList[index]['videoUrl']){
              //开始播放音频
              this.handleVideoPlayer()
            }
            const ts = setInterval(()=>{
              if(_this.isAllow){
                clearInterval(ts)
              }else{
                _this.isAllow = true
              }
            }, 450)
          }, 500)
        },10)
      }
    },

    // 创建音乐播放器
    createMusicVideo(audioUrl){
      if(this.audioPlayer) return false;	//防止多次创建音频
      this.timer = setTimeout(()=>{
        clearTimeout(this.timer)
        if(!audioUrl){
          this.message('请提供音频文件')
          return
        }
        this.audioPlayer = new Audio(audioUrl);
        this.audioPlayer.onended = this.handleAudioEnded;
        this.audioPlayer.play();
        /* this.audioPlayer.addEventListener('timeupdate', ()=>{
            this.handleTimeUpdate('audio')
         }); */
      }, this.audioTime)
    },

    // 音频进度
    handleTimeUpdate(param){
      const obj = param === 'audio' ? this.audioPlayer : this.videoPlayer
      if(obj){
				const currentTime = obj.currentTime;
				const duration = obj.duration;
				const progress = (currentTime / duration) * 100;
				this.progressBarWidth = progress + '%'
      }
    },

    // 音频播放完成回调，如果有视频则开启视频
    handleAudioEnded(){
      this.destoryAudio()
      this.handleVideoPlayer()  // 等待10s播放视频
    },

    //销毁音频
    destoryAudio(){
      if(this.timer){
				clearTimeout(this.timer)
				this.timer = null
      }
      if(this.audioPlayer){
        this.progressBarWidth = 0
				this.audioPlayer.pause();
				this.audioPlayer.onended = null;
				// this.audioPlayer.removeEventListener('timeupdate', this.handleTimeUpdate);
				this.audioPlayer = null; // 销毁音乐播放器
				// this.item = null
      }
    },

    // 开始播放视频，需要修改，待定...
    handleVideoPlayer(){
      if(this.videoPlayer) return false;
      this.timer = setTimeout(()=>{
        clearTimeout(this.timer)
        if(this.item !== null && this.mediaList[this.item]['videoUrl']){
          this.videoPlayer = true //让视频播放器先加载
          const timer = setTimeout(()=>{
            clearTimeout(timer)
            this.videoPlayer = document.createElement('video')
            this.videoPlayer.src = this.mediaList[this.item]['videoUrl']
            this.videoPlayer.controls = false
            this.videoPlayer.style = 'position:fixed;z-index:66;'
            if(document.getElementsByClassName(`itemIndex${this.item}`).length){
							document.getElementsByClassName(`itemIndex${this.item}`)[0].append(this.videoPlayer)
						}
            this.videoPlayer.addEventListener('ended', this.handleVideoEnded)
            this.videoPlayer.play()
          }, 0)
        }else if(this.item !== null){
					// 无视频，直接关闭
					this.handleMediaFullScreen(this.item, 'x5')
				}
      }, this.videoTime)
    },

    // 视频播放完成后的回调
    handleVideoEnded(){
      const _this = this
      const timer = setTimeout(()=>{
        clearTimeout(timer)
        _this.destoryVideo()
      }, _this.autoTime)
    },

    destoryVideo(p = null){
      if(this.timer){
        clearTimeout(this.timer)
        this.timer = null
      }
      if(this.videoPlayer){
        this.progressBarWidth = 0
        this.videoPlayer.pause();
        this.videoPlayer.removeEventListener('ended', this.handleVideoEnded);
        // 移除video
        if(document.getElementsByClassName(`itemIndex${this.item}`).length){
          document.getElementsByClassName(`itemIndex${this.item}`)[0].removeChild(this.videoPlayer)
        }

        this.videoPlayer = null
        if(this.item !== null && !p) this.handleMediaFullScreen(this.item)	//自动关闭视频
        this.item = null
      }
    },

    // 消息提示
    message(message, type = "error"){
      this.$message({
          message,
          type
      });
    }
  }
}
</script>

<style scoped>
	img{
    width: 100%;
    display: block;
  }
  .el-card{
    --el-card-padding: 0 !important;
    --el-card-border-radius: 0 !important;
    border-radius: 0px;
    border-width: 0px;
  }
  .icon-txt{
    margin-left: 5px;
  }
	.posRight{
    text-align: center;
	}
	.imgWrap > div{
    position: relative;
	}
	.cover-font{
    position:absolute;
    width:90px;
    height:28px;
    line-height: 28px;
    background-color:white;
    right:9%;
    bottom:10%;
    z-index:5;
    display:flex;
    align-items: center;
    justify-content: center;
    font-weight: bolder;
    font-size: 22px;
    font-family: "STXingkai", "华文行楷", cursive;
	}
	.imgWrap > div > div.fullScreen > img{
    height: 100%;
    width: 100%;
    /* width: auto !important; */
	}
	.animate{
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 10;
    display: flex;
    justify-content: center;
    width: 0px;
    height: 0px;
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
    -ms-transition: all 0.5s;
    -moz-transition: all 0.5s;
    -o-transition: all 0.5s;
	}
	.fullScreen{
    left: 0;
    top:0;
    position: fixed;
    width: 100vw;
    height: 100vh;
	}
	
	.progress-bar{
    height: 3px;
    background-color: aqua;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 50;
	}
	video{
    height: 100vh;
    /* width: 100%; */
    /* background-color: white; */
    width: auto;
	}
	#float-btn{
    position:fixed;
    bottom:20px;
    right:20px;
    z-index: 50;
	}
	/* 图片放大 */
	.sim-anim-7{
    position: relative;
  }	
	.sim-anim-7 img{
    -webkit-transition: all 0.5s ;
    -moz-transition: all 0.5s;
    -o-transition: all 0.5s;
    transition: all 0.5s;
  }
	.sim-anim-7 img:nth-child(1), .sim-anim-7 img:nth-child(2), .sim-anim-7 img:nth-child(3){
    position: absolute;
	}
	.sim-anim-7 img:nth-child(4){
    position: relative;
	}
	.img1{
    -ms-transform: translate(0,-40%) scale(0.5,0.5);
    -webkit-transform: translate(0,-40%) scale(0.5,0.5);
    transform: translate(0,-40%) scale(0.5,0.5);
	}
	.img2{
    -ms-transform: translate(0,-20%) scale(0.7,0.7);
    -webkit-transform: translate(0,-20%) scale(0.7,0.7);
    transform: translate(0,-20%) scale(0.7,0.7); 
	}
	.img3{
    -ms-transform: scale(0.9,0.9);
    -webkit-transform: scale(0.9,0.9);
    transform: scale(0.9,0.9);
	}
	.img4{
    -ms-transform: translate(0,20%) scale(1.1,1.1);
    -webkit-transform: translate(0,20%) scale(1.1,1.1);
    transform: translate(0,20%) scale(1.1,1.1);
	}
	.sim-anim-7 > img:nth-child(1){
    z-index: 1;
  }			
	.sim-anim-7 > img:nth-child(2){
    z-index: 2;
  }
	.sim-anim-7 > img:nth-child(3){
    z-index: 3;
  }		
	.sim-anim-7 > img:nth-child(4){
    z-index: 4;
	}
	.add-transition{
    transition: opacity 0.5s ease;
    -webkit-transition: opacity 0.5s ease;
    -ms-transition: opacity 0.5s ease;
    -moz-transition: opacity 0.5s ease;
    -o-transition: opacity 0.5s ease;
	}
</style>
