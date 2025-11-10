/*
By Okazz
*/
let palette = ['#ff4d00', '#2abde4', '#fdb50e', '#2864b8', '#EAEDF1'];
let ctx;
let centerX, centerY;
let motions = [];
let restTime = 300;
let rects = [];
let cnv;
let sideMenu;

let gameState = 'ANIMATION'; // 'ANIMATION' 或 'QUIZ'

function preload() {
    // 為測驗系統預載入題庫
    quizApp.preload();
}

function setup() {
    // 將整個頁面背景設為黑色並移除預設 margin (這部分移到 HTML 的 style 中)
    document.body.style.margin = '0';
    document.body.style.backgroundColor = '#000000';

    // 建立 1800x900 畫布並置中
    cnv = createCanvas(1800, 900);
    cnv.style('display', 'block');
    cnv.position((windowWidth - width) / 2, (windowHeight - height) / 2);

    // 獲取選單元素
    sideMenu = select('#side-menu');

    // --- 測驗系統選單邏輯 ---
    const quizMenuItem = select('#menu-item-quiz');
    quizMenuItem.mousePressed(() => quizApp.start());

    // --- 回到首頁選單邏輯 ---
    const homeMenuItem = select('#menu-item-home');
    homeMenuItem.mousePressed(() => quizApp.returnToHome());


    // --- iframe 彈出視窗邏輯 ---
    const menuItem1 = select('#menu-item-1');
    const menuItem2 = select('#menu-item-2');
    const iframeModal = select('#iframe-modal');
    const iframe = select('#content-iframe');
    const closeBtn = select('#iframe-close-btn');

    // 點擊 "第一單元作品"
    menuItem1.mousePressed(() => {
        iframe.attribute('src', 'https://vic021101-ux.github.io/20251020/');
        iframeModal.style('display', 'flex'); // 使用 flex 來置中
    });

    // 點擊 "第一單元講義"
    menuItem2.mousePressed(() => {
        iframe.attribute('src', 'https://hackmd.io/@-m8wuEELQyWN98Xt6w4WaA/BJUNP70sel');
        iframeModal.style('display', 'flex');
    });

    // 點擊關閉按鈕
    closeBtn.mousePressed(() => {
        iframeModal.style('display', 'none');
        iframe.attribute('src', ''); // 清空 src 以停止內容播放
    });
    // --- iframe 邏輯結束 ---

    rectMode(CENTER);
    ctx = drawingContext;
    centerX = width / 2;
    centerY = height / 2;
    tiling();

    // 初始化測驗系統
    quizApp.setup();
}

function draw() {
    if (gameState === 'ANIMATION') {
        background('#000000');
        for (let i of motions) {
            i.run();
        }
    } else if (gameState === 'QUIZ') {
        quizApp.draw();
    }

    // 根據滑鼠位置控制選單
    if (mouseX < 100) {
        sideMenu.style('left', '0px');
    } else {
        // 假設選單寬度為 300px
        sideMenu.style('left', '-300px');
    }
}

function mousePressed() {
    if (gameState === 'QUIZ') {
        quizApp.mousePressed();
    }
}

// 新增：視窗尺寸變動時保持畫布置中
function windowResized() {
    if (cnv) {
        cnv.position((windowWidth - width) / 2, (windowHeight - height) / 2);
    }
}
function resetAnimation() {
    motions = [];
    rects = [];
    tiling();
}

