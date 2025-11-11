let objs = [];
let colors = ['#f71735', '#f7d002', '#1A53C0', '#232323'];
let menu;
let profileImg;
let imgX, imgY;
let graphics; // 新增一個圖形緩衝區來繪製動態圖形
let baseImgSize = 150; // 將照片的基礎大小縮小

function preload() {
	// 載入 AI 風格照片
	profileImg = loadImage('https://images.pexels.com/photos/8429539/pexels-photo-8429539.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260');
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	rectMode(CENTER);
	textAlign(CENTER, CENTER); // 將這行移到 setup，避免重複設定
	imageMode(CENTER);
	graphics = createGraphics(windowWidth, windowHeight); // 初始化圖形緩衝區
	graphics.rectMode(CENTER);
	objs.push(new DynamicShape());
	menu = new Menu();

	// 初始化圖片位置
	imgX = width / 2;
	imgY = height / 2;
}

function draw() {
	background(255); // 恢復背景清除，確保 UI 元素清晰

	// 讓圖形緩衝區的背景帶有透明度，製造軌跡效果
	graphics.background(255, 25);
	image(graphics, width / 2, height / 2); // 將帶有軌跡的圖形緩衝區繪製到主畫布上

	for (let i of objs) {
		i.run();
	}

	if (frameCount % int(random([15, 30])) == 0) {
		let addNum = int(random(1, 30));
		for (let i = 0; i < addNum; i++) {
			objs.push(new DynamicShape());
		}
	}
	for (let i = objs.length - 1; i >= 0; i--) {
		if (objs[i].isDead) {
			objs.splice(i, 1);
		}
	}

	// 計算滑鼠與照片的距離，並映射到一個縮放比例
	// 當滑鼠距離在 0 (重疊) 到 300 像素之間時，尺寸會在 1.5 倍到 1 倍之間變化
	let d = dist(mouseX, mouseY, imgX, imgY);
	let scaleFactor = map(d, 0, 300, 1.5, 1, true); // true 會將結果限制在範圍內
	let currentImgSize = baseImgSize * scaleFactor;

	// 繪製照片
	// 將照片位置固定在左下角
	imgX = currentImgSize / 2;
	imgY = height - currentImgSize / 2;

	push();
	// 讓圖片稍微透明，更好地融入背景
	tint(255, 200);
	image(profileImg, imgX, imgY, currentImgSize, currentImgSize);
	pop();

	// 繪製左上角文字
	push();
	let padding = 20;
	let boxWidth = 100;
	let boxHeight = 50;
	// 反白背景框
	fill(255, 120);
	noStroke();
	rect(padding + boxWidth / 2, padding + boxHeight / 2, boxWidth, boxHeight, 10);

	// 文字 "0779"
	fill(0);
	textSize(32);
	text('0779', padding + boxWidth / 2, padding + boxHeight / 2);

	// 文字 "靜"
	let mouseSpeed = dist(mouseX, mouseY, pmouseX, pmouseY);
	let jingSize = map(mouseSpeed, 0, 50, 30, 60, true);
	textSize(jingSize);

	// 在繪製 "靜" 之前，先清除該區域的背景，避免因文字大小變化而產生模糊疊加效果
	push();
	fill(255); // 使用背景色清除
	noStroke();
	// 清除的範圍比文字稍大，確保完全覆蓋
	rect(padding + boxWidth + 40, padding + boxHeight / 2, 70, 70);
	pop();
	text('靜', padding + boxWidth + 40, padding + boxHeight / 2);
	pop();

	// 繪製標題 "淡江大學"
	push();
	textAlign(CENTER, CENTER);
	textFont('標楷體');
	textSize(50);
	// 讓文字顏色隨時間變化，呈現鮮豔效果
	colorMode(HSB, 360, 100, 100);
	let hue = frameCount % 360;
	fill(hue, 90, 100);
	stroke(0);
	strokeWeight(2);
	text('淡江大學', width / 2, height / 2);
	pop(); // 還原繪圖設定，特別是 colorMode

	menu.update(); // 呼叫選單的更新方法，處理滑鼠懸停和位置邏輯
	menu.display();
}

function easeInOutExpo(x) {
	return x === 0 ? 0 :
		x === 1 ?
		1 :
		x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 :
		(2 - Math.pow(2, -20 * x + 10)) / 2;
}

