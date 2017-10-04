window.onload = () =>{
	let input = document.getElementById('file');
	let screenShot = new ScreenShot();

	input.addEventListener('change', () => {
		if(input.files.length === 0) {
			return;
		}

		screenShot.file2Image(input.files[0]).then(img => {
			screenShot.updateImg(img);
			screenShot.dispatch('toogleDownloadBtnStatus', false);
		}).catch(err => {
			alert(err);
			screenShot.clearImg();
			input.value = '';
			screenShot.dispatch('toogleDownloadBtnStatus', true);
		})

	})
}
class ScreenShot {
	constructor(opt={}) {
		this.opt = opt;
		this.opt.limitSize = this.opt.limitSize || 500;

		this.initCtx(this.opt);
		this.tool = new Tool(this, {
			containerId: 'container',
			event: {
				widthIn: 'onWidthChange',
				heightIn: 'onHeightChange',
				volumeIn: 'onVolumeChange',
				ratio: 'onRatioChange',
				download: 'onDownLoad'
			},
			widthInLimit: {
				min: 0,
				max: this.opt.limitSize
			},
			heightInLimit: {
				min: 0,
				max: this.opt.limitSize
			},
			ratioInLimit: {
				min: 0
			}
		});

		this.isConstraint = this.tool.ratio.checked;
		this.volume = 0;         // 图像大小

		this.imgInfo = {
			img: null,
			sx: 0,
			sy: 0,
			sw: 0,        // 图片绘制宽度
			sh: 0,        // 图片绘制高度
			w: 0,         // 原图宽
			h: 0,         // 原图高
		};
	}

	/*
	 * 创建 canvas && ctx
	 * @param {Object} opt canvas 的 id、 width 和 height
	 */
	initCtx(opt=this.opt) {
		this.canvas = document.getElementById(opt.id || 'canvas');
		if(!this.canvas) {
			this.canvas = document.createElement('canvas');
			document.body.appendChild(this.canvas);
		}

		this.ctx = this.canvas.getContext('2d');
		// 保存 canvas 尺寸
		this.WIDTH = 0;
		this.HEIGHT = 0;

		this.resizeCanvas()
		this.canvasEvent();
		this.polyfillBlob();
	}

	/*
	 * 调整 canvas 尺寸
	 */
	resize(w, h) {
		if(w <= 0 || h <= 0) {
			return;
		}

		this.isConstraint ? this.equalRatioResize(w, h) : this.unEqualRatioResize(w, h);
		this.resizeCanvas()
	}

	resizeCanvas() {
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;
		this.setSize();
	}

	// 等比缩放
	equalRatioResize(w, h) {
		let isShink = w > this.opt.limitSize || h > this.opt.limitSize;
		this.shrinkImg(w, h, isShink);
	}

	/*
	 * 加载图片后缩小图片
	 */
	shrinkImg(w, h, isShink) {
		if(w > h) {
			this.WIDTH = isShink ? this.opt.limitSize : w;
			this.HEIGHT = (h * this.WIDTH / w).toFixed(2);
		}else {
			this.HEIGHT = isShink ? this.opt.limitSize : h;
			this.WDITH = (w * this.HEIGHT / h).toFixed(2);
		}
	}

	/*
	 * 不等比缩放
	 */
	unEqualRatioResize(w, h) {
		let limitSize = this.opt.limitSize;
		this.WIDTH = w > limitSize ? limitSize : w;
		this.HEIGHT = h > limitSize ? limitSize : h;
	}

	/*
	 * 等比缩放，以宽度为准
	 */
	resizeWidth(w) {
		w = parseFloat(w);
		if(this.isConstraint) {
			this.WIDTH = w.toFixed(2);
			this.HEIGHT = (w / this.imgInfo.aspect).toFixed(2);
		}else {
			this.WIDTH = w.toFixed(2);
		}
		this.resizeCanvas(this.WIDTH, this.HEIGHT)
	}