function tiling() {
	let margin = 0;
	let columns = 18;
	let rows = columns;
	let cellW = (width - (margin * 2)) / columns;
	let cellH = (height - (margin * 2)) / rows;
	let emp = columns * rows;
	let grids = [];

	for (let j = 0; j < columns; j++) {
		let arr = []
		for (let i = 0; i < rows; i++) {
			arr[i] = false;
		}
		grids[j] = arr;
	}

	while (emp > 0) {
		let w = random([1, 2]);
		let h = random([1, 2]);
		let x = int(random(columns - w + 1));
		let y = int(random(rows - h + 1));
		let lap = true;
		for (let j = 0; j < h; j++) {
			for (let i = 0; i < w; i++) {
				if (grids[x + i][y + j]) {
					lap = false;
					break;
				}
			}
		}

		if (lap) {
			for (let j = 0; j < h; j++) {
				for (let i = 0; i < w; i++) {
					grids[x + i][y + j] = true;
				}
			}
			let xx = margin + x * cellW;
			let yy = margin + y * cellH;
			let ww = w * cellW;
			let hh = h * cellH;
			rects.push({ x: xx + ww / 2, y: yy + hh / 2, w: ww, h: hh });
			emp -= w * h;
		}
	}

	for (let i = 0; i < rects.length; i++) {
		let r = rects[i];
		if (r.w == r.h) {
			let rnd = int(random(5));

			if (rnd == 0) {
				motions.push(new Motion1_1_01(r.x, r.y, r.w * 0.75));
			} else if (rnd == 1) {
				motions.push(new Motion1_1_02(r.x, r.y, r.w));
			} else if (rnd == 2) {
				motions.push(new Motion1_1_03(r.x, r.y, r.w));
			} else if (rnd == 3) {
				motions.push(new Motion1_1_04(r.x, r.y, r.w));
			} else if (rnd == 4) {
				motions.push(new Motion1_1_05(r.x, r.y, r.w * 0.5));
			}
		} else {
			let rnd = int(random(4));
			if (rnd == 0) {
				motions.push(new Motion2_1_01(r.x, r.y, r.w * 0.9, r.h * 0.9));
			} else if (rnd == 1) {
				motions.push(new Motion2_1_02(r.x, r.y, r.w, r.h));
			} else if (rnd == 2) {
				motions.push(new Motion2_1_03(r.x, r.y, r.w, r.h));
			} else if (rnd == 3) {
				motions.push(new Motion2_1_04(r.x, r.y, r.w, r.h));
			}
		}
	}
}

