class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.startButton = document.getElementById('start-btn');
        
        this.gridSize = 20;
        this.snake = [];
        this.food = {};
        this.direction = 'right';
        this.score = 0;
        this.gameLoop = null;
        this.speed = 150;
        
        this.startButton.addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // 预加载图像
        this.foodImage = new Image();
        this.foodImage.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIgZmlsbD0iI2ZmNDQ0NCIvPjxjaXJjbGUgY3g9IjciIGN5PSI3IiByPSIzIiBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==';
    }
    
    startGame() {
        this.snake = [
            {x: 5, y: 5},
            {x: 4, y: 5},
            {x: 3, y: 5}
        ];
        this.direction = 'right';
        this.score = 0;
        this.updateScore();
        this.generateFood();
        
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.gameStep(), this.speed);
        
        this.startButton.textContent = '重新开始';
    }
    
    gameStep() {
        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        if (this.checkCollision(head)) {
            this.endGame();
            return;
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
        } else {
            this.snake.pop();
        }
        
        this.draw();
    }
    
    checkCollision(head) {
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            return true;
        }
        
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }
    
    generateFood() {
        while (true) {
            this.food = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
            };
            
            const foodOnSnake = this.snake.some(segment =>
                segment.x === this.food.x && segment.y === this.food.y
            );
            
            if (!foodOnSnake) break;
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createLinearGradient(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                (segment.x + 1) * this.gridSize,
                (segment.y + 1) * this.gridSize
            );
            
            if (index === 0) { // 蛇头
                gradient.addColorStop(0, '#ff9933');
                gradient.addColorStop(1, '#ff6600');
                this.ctx.fillStyle = gradient;
                
                // 绘制蛇头主体
                this.ctx.beginPath();
                this.ctx.roundRect(
                    segment.x * this.gridSize,
                    segment.y * this.gridSize,
                    this.gridSize - 2,
                    this.gridSize - 2,
                    [8, 8, 4, 4]
                );
                this.ctx.fill();
                
                // 绘制眼睛
                this.ctx.fillStyle = '#000';
                const eyeSize = 3;
                const eyeOffset = 4;
                
                if (this.direction === 'right' || this.direction === 'left') {
                    this.ctx.fillRect(
                        segment.x * this.gridSize + (this.direction === 'right' ? 12 : 2),
                        segment.y * this.gridSize + eyeOffset,
                        eyeSize,
                        eyeSize
                    );
                    this.ctx.fillRect(
                        segment.x * this.gridSize + (this.direction === 'right' ? 12 : 2),
                        segment.y * this.gridSize + this.gridSize - eyeOffset - eyeSize,
                        eyeSize,
                        eyeSize
                    );
                } else {
                    this.ctx.fillRect(
                        segment.x * this.gridSize + eyeOffset,
                        segment.y * this.gridSize + (this.direction === 'down' ? 12 : 2),
                        eyeSize,
                        eyeSize
                    );
                    this.ctx.fillRect(
                        segment.x * this.gridSize + this.gridSize - eyeOffset - eyeSize,
                        segment.y * this.gridSize + (this.direction === 'down' ? 12 : 2),
                        eyeSize,
                        eyeSize
                    );
                }
            } else { // 蛇身
                gradient.addColorStop(0, '#4CAF50');
                gradient.addColorStop(1, '#388E3C');
                this.ctx.fillStyle = gradient;
                
                this.ctx.beginPath();
                this.ctx.roundRect(
                    segment.x * this.gridSize,
                    segment.y * this.gridSize,
                    this.gridSize - 2,
                    this.gridSize - 2,
                    4
                );
                this.ctx.fill();
            }
        });
        
        // 绘制食物
        this.ctx.drawImage(
            this.foodImage,
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize,
            this.gridSize
        );
    }
    
    handleKeyPress(event) {
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right'
        };
        
        const newDirection = keyMap[event.key];
        if (!newDirection) return;
        
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        
        if (opposites[newDirection] !== this.direction) {
            this.direction = newDirection;
        }
    }
    
    endGame() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        alert(`游戏结束！最终得分：${this.score}`);
    }
    
    updateScore() {
        this.scoreElement.textContent = `分数: ${this.score}`;
    }
}

// 初始化游戏
const game = new SnakeGame();