class DynamicShape {
    constructor(x, y) {
		this.x = random(0.3, 0.7) * width;
		this.y = random(0.3, 0.7) * height;
		this.reductionRatio = 1;
		this.shapeType = int(random(3)); // 移除文字選項，只產生圖形
		this.animationType = 0;
		this.maxActionPoints = int(random(2, 5));
		this.actionPoints = this.maxActionPoints;
		this.elapsedT = 0;
		this.size = 0;
		this.sizeMax = width * random(0.01, 0.05);
		this.fromSize = 0;
		this.init();
		this.isDead = false;
		this.clr = random(colors);
		this.changeShape = true;
		this.ang = int(random(2)) * PI * 0.25;
		this.lineSW = 0;
    }

    show() {
		graphics.push();
		graphics.translate(this.x, this.y);
		if (this.animationType == 1) graphics.scale(1, this.reductionRatio);
		if (this.animationType == 2) graphics.scale(this.reductionRatio, 1);
		graphics.fill(this.clr);
		graphics.stroke(this.clr);
		graphics.strokeWeight(this.size * 0.05);
		if (this.shapeType == 0) {
			graphics.noStroke();
			graphics.circle(0, 0, this.size);
		} else if (this.shapeType == 1) {
			graphics.noFill();
			graphics.circle(0, 0, this.size);
		} else if (this.shapeType == 2) {
			graphics.noStroke();
			graphics.rect(0, 0, this.size, this.size);
		} else if (this.shapeType == 3) {
			graphics.noFill();
			graphics.rect(0, 0, this.size * 0.9, this.size * 0.9);
		}
		graphics.pop();
		graphics.strokeWeight(this.lineSW);
		graphics.stroke(this.clr);
		graphics.line(this.x, this.y, this.fromX, this.fromY);
    }

    move() {
		let n = easeInOutExpo(norm(this.elapsedT, 0, this.duration));
		if (0 < this.elapsedT && this.elapsedT < this.duration) {
			if (this.actionPoints == this.maxActionPoints) {
				this.size = lerp(0, this.sizeMax, n);
			} else if (this.actionPoints > 0) {
				if (this.animationType == 0) {
					this.size = lerp(this.fromSize, this.toSize, n);
				} else if (this.animationType == 1) {
					this.x = lerp(this.fromX, this.toX, n);
					this.lineSW = lerp(0, this.size / 5, sin(n * PI));
				} else if (this.animationType == 2) {
					this.y = lerp(this.fromY, this.toY, n);
					this.lineSW = lerp(0, this.size / 5, sin(n * PI));
				} else if (this.animationType == 3) {
					if (this.changeShape == true) {
						this.shapeType = int(random(5));
						this.changeShape = false;
					}
				}
				this.reductionRatio = lerp(1, 0.3, sin(n * PI));
			} else {
				this.size = lerp(this.fromSize, 0, n);
			}
		}

		this.elapsedT++;
		if (this.elapsedT > this.duration) {
			this.actionPoints--;
			this.init();
		}
		if (this.actionPoints < 0) {
			this.isDead = true;
		}
	}

    run() {
        this.show();
        this.move();
    }

	init() {
		this.elapsedT = 0;
		this.fromSize = this.size;
		this.toSize = this.sizeMax * random(0.5, 1.5);
		this.fromX = this.x;
		this.toX = this.fromX + (width / 10) * random([-1, 1]) * int(random(1, 4));
		this.fromY = this.y;
		this.toY = this.fromY + (height / 10) * random([-1, 1]) * int(random(1, 4));
		this.animationType = int(random(3));
		this.duration = random(20, 50);
	}
}

function addObjs() {
	let addNum = int(random(10, 40));
	for (let i = 0; i < addNum; i++) {
		objs.push(new DynamicShape());
	}
}

class Menu {
    constructor() {
        this.x = -150; // 初始位置在畫布外
        this.y = 0;
        this.width = 150; // 寬度為 150
        this.items = ['第一單元作品', '第一單元講義', '測驗系統', '測驗卷筆記', '作品筆記', '淡江大學', '回到首頁'];
        this.itemHeight = 40;
        this.hoveredItem = -1; // -1 表示沒有項目被滑鼠懸停
        this.activeItem = -1;  // -1 表示沒有項目被點擊或啟用子選單
        this.submenuWidth = 150;
        this.submenus = {
            5: [{
                text: '教育科技學系',
                link: 'https://www.et.tku.edu.tw/'
            }] // 索引 5 對應 "淡江大學"
        };
        this.mobileThreshold = 768; // 行動版切換寬度
        this.isMobile = windowWidth <= this.mobileThreshold;
        this.hamburgerSize = 30;
        this.hamburgerPadding = 15;
        this.targetX = -this.width; // 目標 X 座標
        this.isOpen = false;
        this.lastHoverTime = 0; // 新增：記錄滑鼠最後懸停的時間
    }
    