const quizApp = {
    table: null,
    allQuestions: [],
    quizQuestions: [],
    QUIZ_LENGTH: 3,
    currentQuestionIndex: 0,
    score: 0,
    quizState: 'LOADING', // LOADING, START, QUIZ, RESULTS
    buttons: [],
    feedbackFrame: 0,
    isCorrect: false,
    particles: [],

    preload() {
        this.table = loadTable('questions.csv', 'csv');
    },

    setup() {
        if (!this.table) {
            console.error("questions.csv 檔案載入失敗。");
            return;
        }
        for (let r = 0; r < this.table.getRowCount(); r++) {
            this.allQuestions.push({
                question: this.table.getString(r, 0),
                options: [this.table.getString(r, 1), this.table.getString(r, 2), this.table.getString(r, 3), this.table.getString(r, 4)],
                answer: this.table.getString(r, 5)
            });
        }

        for (let i = 0; i < 100; i++) {
            this.particles.push(new this.Particle());
        }
    },

    start() {
        gameState = 'QUIZ';
        this.quizState = 'START';
        this.prepareStartScreen();
    },

    returnToHome() {
        gameState = 'ANIMATION';
        resetAnimation();
    },

    draw() {
        background(10, 10, 20);
        this.drawParticles();

        switch (this.quizState) {
            case 'START':
                this.drawStartScreen();
                break;
            case 'QUIZ':
                this.drawQuizScreen();
                break;
            case 'RESULTS':
                this.drawResultsScreen();
                break;
            case 'LOADING':
                this.drawLoadingScreen();
                break;
        }

        if (this.feedbackFrame > 0) {
            this.drawFeedback();
            this.feedbackFrame--;
            if (this.feedbackFrame === 0) {
                this.nextQuestion();
            }
        }
    },

    mousePressed() {
        if (this.quizState === 'QUIZ' && this.feedbackFrame === 0) {
            for (let i = 0; i < this.buttons.length; i++) {
                if (this.buttons[i].isMouseOver()) {
                    this.checkAnswer(this.buttons[i].label);
                    break;
                }
            }
        } else if (this.quizState === 'START' || this.quizState === 'RESULTS') {
             for (let i = 0; i < this.buttons.length; i++) {
                if (this.buttons[i].isMouseOver()) {
                    this.buttons[i].onClick();
                    break;
                }
            }
        }
    },

    prepareStartScreen() {
        this.quizState = 'START';
        let startButton = new this.Button('開始測驗', width / 2, height / 2 + 100, 200, 50, () => this.startQuiz());
        let backButton = new this.Button('回到首頁', width / 2, height / 2 + 160, 200, 50, () => this.returnToHome());
        this.buttons = [startButton, backButton];
    },

    startQuiz() {
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.quizQuestions = shuffle(this.allQuestions).slice(0, this.QUIZ_LENGTH);
        this.quizState = 'QUIZ';
        this.displayQuestion(this.currentQuestionIndex);
    },

    nextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.quizQuestions.length) {
            this.displayQuestion(this.currentQuestionIndex);
        } else {
            this.quizState = 'RESULTS';
            let restartButton = new this.Button('重新開始', width / 2, height / 2 + 100, 200, 50, () => this.startQuiz());
            let backButton = new this.Button('回到首頁', width / 2, height / 2 + 160, 200, 50, () => this.returnToHome());
            this.buttons = [restartButton, backButton];
        }
    },

    checkAnswer(selectedOption) {
        const correctOption = this.quizQuestions[this.currentQuestionIndex].answer;
        if (selectedOption === correctOption) {
            this.score++;
            this.isCorrect = true;
        } else {
            this.isCorrect = false;
        }
        this.feedbackFrame = 90;
    },

    drawLoadingScreen() {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text('正在載入題庫...', width / 2, height / 2);
    },

    drawStartScreen() {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(48);
        text('p5.js 互動測驗', width / 2, height / 2 - 100);
        textSize(20);
        text(`準備好挑戰 ${this.QUIZ_LENGTH} 道題目了嗎？`, width / 2, height / 2);

        let hasMouseOver = false;
        for (const btn of this.buttons) {
            btn.draw();
            if (btn.isMouseOver()) hasMouseOver = true;
        }
        cursor(hasMouseOver ? HAND : ARROW);
    },

    drawQuizScreen() {
        const q = this.quizQuestions[this.currentQuestionIndex];
        fill(255);
        textAlign(CENTER, TOP);
        textSize(28);
        text(q.question, width / 2, 80, width * 0.8, height / 3);

        textSize(16);
        textAlign(LEFT, TOP);
        text(`問題 ${this.currentQuestionIndex + 1} / ${this.quizQuestions.length}`, 20, 20);
        textAlign(RIGHT, TOP);
        text(`分數: ${this.score}`, width - 20, 20);

        let hasMouseOver = false;
        for (const btn of this.buttons) {
            btn.draw();
            if (btn.isMouseOver()) hasMouseOver = true;
        }
        cursor(hasMouseOver && this.feedbackFrame === 0 ? HAND : ARROW);
    },

    drawResultsScreen() {
        let feedbackText = '';
        if (this.score === this.quizQuestions.length) {
            feedbackText = '太棒了，全部答對！你是 p5.js 大師！';
        } else if (this.score >= this.quizQuestions.length / 2) {
            feedbackText = '不錯喔，繼續努力！';
        } else {
            feedbackText = '再接再厲，下次會更好！';
        }

        fill(255);
        textAlign(CENTER, CENTER);
        textSize(48);
        text('測驗結束', width / 2, height / 2 - 120);
        textSize(32);
        text(`你的分數: ${this.score} / ${this.quizQuestions.length}`, width / 2, height / 2 - 40);
        textSize(22);
        text(feedbackText, width / 2, height / 2 + 30);

        let hasMouseOver = false;
        for (const btn of this.buttons) {
            btn.draw();
            if (btn.isMouseOver()) hasMouseOver = true;
        }
        cursor(hasMouseOver ? HAND : ARROW);
    },

    drawFeedback() {
        let alpha = map(this.feedbackFrame, 90, 0, 255, 0);
        let feedbackColor = this.isCorrect ? color(0, 255, 0, alpha) : color(255, 0, 0, alpha);
        push();
        noStroke();
        fill(feedbackColor);
        rect(width / 2, height / 2, width, height);
        fill(255, alpha);
        textSize(100);
        textAlign(CENTER, CENTER);
        text(this.isCorrect ? '✔' : '✘', width / 2, height / 2);
        pop();
    },

    displayQuestion(index) {
        const q = this.quizQuestions[index];
        this.buttons = [];
        const optionLabels = ['A', 'B', 'C', 'D'];
        for (let i = 0; i < q.options.length; i++) {
            let btnX = width / 2;
            let btnY = 280 + i * 65;
            let btnText = `${optionLabels[i]}: ${q.options[i]}`;
            let btn = new this.Button(btnText, btnX, btnY, width * 0.7, 50, () => this.checkAnswer(optionLabels[i]));
            btn.label = optionLabels[i];
            this.buttons.push(btn);
        }
    },

    drawParticles() {
        for (let p of this.particles) {
            p.update();
            p.show();
        }
    },

    Button: class {
        constructor(text, x, y, w, h, onClick) {
            this.text = text;
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.onClick = onClick;
            this.label = '';
        }

        isMouseOver() {
            return mouseX > this.x - this.w / 2 && mouseX < this.x + this.w / 2 &&
                   mouseY > this.y - this.h / 2 && mouseY < this.y + this.h / 2;
        }

        draw() {
            push();
            rectMode(CENTER);
            textAlign(CENTER, CENTER);
            textSize(18);
            if (this.isMouseOver()) {
                fill(100, 100, 200);
                stroke(200);
            } else {
                fill(50, 50, 100);
                stroke(150);
            }
            strokeWeight(2);
            rect(this.x, this.y, this.w, this.h, 10);
            noStroke();
            fill(255);
            text(this.text, this.x, this.y);
            pop();
        }
    },

    Particle: class {
        constructor() {
            this.pos = createVector(random(width), random(height));
            this.vel = createVector(random(-1, 1), random(-1, 1));
            this.acc = createVector(0, 0);
            this.maxSpeed = 2;
            this.color = color(random(100, 200), random(100, 200), 255, 150);
        }

        update() {
            let mouse = createVector(mouseX, mouseY);
            this.acc = p5.Vector.sub(mouse, this.pos);
            this.acc.setMag(0.1);
            this.vel.add(this.acc);
            this.vel.limit(this.maxSpeed);
            this.pos.add(this.vel);
            this.checkEdges();
        }

        checkEdges() {
            if (this.pos.x > width) this.pos.x = 0;
            if (this.pos.x < 0) this.pos.x = width;
            if (this.pos.y > height) this.pos.y = 0;
            if (this.pos.y < 0) this.pos.y = height;
        }

        show() {
            noStroke();
            fill(this.color);
            ellipse(this.pos.x, this.pos.y, 4, 4);
        }
    }
};

