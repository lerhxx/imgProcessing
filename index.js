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
		opt = Object.assign({
			id: 'canvas',
			width: 0,
			height: 0,
		}, opt)

		this.scale = 1;
		this.initCtx(opt);
	}

	/*
	 * 创建 canvas && ctx
	 * @param {Object} opt canvas 的 id、 width 和 height
	 */
	initCtx(opt={}) {
		this.canvas = document.getElementById(opt.id);
		if(!this.canvas) {
			this.canvas = document.createElement('canvas');
			document.body.appendChild(this.canvas);
		}

		this.ctx = this.canvas.getContext('2d');
		// 保存 canvas 尺寸
		this.WIDTH = opt.width;
		this.HEIGHT = opt.height;

		this.resize(this.WIDTH, this.HEIGHT);
		this.canvasEvent();
	}

	/*
	 * 调整 canvas 尺寸
	 */
	resize(w=0, h=0) {
		if(w > 500 || h > 500) {
			this.shrinkImg(w, h);
		}else {
			this.WIDTH = w;
			this.HEIGHT = h;
		}
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;
	}

	/*
	 * canvas 添加事件
	 */
	canvasEvent() {
		this.wheelEvent();
		this.mouseDown();
	}

	/*
	 * canvas 添加鼠标滚轮事件
	 */
	wheelEvent() {
		this.canvas.addEventListener('mousewheel', (e) =>{
			this.scale += e.wheelDelta > 0 ? 0.1 : -0.1;
			this.drawImage();
		}, {
			passive: true
		})
	}

	/*
	 * canvas 添加鼠标事件
	 */
	mouseDown() {
		this.canvas.addEventListener('mousedown', (e) =>{
			this.isDrag = true;
			this.start = {
				x: e.clientX,
				y: e.clientY
			}
		})
	}

	/*
	 * canvas 添加鼠标事件
	 */
	mouseMove() {
		this.canvas.addEventListener('mousemove', (e) =>{
			if(!this.isDrag) {
				return;
			}

			let dX = e.clientX - this.start.x,
				dY = e.clientY - this.start.y;

			this.drawImage(this.img, dX, dY);
		})
	}

	/*
	 * 缩小图片
	 */
	shrinkImg(w, h) {
		if(w > h) {
			this.WIDTH = 500;
			this.HEIGHT = h * this.WIDTH / w;
		}else {
			this.HEIGHT = 500;
			this.WDITH = w * this.HEIGHT / h;
		}
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
					this.img = img;
					this.resize(img.width, img.height);
					this.drawImage();
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
	 * 绘制图像
	 */
	drawImage(img=this.img, sx=0, sy=0) {
		let w = this.WIDTH * this.scale,
			h = this.HEIGHT * this.scale;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.drawImage(img, sx, sy, img.width, img.height, 0, 0, w, h);
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
}