	/*
	 * 等比缩放，以高度为准
	 */
	resizeHeight(h) {
		h = parseFloat(h);
		if(this.isConstraint) {
			this.WIDTH = (h * this.imgInfo.aspect).toFixed(2);
			this.HEIGHT = h.toFixed(2);
		}else {
			this.HEIGHT = h.toFixed(2);
		}
		this.resizeCanvas(this.WIDTH, this.HEIGHT)
	}

	setSize() {
		this.dispatch('setSize', {
			w: this.WIDTH,
			h: this.HEIGHT
		})
	}

	/*
	 * canvas 添加事件
	 */
	canvasEvent() {
		this.wheelEvent();
		this.mouseDown();
		this.mouseMove();
		this.mouseUp();
	}

	/*
	 * canvas 添加鼠标滚轮事件
	 */
	wheelEvent() {
		this.canvas.addEventListener('mousewheel', (e) =>{
			this.scale += e.wheelDelta > 0 ? 0.1 : this.scale > 1 ? -0.1 : 0;
			this.scaleImg();
		}, {
			passive: true
		})
	}

	/*
	 * 缩放图片
	 */
	scaleImg() {
		let imgInfo = this.imgInfo;
		imgInfo.sw = imgInfo.w / this.scale,
		imgInfo.sh = imgInfo.h / this.scale;

		// 检查缩放之后图片是否超出范围
		if(imgInfo.w - imgInfo.sw < imgInfo.sx) {
			imgInfo.sx = imgInfo.w - imgInfo.sw;
		}
		if(imgInfo.h - imgInfo.sh < imgInfo.sy) {
			imgInfo.sy = imgInfo.h - imgInfo.sh;
		}
		this.drawImage();
	}

	/*
	 * canvas 添加鼠标事件
	 */
	mouseDown() {
		this.canvas.addEventListener('mousedown', (e) =>{
			this.canDrag = true;
			this.start = {
				x: e.clientX,
				y: e.clientY
			}
		})
	}

	mouseMove() {
		this.canvas.addEventListener('mousemove', (e) =>{
			if(!this.canDrag) {
				return;
			}

			let imgInfo = this.imgInfo,
				sx = imgInfo.sx - e.clientX + this.start.x,
				sy = imgInfo.sy - e.clientY + this.start.y;

			if(sx >= 0 && sx <= imgInfo.w - imgInfo.sw) {
				imgInfo.sx = sx;
			}
			if(sy >= 0 && sy <= imgInfo.h - imgInfo.sh) {
				imgInfo.sy = sy;
			}

			this.drawImage();

			this.start = {
				x: e.clientX,
				y: e.clientY
			}
		})
	}

	mouseUp() {
		this.canvas.addEventListener('mouseup', (e) =>{
			this.canDrag = false;
		})
	}

	/*
	 * 将 File 转换成 Image
	 */
	file2Image(file) {
		return new Promise((resolve, reject) => {
			if(!/^image\//.test(file.type)) {
				reject('请选择图片')
			}
			let reader = new FileReader();
			reader.onload = () => {
				let img = new Image();
				img.onload = () => {
					resolve(img);
				}
				img.onerror = (err) => {
					reject(err);
				}
				img.src = reader.result;
			}
			reader.readAsDataURL(file);
		})
	}

	/*
	 * 更新 img 相关信息
	 */
	updateImg(img) {
		let w = img.width,
			h = img.height;

		Object.assign(this.imgInfo, {
			img: img,
			sx: 0,
			sy: 0,
			sw: w,
			sh: h,
			w: w,
			h: h,
			aspect: w / h
		})
		this.scale = 1;

		this.resize(w, h);
		this.drawImage();
	}

	/*
	 * 绘制图像
	 */
	drawImage(img) {
		let imgInfo = this.imgInfo;
		img = img || imgInfo && imgInfo.img;

		if(!img) {
			return;
		}

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.drawImage(img, imgInfo.sx, imgInfo.sy, imgInfo.sw, imgInfo.sh, 0, 0, this.WIDTH, this.HEIGHT);
	}

	/*
	 * 判断是否为 Image
	 */
	isImage(file) {
		if(!/^image\//.test(file.type)) {
			console.log('please select a image');
			return false;
		}
		return true;
	}