function easeInOutQuint(x) {
	return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

/*------------------------------------------------------------------------------------------*/

class Motion1_1_01 {
	/*
	円四角モーフィング
	*/
	constructor(x, y, w) {
		this.x = x;
		this.y = y;
		this.w = w;

		this.toggle = int(random(2));
		this.clr = random(palette);
		this.initialize();
		this.duration = 80;
		this.currentW = w;
		this.colors = palette.slice();
		shuffle(this.colors, true);
		this.color1 = color(this.colors[0]);
		this.color2 = color(this.colors[1]);
		this.currentW = this.w;

		if (this.toggle) {
			this.currentColor = this.color1;
			this.corner = this.w;
		} else {
			this.currentColor = this.color2;
			this.corner = 0;
		}
	}

	show() {
		noStroke();
		fill(this.currentColor);
		square(this.x, this.y, this.currentW, this.corner);
	}

	update() {
		if (0 < this.timer && this.timer < this.duration) {
			let nrm = norm(this.timer, 0, this.duration - 1);
			let n = nf(easeInOutQuint(nrm), 0, 4);
			if (this.toggle) {
				this.corner = lerp(this.w, 0, n);
				this.currentColor = lerpColor(this.color1, this.color2, n);
			} else {
				this.corner = lerp(0, this.w, n);
				this.currentColor = lerpColor(this.color2, this.color1, n);
			}
			this.currentW = lerp(this.w, this.w / 2, sin(n * PI));
		}

		if (this.timer > this.duration) {
			if (this.toggle) {
				this.toggle = 0;
			} else {
				this.toggle = 1;
			}
			this.initialize();
		}

		this.timer++;
	}

	initialize() {
		if (this.toggle) {
		} else {
		}
		this.timer = -int(random(restTime));
	}

	run() {
		this.show();
		this.update();
	}
}

class Motion1_1_02 {
	/*
	惑星衛星
	*/
	constructor(x, y, w) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.colors = palette.slice();
		shuffle(this.colors, true);
		this.satelliteSize = this.w * 0.2;
		this.orbitW = this.w * 0.4;
		this.orbitH = this.w * 0.1;
		this.timer = int(-random(100));
		this.currentaAngle = random(10);
		this.angleStep = random([1, -1]) * 0.01;
		this.coin = random([-1, 1])
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.currentaAngle);
		noStroke();
		fill(this.colors[0]);
		circle(0, 0, this.w * 0.5);

		fill(this.colors[1]);
		circle(this.orbitW * cos(this.timer / 50 * this.coin), this.orbitH * sin(this.timer / 50 * this.coin), this.satelliteSize);
		pop();
	}

	update() {
		this.timer++;
		this.currentaAngle += this.angleStep;
	}

	run() {
		this.show();
		this.update();
	}
}