    display() {
        // 使用 lerp 讓選單平滑移動
        this.x = lerp(this.x, this.targetX, 0.2);
        
        push();
        rectMode(CORNER); // 確保從左上角繪製矩形

        // 在繪製選單前，先清除選單區域的背景
        fill(255); // 使用不透明白色背景
        noStroke();
        rect(this.x, 0, this.width, height);

        // 選單背景
        fill(255, 200);
        rect(this.x, this.y, this.width, height);
        
        // 選單項目
        textSize(16);
        textAlign(LEFT, CENTER);
        fill(0); // 子選單文字顏色為黑色
        for(let i = 0; i < this.items.length; i++) {
            // 如果滑鼠懸停在項目上，顯示反白效果
            if (this.hoveredItem === i) {
                fill(200, 200, 255, 150); // 淡藍色反白
                noStroke();
                rect(this.x, this.y + 50 + (i * this.itemHeight) - this.itemHeight / 2, this.width, this.itemHeight);
                fill(0);
            }
            // 調整文字位置
            text(this.items[i], this.x + 20, this.y + 50 + (i * this.itemHeight));
        }

        // 如果滑鼠懸停在有子選單的項目上，則顯示子選單
        if (this.hoveredItem !== -1 && this.submenus[this.hoveredItem]) {
            const submenu = this.submenus[this.hoveredItem]; // 使用 hoveredItem
            const parentItemCenterY = this.y + 50 + (this.hoveredItem * this.itemHeight);
            const parentItemBottom = parentItemCenterY + this.itemHeight / 2;
            
            // 繪製子選單背景
            fill(240, 240, 255, 220); // 更不透明的淡藍色背景
            rect(this.x, parentItemBottom, this.width, submenu.length * this.itemHeight); // X 座標與主選單對齊

            // 繪製子選單項目
            fill(0);
            for (let i = 0; i < submenu.length; i++) {
                text(submenu[i].text, this.x + 20, parentItemBottom + (this.itemHeight / 2) + (i * this.itemHeight));
            }
        }
        pop();
    }
    
    update() {
        this.isMobile = windowWidth <= this.mobileThreshold;
        if (this.isMobile) {
            // 行動版：目標 X 由 isOpen 狀態決定，不由滑鼠位置決定
            this.targetX = this.isOpen ? 0 : -this.width;
        } else {
            // 桌面版：由滑鼠位置決定
            if (mouseX < 20) {
                this.targetX = 0;
                this.lastHoverTime = millis();
            } else if (this.x > -this.width + 1) { // 如果選單是打開的 (x > -149)
                // 檢查滑鼠是否還在選單或子選單範圍內
                const submenuVisible = this.hoveredItem !== -1 && this.submenus[this.hoveredItem];
                const submenuHeight = submenuVisible ? this.submenus[this.hoveredItem].length * this.itemHeight : 0;
                const parentItemBottom = submenuVisible ? (this.y + 50 + (this.hoveredItem * this.itemHeight) + this.itemHeight / 2) : 0;

                if (mouseX > this.x + this.width || mouseY > parentItemBottom + submenuHeight) {
                    // 如果滑鼠離開選單區域，延遲 500 毫秒後再收合
                    if (millis() - this.lastHoverTime > 1000) { // 將延遲時間從 500 毫秒增加到 1000 毫秒
                        this.targetX = -this.width;
                    }
                }
            }
        }

        // 在繪製選單前，先清除選單區域的背景
        push();
        fill(255); // 使用白色背景
        noStroke();
        rectMode(CORNER);
        rect(0, 0, this.x + this.width, height);
        pop();

        this.checkHover(mouseX, mouseY);
    }

    checkClick(mx, my) {
        // 檢查是否點擊在主選單範圍內
        for(let i = 0; i < this.items.length; i++) {
            let itemCenterY = this.y + 50 + (i * this.itemHeight);
            let yTop = itemCenterY - this.itemHeight / 2;
            if(mx > this.x && mx < this.x + this.width && // 檢查點擊是否在當前選單的 x 範圍內
               my > yTop && my < yTop + this.itemHeight) {
                // 如果點擊的項目有子選單，則不立即執行，等待子選單點擊
                this.executeItem(i);
            }
        }

        // 檢查是否點擊在子選單範圍內
        if (this.hoveredItem !== -1 && this.submenus[this.hoveredItem]) {
            const submenu = this.submenus[this.hoveredItem];
            const parentItemCenterY = this.y + 50 + (this.hoveredItem * this.itemHeight);
            const submenuY = parentItemCenterY + this.itemHeight / 2;
            const submenuH = submenu.length * this.itemHeight;

            if (mx > this.x && mx < this.x + this.width && my > submenuY && my < submenuY + submenuH) {
                // 計算被點擊的是第幾個子選單項目
                const submenuIndex = floor((my - submenuY) / this.itemHeight);
                if (submenu[submenuIndex] && submenu[submenuIndex].link) {
                    window.location.href = submenu[submenuIndex].link;
                }
            }
        }
    }
    
