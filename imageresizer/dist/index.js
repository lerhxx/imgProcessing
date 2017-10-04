"use strict";function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function t(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,i,n){return i&&t(e.prototype,i),n&&t(e,n),e}}();window.onload=function(){var t=document.getElementById("file"),e=new ScreenShot;t.addEventListener("change",function(){0!==t.files.length&&e.file2Image(t.files[0]).then(function(t){e.updateImg(t),e.dispatch("toogleDownloadBtnStatus",!1)}).catch(function(i){alert(i),e.clearImg(),t.value="",e.dispatch("toogleDownloadBtnStatus",!0)})})};var ScreenShot=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};_classCallCheck(this,t),this.opt=e,this.opt.limitSize=this.opt.limitSize||500,this.initCtx(this.opt),this.tool=new Tool(this,{containerId:"container",event:{widthIn:"onWidthChange",heightIn:"onHeightChange",volumeIn:"onVolumeChange",ratio:"onRatioChange",download:"onDownLoad"},widthInLimit:{min:0,max:this.opt.limitSize},heightInLimit:{min:0,max:this.opt.limitSize},ratioInLimit:{min:0}}),this.isConstraint=this.tool.ratio.checked,this.volume=0,this.imgInfo={img:null,sx:0,sy:0,sw:0,sh:0,w:0,h:0}}return _createClass(t,[{key:"initCtx",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.opt;this.canvas=document.getElementById(t.id||"canvas"),this.canvas||(this.canvas=document.createElement("canvas"),document.body.appendChild(this.canvas)),this.ctx=this.canvas.getContext("2d"),this.WIDTH=0,this.HEIGHT=0,this.resizeCanvas(),this.canvasEvent(),this.polyfillBlob()}},{key:"resize",value:function(t,e){t<=0||e<=0||(this.isConstraint?this.equalRatioResize(t,e):this.unEqualRatioResize(t,e),this.resizeCanvas())}},{key:"resizeCanvas",value:function(){this.canvas.width=this.WIDTH,this.canvas.height=this.HEIGHT,this.setSize()}},{key:"equalRatioResize",value:function(t,e){var i=t>this.opt.limitSize||e>this.opt.limitSize;this.shrinkImg(t,e,i)}},{key:"shrinkImg",value:function(t,e,i){t>e?(this.WIDTH=i?this.opt.limitSize:t,this.HEIGHT=(e*this.WIDTH/t).toFixed(2)):(this.HEIGHT=i?this.opt.limitSize:e,this.WDITH=(t*this.HEIGHT/e).toFixed(2))}},{key:"unEqualRatioResize",value:function(t,e){var i=this.opt.limitSize;this.WIDTH=t>i?i:t,this.HEIGHT=e>i?i:e}},{key:"resizeWidth",value:function(t){t=parseFloat(t),this.isConstraint?(this.WIDTH=t.toFixed(2),this.HEIGHT=(t/this.imgInfo.aspect).toFixed(2)):this.WIDTH=t.toFixed(2),this.resizeCanvas(this.WIDTH,this.HEIGHT)}},{key:"resizeHeight",value:function(t){t=parseFloat(t),this.isConstraint?(this.WIDTH=(t*this.imgInfo.aspect).toFixed(2),this.HEIGHT=t.toFixed(2)):this.HEIGHT=t.toFixed(2),this.resizeCanvas(this.WIDTH,this.HEIGHT)}},{key:"setSize",value:function(){this.dispatch("setSize",{w:this.WIDTH,h:this.HEIGHT})}},{key:"canvasEvent",value:function(){this.wheelEvent(),this.mouseDown(),this.mouseMove(),this.mouseUp()}},{key:"wheelEvent",value:function(){var t=this;this.canvas.addEventListener("mousewheel",function(e){t.scale+=e.wheelDelta>0?.1:t.scale>1?-.1:0,t.scaleImg()},{passive:!0})}},{key:"scaleImg",value:function(){var t=this.imgInfo;t.sw=t.w/this.scale,t.sh=t.h/this.scale,t.w-t.sw<t.sx&&(t.sx=t.w-t.sw),t.h-t.sh<t.sy&&(t.sy=t.h-t.sh),this.drawImage()}},{key:"mouseDown",value:function(){var t=this;this.canvas.addEventListener("mousedown",function(e){t.canDrag=!0,t.start={x:e.clientX,y:e.clientY}})}},{key:"mouseMove",value:function(){var t=this;this.canvas.addEventListener("mousemove",function(e){if(t.canDrag){var i=t.imgInfo,n=i.sx-e.clientX+t.start.x,a=i.sy-e.clientY+t.start.y;n>=0&&n<=i.w-i.sw&&(i.sx=n),a>=0&&a<=i.h-i.sh&&(i.sy=a),t.drawImage(),t.start={x:e.clientX,y:e.clientY}}})}},{key:"mouseUp",value:function(){var t=this;this.canvas.addEventListener("mouseup",function(e){t.canDrag=!1})}},{key:"file2Image",value:function(t){return new Promise(function(e,i){/^image\//.test(t.type)||i("请选择图片");var n=new FileReader;n.onload=function(){var t=new Image;t.onload=function(){e(t)},t.onerror=function(t){i(t)},t.src=n.result},n.readAsDataURL(t)})}},{key:"updateImg",value:function(t){var e=t.width,i=t.height;Object.assign(this.imgInfo,{img:t,sx:0,sy:0,sw:e,sh:i,w:e,h:i,aspect:e/i}),this.scale=1,this.resize(e,i),this.drawImage()}},{key:"drawImage",value:function(t){var e=this.imgInfo;(t=t||e&&e.img)&&(this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.ctx.drawImage(t,e.sx,e.sy,e.sw,e.sh,0,0,this.WIDTH,this.HEIGHT))}},{key:"isImage",value:function(t){return!!/^image\//.test(t.type)||(console.log("please select a image"),!1)}},{key:"on",value:function(t,e){this[t]&&this[t](e)}},{key:"onWidthChange",value:function(t){this.resizeWidth(t),this.drawImage()}},{key:"onHeightChange",value:function(t){this.resizeHeight(t),this.drawImage()}},{key:"onVolumeChange",value:function(t){this.volume=t}},{key:"onRatioChange",value:function(t){this.isConstraint=t,this.resizeWidth(this.WIDTH),this.drawImage()}},{key:"onDownLoad",value:function(t){this.imgInfo.img?this.canvas2Blob(t[0],t[1]).then(function(e){var i=document.createElement("a"),n=URL.createObjectURL(e),a=document.createEvent("MouseEvents");a.initMouseEvent("click",!1,!1),i.download="download."+t[0],i.href=n,i.dispatchEvent(a),URL.revokeObjectURL(n)}).catch(function(t){alert(t)}):alert("请选择图片")}},{key:"canvas2Blob",value:function(t,e){var i=this;return new Promise(function(n,a){i.canvas.toBlob(function(t){i.dispatch("changeDialogStatus",!1),n(t)},"image/"+t,e)})}},{key:"polyfillBlob",value:function(){var t=this;HTMLCanvasElement.prototype.toBlob||Object.defineProperty(HTMLCanvasElement.prototype,"toBlob",{value:function(e,i,n){for(var a=atob(t.toDataURL(i,n).split(",")[1]),s=a.length,o=new Unit8Array(s),h=0;h<s;++h)o[h]=a.charCodeAt(h);e(new Blob(o,{type:i||"image/png"}))}})}},{key:"clearImg",value:function(){this.imgInfo.img=null,this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)}},{key:"dispatch",value:function(t,e){this.tool&&this.tool.on instanceof Function&&this.tool.on(t,e)}}]),t}(),Tool=function(){function t(e){var i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};_classCallCheck(this,t),this.parent=e,this.opt={event:{},widthInLimit:{min:-1/0,max:1/0},heightInLimit:{min:-1/0,max:1/0},volumeInLimit:{min:0,max:1}},Object.assign(this.opt,i),this.container=i.containerId?document.getElementById(i.containerId):document.body,this.init()}return _createClass(t,[{key:"init",value:function(){var t=document.createDocumentFragment(),e=document.createElement("div");e.innerHTML="<div class='group size-group'>\n\t\t\t\t\t\t\t<label>宽度：</label><input type=\"text\" id='width' placeholder=\"0\">px\n\t\t\t\t\t\t\t<label>高度：</label><input type=\"text\" id='height' placeholder=\"0\">px\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class='group'>\n\t\t\t\t\t\t\t<label><input type=\"checkbox\" checked id='ratio'>约束比例</label>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class='group'>\n\t\t\t\t\t\t\t<button id='savePNG' disabled>保存为PNG</button>\n\t\t\t\t\t\t\t<button id='saveJPEG' disabled>保存为JPEG</button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class='dialog' id='dialog' style='visibility: hidden'>\n\t\t\t\t\t\t\t<div class='dialog-content'>\n\t\t\t\t\t\t\t\t<div class='dialog-head'>\n\t\t\t\t\t\t\t\t\t<h5>请选择</h5>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class='dialog-body'>\n\t\t\t\t\t\t\t\t\t<label>压缩质量：</label><input type=\"text\" id='volume' value='0.92'>kb\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class='dialog-footer'>\n\t\t\t\t\t\t\t\t\t<button id='dialog-sure'>确定</button>\n\t\t\t\t\t\t\t\t\t<button id='dialog-cancle'>取消</button>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>",t.appendChild(e),this.container.appendChild(t),this.widthIn=document.getElementById("width"),this.heightIn=document.getElementById("height"),this.ratio=document.getElementById("ratio"),this.dialog=document.getElementById("dialog"),this.volumeIn=document.getElementById("volume"),this.sureBtn=document.getElementById("dialog-sure"),this.cancleBtn=document.getElementById("dialog-cancle"),this.PNG=document.getElementById("savePNG"),this.JPEG=document.getElementById("saveJPEG"),this.addEvent()}},{key:"addEvent",value:function(){this.limitInputNumberEvent(["widthIn","heightIn","volumeIn"]),this.changeRatioEvent(),this.typeBtnEvent(["PNG","JPEG"]),this.dialogEvent()}},{key:"limitInputNumberEvent",value:function(t){if(!(!t instanceof Array)){var e=this;t.forEach(function(t){e[t]&&e[t].addEventListener("blur",function(){this.value=e.inRangeVal(e.opt[t+"Limit"],this.value),e.opt.event[t]&&e.emit(e.opt.event[t],this.value)})})}}},{key:"inRangeVal",value:function(t,e){var i=parseFloat(e)||0;return i>t.max?t.max:i<t.min?t.min:i}},{key:"changeRatioEvent",value:function(){var t=this;t.ratio.addEventListener("change",function(){t.opt.event.ratio&&t.emit(t.opt.event.ratio,this.checked)})}},{key:"typeBtnEvent",value:function(t){if(!(!t instanceof Array)){var e=this;t.forEach(function(t){e[t]&&e[t].addEventListener("click",function(){"jpeg"===(t=t.toLowerCase())||"webp"===t?e.compress():e.download(t)})})}}},{key:"download",value:function(t,e){this.opt.event.download&&this.emit(this.opt.event.download,[t,e])}},{key:"compress",value:function(){this.changeDialogStatus(!0)}},{key:"dialogEvent",value:function(){var t=this,e=this;this.dialog&&this.dialog.addEventListener("click",function(t){t.target===this&&e.changeDialogStatus(!1)}),this.sureBtn&&this.sureBtn.addEventListener("click",function(){t.download("jpeg",t.volumeIn.value)}),this.cancleBtn&&this.cancleBtn.addEventListener("click",function(){t.changeDialogStatus(!1)})}},{key:"changeDialogStatus",value:function(t){this.dialog.style.visibility=t?"visible":"hidden"}},{key:"toogleDownloadBtnStatus",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];(arguments.length>1&&void 0!==arguments[1]?arguments[1]:["PNG","JPEG"]).forEach(function(i){t[i].disabled=e})}},{key:"emit",value:function(t,e){this.parent&&this.parent.on instanceof Function&&this.parent.on(t,e)}},{key:"on",value:function(t,e){this[t]&&this[t](e)}},{key:"setSize",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};t.w&&(this.widthIn.value=(this.widthInLimit,t.w)),t.h&&(this.heightIn.value=(this.heightInLimit,t.h))}}]),t}();