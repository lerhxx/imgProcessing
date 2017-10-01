window.onload = () =>{
	let input = document.getElementById('file');
	let file = null;
	let screenShot = new ScreenShot();


	input.addEventListener('change', () => {
		if(input.files.length === 0) {
			return;
		}

		file = input.files[0];
		// if(!/^image\//.test(file.type)) {
		// 	console.log('please choose image');
		// 	return;
		// }

		// let reader = new FileReader();
		// reader.onload = () => {
		// 	let img = new Image();
		// 	img.onload = () => {
		// 	}
		// 	img.src = reader.result;
		// }
		// reader.readAsDataURL(file);

		screenShot.file2Image(file);

	})
}
class ScreenShot {
	constructor(opt={}) {
		this.opt = opt;
		this.opt.initSize = this.opt.initSize || 400;

		this.scale = 1;
		this.initCtx(this.opt);
		this.tool = new Tool(this, {
			containerId: 'container',
			event: {
				widthIn: 'onWidthChange',
				heightIn: 'onHeightChange',
				volumeIn: 'onVolumeChange',
				ratio: 'onRatioChange'
			},
			widthInLimit: {
				min: 0,
				max: this.opt.initSize
			},
			heightInLimit: {
				min: 0,
				max: this.opt.initSize
			},
			ratioInLimit: {
				min: 0
			}
		});
		this.isConstraint = this.tool.ratio.checked;

		this.imgInfo = {
			img: null,
			sx: 0,
			sy: 0,
			ex: 0,
			ey: 0,
			w: 0,
			h: 0,
			aspect: 1
		};
		this.count = 0;
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
		this.canvas.width = opt.initSize || this.opt.initSize;
		this.canvas.height = opt.initSize || this.opt.initSize;
		// 保存绘制区域尺寸
		this.WIDTH = this.canvas.width;
		this.HEIGHT = this.canvas.height;

		this.canvasEvent();
	}

	/*
	 * 调整 canvas 尺寸
	 */
	resize(w, h) {
		if(w <= 0 || h <= 0) {
			return;
		}

		this.isConstraint ? this.equalRatioResize(w, h) : this.unEqualRatioResize(w, h);

		this.scale = 1;
		this.setSize();
	}

	equalRatioResize(w, h) {
		let isShink = w > this.opt.initSize || h > this.opt.initSize;
		this.shrinkImg(w, h, isShink);
	}

	unEqualRatioResize(w, h) {
		this.WIDTH = w > this.opt.initSize ? this.opt.initSize : w;
		this.HEIGHT = h > this.opt.initSize ? this.opt.initSize : h;
	}

	resizeWidth(w) {
		w = parseFloat(w);
		if(this.isConstraint) {
			this.WIDTH = w.toFixed(2);
			this.HEIGHT = (w / this.imgInfo.aspect).toFixed(2);
		}else {
			this.WIDTH = w.toFixed(2);
		}
		this.setSize();
	}

	resizeHeight(h) {
		h = parseFloat(h);
		if(this.isConstraint) {
			this.WIDTH = (h * this.imgInfo.aspect).toFixed(2);
			this.HEIGHT = h.toFixed(2);
		}else {
			this.HEIGHT = h.toFixed(2);
		}
		this.setSize();
	}

	/*
	 * 缩小图片
	 */
	shrinkImg(w, h, isShink) {
		if(w > h) {
			this.WIDTH = isShink ? this.opt.initSize : w;
			this.HEIGHT = (h * this.WIDTH / w).toFixed(2);
		}else {
			this.HEIGHT = isShink ? this.opt.initSize : h;
			this.WDITH = (w * this.HEIGHT / h).toFixed(2);
		}
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

	scaleImg() {
		let imgInfo = this.imgInfo;
		imgInfo.sx = 0;
		imgInfo.sy = 0;
		imgInfo.ex = imgInfo.w / this.scale,
		imgInfo.ey = imgInfo.h / this.scale;
		imgInfo.cw = imgInfo.w / this.scale,
		imgInfo.ch = imgInfo.h / this.scale;
		console.log(this.imgInfo.sx)
		console.log(this.imgInfo.ex)
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

			let dX = e.clientX - this.start.x,
				dY = e.clientY - this.start.y,
				imgInfo = this.imgInfo,
				sx = imgInfo.sx - dX,
				sy = imgInfo.sy - dY,
				ex = imgInfo.ex - dX,
				ey = imgInfo.ey - dY;
if(this.count === 10) {
	console.log('WIDTH ' + this.WIDTH)
	console.log('sx ' + sx)
	console.log('imex ' + imgInfo.ex)
	console.log('imgWIDTH ' + imgInfo.w)
	console.log('cw ' + imgInfo.cw)
	console.log(sx <= imgInfo.w - this.WIDTH)
	this.count = 0;
}else {
	++this.count;
}

			if(sx >= 0 && sx <= imgInfo.w - this.WIDTH) {
				imgInfo.sx = sx;
			}
			if(sy >= 0 && sy <= imgInfo.h - this.HEIGHT) {
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
			let reader = new FileReader();
			reader.onload = () => {
				let img = new Image();
				img.onload = () => {
					this.updateImg(img);
					this.scale = 1;
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
			ex: w,
			ey: h,
			w: w,
			h: h,
			cw: this.WIDTH,
			ch: this.HEIGHT,
			aspect: w / h
		})

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
		this.ctx.drawImage(img, imgInfo.sx, imgInfo.sy, imgInfo.ex, imgInfo.ey, 0, 0, this.WIDTH, this.HEIGHT);
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

	on(event, value) {
		this[event] && this[event](value)
	}

	onWidthChange(val) {
		this.resizeWidth(val);
		this.drawImage();
	}

	onHeightChange(val) {
		this.resizeHeight(val);
		this.drawImage();
	}

	onVolumeChange(val) {
		console.log(val)
	}

	onRatioChange(val) {
		this.isConstraint = val;
		this.resizeWidth(this.WIDTH);
		this.drawImage();
	}

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
				min: -Infinity,
				max: Infinity
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
							<label>大小：</label><input type="text" id='volume' placeholder="0">KB
						</div>
						<div class='group'>
							<label><input type="checkbox" checked id='ratio'>约束比例</label>
						</div>`;
		div.innerHTML = children;
		fragment.appendChild(div);
		this.container.appendChild(fragment);

		this.widthIn = document.getElementById('width');
		this.heightIn = document.getElementById('height');
		this.volumeIn = document.getElementById('volume');
		this.ratio = document.getElementById('ratio');

		this.addEvent();
	}

	/*
	 * 添加事件
	 */
	addEvent() {
		this.limitInputNumberEvent(['widthIn', 'heightIn', 'volumeIn']);
		this.changeRatioEvent();
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
	 * 触发父元素事件
	 */
	emit(event, value) {
		this.parent && this.parent.on instanceof Function && this.parent.on(event, value);
	}

	on(event, val) {
		this[event] && this[event](val);
	}

	setSize(val={}) {
		if(val.w) {
			this.widthIn.value = (this.widthInLimit, val.w);
		}

		if(val.h) {
			this.heightIn.value = (this.heightInLimit, val.h);
		}
	}
}