class Motion1_1_03 {
	/*
	チェック＆ポルカドット
	*/
	constructor(x, y, w) {
		this.x = x;
		this.y = y;
		this.w = w;

		this.toggle = int(random(2));
		this.initialize();
		this.duration = 150;
		this.colors = palette.slice();
		shuffle(this.colors, true);



		this.gridCount = 4;
		this.cellW = this.w / this.gridCount;

		this.squareW = 0;
		this.circleD = 0;

		if (this.toggle) {
			this.squareW = this.cellW;
		} else {
			this.circleD = this.cellW * 0.75;
		}
	}

	show() {
		push();
		translate(this.x, this.y);
		noStroke();
		for (let i = 0; i < this.gridCount; i++) {
			for (let j = 0; j < this.gridCount; j++) {
				let cellX = - (this.w / 2) + i * this.cellW + (this.cellW / 2);
				let cellY = - (this.w / 2) + j * this.cellW + (this.cellW / 2);
				if ((i + j) % 2 == 0) {
					fill(this.colors[0]);
					square(cellX, cellY, this.squareW);
				} else {

				}

				fill(this.colors[1]);
				circle(cellX, cellY, this.circleD);
			}
		}
		pop();
	}

	update() {
		if (0 < this.timer && this.timer < this.duration) {
			let nrm = norm(this.timer, 0, this.duration - 1);
			let n = nf(easeInOutQuint(nrm), 0, 4);
			if (this.toggle) {
				this.squareW = lerp(this.cellW, 0, n);
				this.circleD = lerp(0, this.cellW * 0.75, n);

			} else {
				this.squareW = lerp(0, this.cellW, n);

				this.circleD = lerp(this.cellW * 0.75, 0, n);
			}
		}

		if (this.timer > this.duration) {
			if (this.toggle) {
				this.toggle = 0;
			} else {
				this.toggle = 1;
			}
			this.initialize();
		}
		this.timer++;
	}

	initialize() {
		if (this.toggle) {
		} else {
		}
		this.timer = -int(random(restTime));
	}

	run() {
		this.show();
		this.update();
	}
}

class Motion1_1_04 {
	/*
	4半円合体
	*/
	constructor(x, y, w) {
		this.x = x;
		this.y = y;
		this.w = w;

		this.toggle = int(random(2));
		this.initialize();
		this.duration = 80;
		this.colors = palette.slice();
		shuffle(this.colors, true);

		this.arcD = this.w / 2;
		if (this.toggle) {
			this.shiftX = 0;
			this.shiftY = 0;
			this.arcA = 0;
		} else {
			this.shiftX = this.w / 2;
			this.shiftY = this.w / 2;
			this.arcA = PI;
		}

	}

	show() {
		push();
		translate(this.x, this.y);
		noStroke();
		for (let i = 0; i < 4; i++) {
			push();
			translate(this.shiftX, this.shiftY);
			rotate(this.arcA);
			fill(this.colors[i]);
			arc(0, 0, this.arcD, this.arcD, 0, PI / 2);
			pop();
			rotate(TAU / 4);
		}
		pop();
	}

	update() {
		if (0 < this.timer && this.timer < this.duration) {
			let nrm = norm(this.timer, 0, this.duration - 1);
			let n = nf(easeInOutQuint(nrm), 0, 4);
			if (this.toggle) {
				this.shiftX = lerp(0, this.w / 2, n);
				this.shiftY = lerp(0, this.w / 2, n);
				this.arcA = lerp(0, PI, n);
			} else {
				this.shiftX = lerp(this.w / 2, 0, n);
				this.shiftY = lerp(this.w / 2, 0, n);
				this.arcA = lerp(PI, 0, n);
			}
		}

		if (this.timer > this.duration) {
			if (this.toggle) {
				this.toggle = 0;
			} else {
				this.toggle = 1;
			}
			this.initialize();
		}
		this.timer++;
	}

	initialize() {
		if (this.toggle) {
		} else {
		}
		this.timer = -int(random(restTime));
	}

