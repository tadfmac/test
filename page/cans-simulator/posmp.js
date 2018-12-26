// posmp.js
//
// Simple Web Audio Sampler
//
// (CCby4.0) 2018 D.F.Mac.@TripArts Music

(function(){

const LOGLEVEL = 2; // 0: none, 1: errLog only, 2: inoLog+errLog
var instanceCount = 0;

posmp = function(opt) {
  return new Promise((resolve,reject)=>{
    infoLog("posmp() constructor");
    this.init(opt).then(()=>{
      infoLog("posmp("+this.uid+") constructor -> success");
      resolve(this);
    },(err)=>{
      errLog("posmp("+this.uid+") constructor -> failed");
      reject(null);
    });
  });
};

posmp.prototype = {
  init: function (src) {
    return new Promise((resolve,reject)=>{
      this.uid = instanceCount;
      instanceCount ++;
      infoLog("posmp("+this.uid+"):init() with:["+src+"]");
      window.AudioContext = window.AudioContext||window.webkitAudioContext;
      this.audioctx = new AudioContext();
      this.gain = this.audioctx.createGain();
      this.gain.gain.value = 0;
      this.gain.connect(this.audioctx.destination);
      this.buffer = null;
      if(src != null){
        this.src = src;
        this.load(this.src).catch((err)=>{
          errLog("posmp("+this.uid+"):init()->load() :"+this.src+" error");
          reject(err);
        }).then(()=>{
          infoLog("posmp("+this.uid+"):init()->load() :"+this.src+" done");
          resolve(this);
        });
      }else{
        infoLog("posmp("+this.uid+"):init() only -> done");
        resolve(this);
      }
    });
  },
  load : function(src){
    return new Promise((resolve,reject)=>{
      infoLog("posmp("+this.uid+"):load("+src+") start");
      fetch(src).then((res)=>{
        if(res.ok){
          infoLog("posmp("+this.uid+"):fetch() OK");
          return res.arrayBuffer();
        }else{
          throw new Error(res.status);
        }
      }).catch((e)=>{
        errLog("posmp("+this.uid+"):load() ERROR:"+e);
        reject(e);
      }).then((buf)=>{
        this.audioctx.decodeAudioData(buf).then((buffer)=>{
          infoLog("posmp("+this.uid+"):load() OK");
          this.buffer = buffer;
          resolve();
        },(err)=>{
          errLog("posmp("+this.uid+"):load() error: "+err);
          reject(err);
        });
      });
    });
  },
  play : function(opt){
    infoLog("posmp("+this.uid+"):play()");
    if(this.buffer != null){
      var src = this.audioctx.createBufferSource();
      src.playbackRate.value = 1.0;
      src.loopStart = 0;
      src.loop = false;
      src.loopEnd = this.buffer.duration;
      infoLog("posmp("+this.uid+")buffer.duration:"+this.buffer.duration);
      if(opt){
        if(typeof opt.rate === 'number'){
          src.playbackRate.value = opt.rate;
        }
        if(typeof opt.loop === 'number'){
          src.loop = opt.loop;
        }
        if(typeof opt.lstart === 'number'){
          src.loopStart = opt.lstart;
        }
        if(typeof opt.lend === 'number'){
          src.loopEnd = opt.lend;
        }
      }
      src.buffer = this.buffer;
      src.connect(this.audioctx.destination);
      src.start();
    }
  },
  wait: function (ms){
    infoLog("posmp("+this.uid+"):wait()");
    return new Promise((resolve)=>{setTimeout(resolve,ms);});
  },
};

var infoLog = (str)=>{};
var errLog = (str)=>{};
var setLogLevel = function(log){
  if(log > 1){
    infoLog = console.log.bind(console, "%c%s", "color:blue;");
  }
  if(log > 0){
    errLog = console.log.bind(console, "%c%s", "color:red;font-weight:bold;");
  }
};

setLogLevel(LOGLEVEL);

})();