	/*
	 * 响应 tool 触发的事件
	 */
	on(event, value) {
		this[event] && this[event](value)
	}

	/*
	 * 调整 canvas 宽度
	 */
	onWidthChange(val) {
		this.resizeWidth(val);
		this.drawImage();
	}

	/*
	 * 调整 canvas 高度
	 */
	onHeightChange(val) {
		this.resizeHeight(val);
		this.drawImage();
	}

	/*
	 * 图片体积
	 */
	onVolumeChange(val) {
		this.volume = val;
	}

	/*
	 * 图像是否成比例
	 */
	onRatioChange(val) {
		this.isConstraint = val;
		this.resizeWidth(this.WIDTH);
		this.drawImage();
	}

	/*
	 * 下载图片
	 */
	onDownLoad(opt) {
		if(!this.imgInfo.img) {
			alert('请选择图片');
			return;
		}

		this.canvas2Blob(opt[0], opt[1]).then(blob => {
			let a = document.createElement('a');
			let url = URL.createObjectURL(blob);

			let event = document.createEvent('MouseEvents');
			event.initMouseEvent('click', false, false);

			a.download = `download.${opt[0]}`;
			a.href = url;

			a.dispatchEvent(event);
			URL.revokeObjectURL(url);
		}).catch(err => {
			alert(err)
		})
	}

	/*
	 * 图像转换为 Blob
	 */
	canvas2Blob(type, encoderOption) {
		return new Promise((resolve, reject) => {
			this.canvas.toBlob((blob) => {
				this.dispatch('changeDialogStatus', false);
				resolve(blob);
			}, `image/${type}`, encoderOption)
		})
	}

	/*
	 * polyfill Blob
	 * https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/toBlob
	 */
	polyfillBlob() {
		if(!HTMLCanvasElement.prototype.toBlob) {
			Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
				value: (cb, type, quality) => {
					let binStr = atob(this.toDataURL(type, quality).split(',')[1]),
						len = binStr.length,
						arr = new Unit8Array(len);

					for(let i = 0; i < len; ++i) {
						arr[i] = binStr.charCodeAt(i);
					}

					cb(new Blob(arr, {type: type || 'image/png'}));
				}
			})
		}
	}

	clearImg() {
		this.imgInfo.img = null;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	/*
	 * 触发 tool 事件
	 */
	dispatch(event, val) {
		this.tool && this.tool.on instanceof Function && this.tool.on(event, val);
	}
}

class Tool {
	/*
	 * @param {Object} opt={
		 	containerId, 
		 	event: {widthIn, heightIn, volumeIn, ratio},
		 	widthInLimit: {min, max},
		 	heightInLimit: {min, max},
		 	volumeInLimit: {min, max}
	 	}
	 */
	constructor(parent, opt={}) {
		this.parent = parent;
		this.opt = {
			event: {},
			widthInLimit: {
				min: -Infinity,
				max: Infinity
			},
			heightInLimit: {
				min: -Infinity,
				max: Infinity
			},
			volumeInLimit: {
				min: 0,
				max: 1
			}
		}
		Object.assign(this.opt, opt);

		this.container = opt.containerId ? document.getElementById(opt.containerId) : document.body;

		this.init();
	}

	/*
	 * 初始化工具栏
	 */
	init() {
		let fragment = document.createDocumentFragment(),
			div = document.createElement('div'),
			children = `<div class='group size-group'>
							<label>宽度：</label><input type="text" id='width' placeholder="0">px
							<label>高度：</label><input type="text" id='height' placeholder="0">px
						</div>
						<div class='group'>
							<label><input type="checkbox" checked id='ratio'>约束比例</label>
						</div>
						<div class='group'>
							<button id='savePNG' disabled>保存为PNG</button>
							<button id='saveJPEG' disabled>保存为JPEG</button>
						</div>
						<div class='dialog' id='dialog' style='visibility: hidden'>
							<div class='dialog-content'>
								<div class='dialog-head'>
									<h5>请选择</h5>
								</div>
								<div class='dialog-body'>
									<label>压缩质量：</label><input type="text" id='volume' value='0.92'>kb
								</div>
								<div class='dialog-footer'>
									<button id='dialog-sure'>确定</button>
									<button id='dialog-cancle'>取消</button>
								</div>
							</div>
						</div>`;

		div.innerHTML = children;
		fragment.appendChild(div);
		this.container.appendChild(fragment);

		this.widthIn = document.getElementById('width');
		this.heightIn = document.getElementById('height');
		this.ratio = document.getElementById('ratio');

		this.dialog = document.getElementById('dialog');
		this.volumeIn = document.getElementById('volume');
		// this.newVolume = document.getElementById('newVolume');
		this.sureBtn = document.getElementById('dialog-sure');
		this.cancleBtn = document.getElementById('dialog-cancle');

		this.PNG = document.getElementById('savePNG');
		this.JPEG = document.getElementById('saveJPEG');

		this.addEvent();
	}