	run() {
		this.show();
		this.update();
	}
}

class Motion1_1_05 {
	/*
	四色四角
	*/
	constructor(x, y, w) {
		this.x = x;
		this.y = y;
		this.w = w;

		this.toggle = int(random(2));
		this.initialize();
		this.duration = 120;
		this.colors = palette.slice();
		shuffle(this.colors, true);
		this.squareW = this.w * 0.4;
		this.counter = 0;
		this.timer++;
	}

	show() {
		push();
		translate(this.x, this.y);
		noStroke();
		fill(this.colors[this.counter % this.colors.length]);
		square(this.w * 0.25, -this.w * 0.25, this.squareW);
		fill(this.colors[(this.counter + 1) % this.colors.length]);
		square(this.w * 0.25, this.w * 0.25, this.squareW);
		fill(this.colors[(this.counter + 2) % this.colors.length]);
		square(-this.w * 0.25, this.w * 0.25, this.squareW);
		fill(this.colors[(this.counter + 3) % this.colors.length]);
		square(-this.w * 0.25, -this.w * 0.25, this.squareW);
		pop();
	}

	update() {
		if (this.timer % 15 == 0) {
			this.counter++
		}
		this.timer++;
	}

	initialize() {
		if (this.toggle) {
		} else {
		}
		this.timer = -int(random(1200));
	}

	run() {
		this.show();
		this.update();
	}
}


/*------------------------------------------------------------------------------------------*/

class Motion2_1_01 {
	/*
	〜
	*/
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.angle = int(random(2)) * PI;
		if (this.w < this.h) {
			this.angle += PI / 2;
		}
		this.minS = min(this.w, this.h);
		this.st = this.minS * 0.15;
		this.color = random(palette);
		this.timer = 0;
		this.speed = 0.025 * random([-1, 1]);
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.angle);
		noFill();
		stroke(this.color);
		strokeWeight(this.st);
		beginShape();
		let num = 100;
		for (let i = 0; i < num; i++) {
			let theta = map(i, 0, num, 0, PI * 5);
			let r = lerp(0, this.minS * 0.4, sin(map(i, 0, num, 0, PI)));
			let xx = map(i, 0, num - 1, -this.minS, this.minS);
			let yy = r * sin(theta + (this.timer * this.speed));
			vertex(xx, yy);
		}
		endShape();
		pop();
	}

	update() {
		this.timer++;
	}
	run() {
		this.show();
		this.update();
	}
}

class Motion2_1_02 {
	/*
	4円背の順
	*/
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.angle = int(random(2)) * PI;
		if (this.w < this.h) {
			this.angle += PI / 2;
		}
		this.minS = min(this.w, this.h);

		this.toggle = int(random(2));
		this.color = random(palette);
		this.initialize();
		this.duration = 120;
		this.targetSize = [];
		this.targetSize[0] = this.minS * 0.5;
		this.targetSize[1] = this.minS * 0.4;
		this.targetSize[2] = this.minS * 0.3;
		this.targetSize[3] = this.minS * 0.2;

		this.circleD = [];
		if (this.toggle) {
			this.circleD[0] = this.targetSize[0];
			this.circleD[1] = this.targetSize[1];
			this.circleD[2] = this.targetSize[2];
			this.circleD[3] = this.targetSize[3];
		} else {
			this.circleD[0] = this.targetSize[3];
			this.circleD[1] = this.targetSize[2];
			this.circleD[2] = this.targetSize[1];
			this.circleD[3] = this.targetSize[0];
		}

	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.angle);
		noStroke();
		fill(this.color);
		circle(this.minS / 4 * 3, 0, this.circleD[0]);
		circle(this.minS / 4, 0, this.circleD[1]);
		circle(-this.minS / 4, 0, this.circleD[2]);
		circle(-this.minS / 4 * 3, 0, this.circleD[3]);
		pop();
	}

	update() {
		if (0 < this.timer && this.timer < this.duration) {
			let nrm = norm(this.timer, 0, this.duration - 1);
			let n = nf(easeInOutQuint(nrm), 0, 4);
			if (this.toggle) {
				this.circleD[0] = lerp(this.targetSize[0], this.targetSize[3], n);
				this.circleD[1] = lerp(this.targetSize[1], this.targetSize[2], n);
				this.circleD[2] = lerp(this.targetSize[2], this.targetSize[1], n);
				this.circleD[3] = lerp(this.targetSize[3], this.targetSize[0], n);
			} else {
				this.circleD[0] = lerp(this.targetSize[3], this.targetSize[0], n);
				this.circleD[1] = lerp(this.targetSize[2], this.targetSize[1], n);
				this.circleD[2] = lerp(this.targetSize[1], this.targetSize[2], n);
				this.circleD[3] = lerp(this.targetSize[0], this.targetSize[3], n);
			}
		}

		if (this.timer > this.duration) {
			if (this.toggle) {
				this.toggle = 0;
			} else {
				this.toggle = 1;
			}
			this.initialize();
		}

		this.timer++;
	}

	initialize() {
		this.timer = int(-random(restTime));
	}

	run() {
		this.show();
		this.update();
	}
}