    executeItem(index) {
        switch(index) {
            case 0: // 第一單元作品
                window.location.href = 'https://jing412572.github.io/20251014/';
                break;
            case 1: // 第一單元講義
                window.location.href = 'https://hackmd.io/@COyutSUuRJ25VLQn14pk9Q/rJKlYuknle';
                break;
            case 2: // 測驗系統
                // 連接到測驗系統網站
                window.location.href = 'quiz.html';
                break;
            case 3: // 測驗卷筆記
                window.location.href = 'https://hackmd.io/@COyutSUuRJ25VLQn14pk9Q/SJyVTdhk-l';
                break;
            case 4: // 作品筆記
                // 此處為新項目，尚未定義功能
                console.log('點擊了 作品筆記');
                break;
            case 5: // 淡江大學
                window.location.href = 'https://www.tku.edu.tw/';
                break;
            case 6: // 回到首頁
                // 回到首頁 (此處假設首頁就是目前頁面)
                window.location.href = 'index.html';
                break;
        }
    }

    draw() {
        if (this.isMobile) {
            this.drawHamburgerIcon();
        }
        if (this.x > -this.width) { // 只有在選單可見時才繪製
            this.display();
        }
    }

    checkHover(mx, my) {
        let isHoveringSomething = false;
        this.hoveredItem = -1; // 預設為沒有懸停
        // 檢查是否懸停在主選單項目上
        for(let i = 0; i < this.items.length; i++) {
            let itemCenterY = this.y + 50 + (i * this.itemHeight);
            let yTop = itemCenterY - this.itemHeight / 2;
            if(mx > this.x && mx < this.x + this.width && // 檢查滑鼠是否在當前選單的 x 範圍內
               my > yTop && my < yTop + this.itemHeight) {
                this.hoveredItem = i;
                isHoveringSomething = true;
                break; // 找到後就跳出迴圈
                this.hoveredItem = i; // 只設定懸停效果，不改變 activeItem
                return;
            }
        }

        // 如果沒有懸停在主選單上，再檢查是否懸停在可見的子選單上
        if (!isHoveringSomething && this.hoveredItem !== -1 && this.submenus[this.hoveredItem]) {
            const submenu = this.submenus[this.hoveredItem];
            const parentItemCenterY = this.y + 50 + (this.hoveredItem * this.itemHeight);
            // 調整子選單的懸停偵測範圍，使其符合向下展開的位置
            const submenuY = parentItemCenterY + this.itemHeight / 2;
            const submenuH = submenu.length * this.itemHeight;
            if (mx > this.x && mx < this.x + this.width && my > submenuY && my < submenuY + submenuH) {
                isHoveringSomething = true; // 滑鼠在子選單上，保持 hoveredItem 不變
                this.lastHoverTime = millis();
                // 滑鼠在子選單上，保持 hoveredItem 不變以維持主選單的反白效果
            }
        }

        if (!isHoveringSomething) this.hoveredItem = -1; // 如果滑鼠不在任何選單或子選單上，才重設
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    graphics = createGraphics(windowWidth, windowHeight); // 同步更新圖形緩衝區大小
    menu.isMobile = windowWidth <= menu.mobileThreshold;
}

function mousePressed() {
    if (menu.isMobile) {
        // 行動版：檢查漢堡圖示點擊
        let iconSize = menu.hamburgerSize + menu.hamburgerPadding;
        if (mouseX < iconSize && mouseY < iconSize) {
            menu.isOpen = !menu.isOpen;
        } else if (menu.isOpen) {
            menu.checkClick(mouseX, mouseY);
        }
        if (mouseX < iconSize && mouseY < iconSize) menu.isOpen = !menu.isOpen;
    } else {
        // 桌面版：只有當選單完全展開時才檢查點擊
        if (menu.x > -menu.width + 5) { // 使用座標判斷選單是否可見
            menu.checkClick(mouseX, mouseY);
        }
    }
}