	/*
	 * 添加事件
	 */
	addEvent() {
		this.limitInputNumberEvent(['widthIn', 'heightIn', 'volumeIn']);
		this.changeRatioEvent();
		this.typeBtnEvent(['PNG', 'JPEG']);
		this.dialogEvent();
	}

	/*
	 * 对 input 限制大小
	 */
	limitInputNumberEvent(arr) {
		if(!arr instanceof Array) {
			return;
		}

		let self = this;
		arr.forEach(input => {
			self[input] && self[input].addEventListener('blur', function() {
				this.value = self.inRangeVal(self.opt[`${input}Limit`], this.value);

				self.opt.event[input] && self.emit(self.opt.event[input], this.value)
			})
		})
	}

	/*
	 * val 是否在 limit 范围内
	 */
	inRangeVal(limit, val) {
		let value = parseFloat(val) || 0;
		return value > limit.max ? limit.max : value < limit.min ? limit.min : value;
	}

	/*
	 * checkbox 事件
	 */
	changeRatioEvent() {
		let self = this;
		self.ratio.addEventListener('change', function() {
			self.opt.event.ratio && self.emit(self.opt.event.ratio, this.checked);
		})
	}

	/*
	 * 绑定下载按钮时间
	 */
	typeBtnEvent(arr) {
		if(!arr instanceof Array) {
			return;
		}

		let self = this;
		arr.forEach(type => {
			self[type] && self[type].addEventListener('click', function() {
				type = type.toLowerCase();
				if(type === 'jpeg' || type === 'webp') {
					self.compress();
				}else {
					self.download(type);
				}
			})
		})
	}

	/*
	 * 下载
	 */
	download(type, encoderOption) {
		this.opt.event.download && this.emit(this.opt.event.download, [type, encoderOption]);
	}

	/*
	 * 压缩
	 */
	compress() {
		this.changeDialogStatus(true);
	}

	/*
	 * 绑定 dialog 事件
	 */
	dialogEvent() {
		let self = this;
		this.dialog && this.dialog.addEventListener('click', function(e) {
			if(e.target === this) {
				self.changeDialogStatus(false);
			}
		})

		this.sureBtn && this.sureBtn.addEventListener('click', () => {
			this.download('jpeg', this.volumeIn.value)
		})

		this.cancleBtn && this.cancleBtn.addEventListener('click', () => {
			this.changeDialogStatus(false);
		})
	}

	/*
	 * 改变 dialog visibility
	 */
	changeDialogStatus(display) {
		this.dialog.style.visibility = display ? 'visible' : 'hidden';
	}

	toogleDownloadBtnStatus(flag=false, arr=['PNG', 'JPEG']) {
		arr.forEach(btn => {
			this[btn].disabled = flag;
		})
	}
 
	/*
	 * 触发父元素事件
	 */
	emit(event, value) {
		this.parent && this.parent.on instanceof Function && this.parent.on(event, value);
	}

	/*
	 * 响应父元素事件
	 */
	on(event, val) {
		this[event] && this[event](val);
	}

	/*
	 * 调整宽高
	 */
	setSize(val={}) {
		if(val.w) {
			this.widthIn.value = (this.widthInLimit, val.w);
		}

		if(val.h) {
			this.heightIn.value = (this.heightInLimit, val.h);
		}
	}
}