class Motion2_1_03 {
	/*
	←←←
	*/
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.angle = int(random(2)) * PI;
		if (this.w < this.h) {
			this.angle += PI / 2;
		}
		this.minS = min(this.w, this.h);
		this.toggle = int(random(2));
		this.colors = palette.slice();
		shuffle(this.colors, true);
		this.initialize();
		this.duration = 150;
		this.shift = 0;
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.angle);
		stroke(0);
		strokeWeight(0);
		noFill();
		rect(0, 0, this.minS * 2, this.minS);
		ctx.clip();
		fill(this.colors[1]);

		for (let i = 0; i < 8; i++) {
			let xx = map(i, 0, 8, -this.minS, this.minS * 2.5);
			this.tri(xx - this.shift, 0, this.minS * 0.5);
		}

		pop();
	}

	update() {
		if (0 < this.timer && this.timer < this.duration) {
			let nrm = norm(this.timer, 0, this.duration - 1);
			let n = nf(easeInOutQuint(nrm), 0, 4);
			this.shift = lerp(0, this.minS * 1.3125, n);
			if (this.toggle) {
			} else {
			}
		}

		if (this.timer > this.duration) {
			if (this.toggle) {
				this.toggle = 0;
			} else {
				this.toggle = 1;
			}
			this.initialize();
		}

		this.timer++;
	}

	initialize() {
		this.timer = int(-random(restTime));
	}

	run() {
		this.show();
		this.update();
	}

	tri(x, y, w) {
		beginShape();
		vertex(x, y);
		vertex(x + (w / 2), y - (w / 2));
		vertex(x + (w / 2), y + (w / 2));
		endShape();
	}
}

class Motion2_1_04 {
	/*
	ボール
	*/
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.angle = int(random(2)) * PI;
		if (this.w < this.h) {
			this.angle += PI / 2;
		}
		this.minS = min(this.w, this.h);
		this.toggle = int(random(2));
		this.colors = palette.slice();
		shuffle(this.colors, true);
		this.initialize();
		this.duration = 30;

		this.circleW = this.minS / 4;
		this.circleH = this.minS / 2;

		if (this.toggle) {
			this.shift = -(this.minS - this.circleW / 2);
		} else {
			this.shift = (this.minS - this.circleW / 2);
		}
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.angle);
		stroke(0);
		strokeWeight(0);
		fill(this.colors[0]);
		fill(this.colors[1]);
		ellipse(this.shift, 0, this.circleW, this.circleH);

		pop();
	}

	update() {
		if (0 < this.timer && this.timer < this.duration) {
			let nrm = norm(this.timer, 0, this.duration - 1);
			let n = nf(easeInOutQuint(nrm), 0, 4);
			this.circleW = lerp(this.minS / 4, this.minS / 2, sin(n * PI));
			this.circleH = lerp(this.minS / 2, this.minS / 4, sin(n * PI));
			if (this.toggle) {
				this.shift = lerp(-(this.minS - this.circleW / 2), (this.minS - this.circleW / 2), n);
			} else {
				this.shift = lerp((this.minS - this.circleW / 2), -(this.minS - this.circleW / 2), n);
			}

		}

		if (this.timer > this.duration) {
			if (this.toggle) {
				this.toggle = 0;
			} else {
				this.toggle = 1;
			}
			this.initialize();
		}

		this.timer++;
	}

	initialize() {
		this.timer = int(-random(restTime));
	}

	run() {
		this.show();
		this.update();
	}
}
/*------------------------------------------------------------------------------------------*/
