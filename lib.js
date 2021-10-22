
// 棋盘类
class Board{
    constructor(canvas_id, x, y, width, height, isRed = false){
        /** @type {HTMLCanvasElement} */
        this.element = document.getElementById(canvas_id);
        if (!this.element) throw new Error("canvas id错误！")
        if (!this.element.getContext) {
            throw new Error("当前canvas不存在getContext！")
        }
        /** @type {CanvasRenderingContext2D} */
        this.context = this.element.getContext('2d');

        this.rawX = x; // 原始棋盘x坐标
        this.rawY = y; // 原始棋盘y坐标
        this.rawWidth = width; // 棋盘原始宽度
        this.rawHeight = height; // 棋盘原始高度

        // g*8+5*g/12*2 <= w
        this.gridWidth = 0; // 每个格子的宽
        if(height>width){
            this.gridWidth = Math.floor(width/(8+5/12*2))-1
        }else{
            this.gridWidth = Math.floor(height/(9+5/12*2))-1
        }
        this.radius = Math.ceil(5*this.gridWidth/12); // 每个棋子的半径
        this.startX = x+this.radius+2; // 棋盘x坐标
        this.startY = y+this.radius+2; // 棋盘y坐标

        this.chess_map = {
            1:'車', 2:'马', 3:'相', 4:'仕', 5:'帅',6:'炮',7:'兵',// 红方
            11:'車', 12:'马', 13:'象', 14:'士', 15:'将',16:'炮',17:'卒', // 蓝方
        }

        this.board_map = [// 棋盘原点在左上角，向右为x轴正方向，向下为y轴正方向
            [1, 2, 3, 4, 5, 4, 3, 2, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 6, 0, 0, 0, 0, 0, 6, 0],
            [7, 0, 7, 0, 7, 0, 7, 0, 7],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [17, 0, 17, 0, 17, 0, 17, 0, 17],
            [0, 16, 0, 0, 0, 0, 0, 16, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [11, 12, 13, 14, 15, 14, 13, 12, 11],
        ]

        this.lastStep = [[0, 0, 0], [0 ,0 ,0]] // 上一步的走法， 第一个元素为起始信息，第二个为着子信息，其中的第一项为棋子，后两项分别为棋子的x， y坐标

        this.oldStyle = {// 保存旧的canvas样式
            'fillStyle':this.context.fillStyle,
            'strokeStyle':this.context.strokeStyle,
            'shadowColor':this.context.shadowColor,
            'shadowBlur':this.context.shadowBlur,
            'shadowOffsetX':this.context.shadowOffsetX,
            'shadowOffsetY':this.context.shadowOffsetY,
            'lineCap':this.context.lineCap,
            'lineJoin':this.context.lineJoin,
            'lineWidth':this.context.lineWidth,
            'miterLimit':this.context.miterLimit,
            'font':this.context.font,
            'textAlign':this.context.textAlign,
            'textBaseline':this.context.textBaseline,
            'globalAlpha':this.context.globalAlpha,
            'globalCompositeOperation':this.context.globalCompositeOperation
        }

        this.clickCallbackList = [];// 棋子被点击的回调函数列表, 类似function callback(chess, x, y)的函数,参数分别为棋子， x坐标， y坐标
        this.element.addEventListener('click', (event)=>{
            const x = event.offsetX, y = event.offsetY;
            for(let i=0;i<9;i++){
                for(let j=0;j<10;j++){
                    let rx = i*this.gridWidth+this.startX, ry = j*this.gridWidth+this.startY;
                    if(Math.pow(rx-x, 2)+Math.pow(ry-y, 2)<Math.pow(this.radius, 2)){
                        this.clickCallbackList.forEach((func)=>{
                            func(this.board_map[j][i], i, j);
                        })
                        return;
                    }
                }
            }
        })

        this.isRed = isRed; // 当前棋盘下方是否是红方
        if(isRed){// 默认上方是红方
            for(let i=0;i<Math.floor(this.board_map.length/2);i++){
                const tmp = this.board_map[i];
                this.board_map[i] = this.board_map[this.board_map.length-i-1]
                this.board_map[this.board_map.length-i-1] = tmp;
            }
        }
    }



    /**
     * 注册点击回调函数
     * @param {function} func 类似function callback(chess, x, y)的函数,参数分别为棋子， x坐标， y坐标
     */
    registerClickCallback(func){
        this.clickCallbackList.push(func);
    }

    /**
     * 渲染棋局
     */
    renderAll(){
        this.context.strokeStyle = 'black';

        const gridWidth = this.gridWidth;

        // 清空画布
        this.context.clearRect(this.rawX, this.rawY, this.rawWidth, this.rawHeight);

        //画棋盘
        for(let i=0;i<8;i++){
            for(let j=0;j<9;j++){
                if(j == 4){
                    if(i == 0){
                        // 连接两半棋盘
                        this.context.beginPath();
                        this.context.moveTo(this.startX, 4*gridWidth+this.startY);
                        this.context.lineTo(this.startX, 5*gridWidth+this.startY);
                        this.context.moveTo(this.startX+gridWidth*8, 4*gridWidth+this.startY);
                        this.context.lineTo(this.startX+gridWidth*8, 5*gridWidth+this.startY);
                        this.context.stroke();
                        this.context.closePath();

                        // 写楚河汉界
                        let oldFont = this.context.font
                        this.context.font = `${Math.ceil(gridWidth/2)}px Georgia`;
                        this.context.fillText('楚', this.startX+gridWidth*1, 5*gridWidth+this.startY-Math.ceil(gridWidth/3));
                        this.context.fillText('河', this.startX+gridWidth*2, 5*gridWidth+this.startY-Math.ceil(gridWidth/3));
                        this.context.fillText('汉', this.startX+gridWidth*5+Math.ceil(gridWidth/3), 5*gridWidth+this.startY-Math.ceil(gridWidth/3));
                        this.context.fillText('界', this.startX+gridWidth*6+Math.ceil(gridWidth/3), 5*gridWidth+this.startY-Math.ceil(gridWidth/3));
                        this.context.font = oldFont;
                    }
                }else this.context.strokeRect(this.startX+i*gridWidth, this.startY+j*gridWidth, gridWidth, gridWidth);
            }
        }

        // 画宫标记
        let palaceMap = [[3, 0, 5, 2], [5, 0, 3, 2], [3, 9, 5, 7], [5, 9, 3, 7]]
        this.context.beginPath();
        palaceMap.forEach((pos)=>{
            let [sx, sy, tx, ty] = pos;
            this.context.moveTo(sx*gridWidth+this.startX, sy*gridWidth+this.startY);
            this.context.lineTo(tx*gridWidth+this.startX, ty*gridWidth+this.startY);
        })
        this.context.stroke();
        this.context.closePath();

        //画标记
        let signs = [
            [1*gridWidth, 2*gridWidth], [7*gridWidth, 2*gridWidth], [0, 3*gridWidth], [2*gridWidth, 3*gridWidth], [4*gridWidth, 3*gridWidth], [6*gridWidth, 3*gridWidth], [8*gridWidth, 3*gridWidth], 
            [1*gridWidth, 7*gridWidth], [7*gridWidth, 7*gridWidth], [0, 6*gridWidth], [2*gridWidth, 6*gridWidth], [4*gridWidth, 6*gridWidth], [6*gridWidth, 6*gridWidth], [8*gridWidth, 6*gridWidth], 
        ]
        let offset = Math.ceil(gridWidth/10), signLength = Math.ceil(gridWidth/10);
        let directMap = [[-1, 1], [1,  -1], [-1, -1], [1, 1]];
        signs.forEach((pos)=>{
            let [x,y] = [pos[0]+this.startX, pos[1]+this.startY];
            this.context.beginPath();
            directMap.forEach((d)=>{
                let [dx, dy] = d;
                let [sx, sy] = [x+dx*offset, y+dy*offset];
                if(sx<this.startX||sx>(this.startX+gridWidth*8)) return;// 棋盘外的不绘制
                this.context.moveTo(sx, sy+dy*signLength);
                this.context.lineTo(sx, sy);
                this.context.lineTo(sx+dx*signLength, sy);
                this.context.stroke();
            })
            this.context.closePath();
        });

        let radius = this.radius;
        // 画棋盘上的棋子
        this.board_map.forEach((rows, row)=>{
            rows.forEach((chess, col)=>{
                if(chess == 0) return;
                let oldFont = this.context.font;
                let rx = col*gridWidth+this.startX, ry = row*gridWidth+this.startY;
                let fontWidth = radius;
                this.context.fillStyle = "#E4A241";
                this.context.font = `${fontWidth}px Georgia`;
                this.context.beginPath();
                this.context.arc(rx, ry, radius, 0, 2*Math.PI);
                this.context.fill();
                this.context.closePath();

                this.context.textAlign = "center";
                this.context.textBaseline = "middle";
                if(chess>10) this.context.fillStyle = "blue"; else this.context.fillStyle = "red";
                this.context.fillText(this.chess_map[chess], rx, ry);
                this.context.font = oldFont;
            })
        })

        // 画着子路径
        let [[chess_1, sx, sy], [chess_2, tx, ty]] = this.lastStep;
        if(chess_1 != 0){
            [[sx, sy], [tx, ty]].forEach((pos)=>{
                let r = radius;
                let [x, y] = [pos[0]*gridWidth+this.startX, pos[1]*gridWidth+this.startY];
                //this.context.strokeRect(x, y, 2*r, 2*r);
                let directMap = [[-1, 1], [1,  -1], [-1, -1], [1, 1]];
                let w = Math.ceil(r/3);
                this.context.strokeStyle = "red";
                this.context.lineWidth = 3;
                this.context.beginPath();
                directMap.forEach((d)=>{
                    let [dx, dy] = d;
                    this.context.moveTo(x+dx*r-dx*w, y+dy*r);
                    this.context.lineTo(x+dx*r, y+dy*r);
                    this.context.lineTo(x+dx*r, y+dy*r-dy*w);
                })
                this.context.stroke();
                this.context.closePath();
            })
        }

        // 重置样式
        for(let k in this.oldStyle){
            this.context[k] = this.oldStyle[k];
        }

        //this.context.fillRect(this.rawX, this.rawY, this.rawWidth, this.rawHeight);
    }

    renderNextStep(posList){
        this.context.beginPath();
        this.context.fillStyle = 'red';
        posList.forEach((pos)=>{
            let x = pos[0]*this.gridWidth+this.startX, y = pos[1]*this.gridWidth+this.startY;
            this.context.moveTo(x, y);
            this.context.arc(x, y, this.radius/3, 0, 2*Math.PI);
        })
        this.context.fill();
        this.context.closePath();
        // 重置样式
        for(let k in this.oldStyle){
            this.context[k] = this.oldStyle[k];
        }
    }

    /**
     * 判断是否是红方的回合
     * @returns 返回是否是红方的回合 
     */
    isRedRound(){
        return this.lastStep[1][0]<10 
    }

    /**
     * 判断两个棋子是否是同色的
     * @param {int} 棋子1
     * @param {int} 棋子2 
     * @returns 同色则返回true，否则false
     */
    isFriend(chess1, chess2){
        return chess1*chess2!=0 && (chess1-10)*(chess2-10)>0
    }

    /**
     * 移动棋子，成功返回true, 失败返回false（坐标越界或起始点没有棋子或目标位置是自家的棋子）.该方法不会进行任何规则运算
     * @param {int} sx 起始x坐标
     * @param {int} sy 起始y坐标
     * @param {int} tx 目标x坐标
     * @param {int} ty 目标y坐标
     */
    step(sx, sy, tx, ty){
        try {
            let src_chess = this.board_map[sy][sx];
            let t_chess = this.board_map[ty][tx];
            if(src_chess === undefined||t_chess===undefined) return false;
            if(src_chess === 0 || this.isFriend(src_chess, t_chess)) return false;
            this.board_map[ty][tx] = src_chess;
            this.board_map[sy][sx] = 0
            this.lastStep = [[src_chess, sx, sy], [t_chess, tx, ty]];
        } catch {
            return false;
        }
        
        return true;
    }

    /**
     * 选中棋盘上的一个棋子， 这主要是为了渲染当前选中的棋子
     * @param {int} sx 棋子x坐标
     * @param {int} sy 棋子y坐标
     */
    selectChess(sx, sy){
        try{
            let c = this.board_map[sy][sx];
            if(c===undefined) return;
            this.lastStep = [[c, sx, sy], [c, sx, sy]]
        }catch{}
    }


}

//着子规则类
class ChessRule{
    constructor(board){
        /** @type {Board} */
        this.board = board;
    }

    inRound(x, y){
        return !(x<0||x>8||y<0||y>9)
    }

    /**
     * 判断两个棋子是否是同色的
     * @param {int} 棋子1
     * @param {int} 棋子2 
     * @returns 同色则返回true，否则false
     */
     isFriend(chess1, chess2){
        return chess1*chess2!=0 && (chess1-10)*(chess2-10)>0
    }


    /**
     * 返回当前棋子下一步所有可行的着子位置
     * @param {int} sx 当前棋子x坐标
     * @param {int} sy 当前棋子y坐标
     * @returns 返回所有可能的着子位置列表，其中每一项为一个二元列表 分别表示x，y坐标
     */
    nextStep(sx, sy){
        let ret = [];
        if(!this.inRound(sx, sy)) return ret;
        const chess = this.board.board_map[sy][sx];
        if(chess == 0) return ret;
        switch (chess%10) {
            case 1:
                ret = this._cheRule(chess, sx, sy);
                break;
            case 2:
                ret = this._maRule(chess, sx, sy);
                break;
            case 3:
                ret = this._xiangRule(chess, sx, sy);
                break;
            case 4:
                ret = this._shiRule(chess, sx, sy);
                break;
            case 5:
                ret = this._jiangRule(chess, sx, sy);
                break;
            case 6:
                ret = this._paoRule(chess, sx, sy);
                break;
            case 7:
                ret = this._bingRule(chess, sx, sy);
                break;
            default:
                break;
        }
        return ret;
    }

    _maRule(chess, x, y){
        let ret = [];
        let directMap = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]];
        directMap.forEach((d)=>{
            try{
                let [dx, dy] = d;
                let tx = x+dx, ty = y+dy;
                let tmp = this.board.board_map[ty][tx];
                if(tmp === undefined) return;
                else if(tmp == 0||!this.isFriend(chess, tmp)){
                    //判断是否别马腿
                    dx = (dx/Math.abs(dx))*(Math.abs(dx)-1);
                    dy = (dy/Math.abs(dy))*(Math.abs(dy)-1);
                    let mx = x+dx, my = y+dy;
                    tmp = this.board.board_map[my][mx];
                    if(tmp === 0) ret.push([tx, ty]);
                }
            }catch{}
        })
        return ret;
    }

    _cheRule(chess, x, y){
        let ret = [];
        let directMap = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        directMap.forEach((d)=>{
            const [dx, dy] = d;
            for(let i=1;i<10;i++){
                const tx = dx*i+x, ty = dy*i+y;
                try{
                    const tmp = this.board.board_map[ty][tx];
                    if(tmp===undefined) return;
                    if(tmp === 0) ret.push([tx, ty]);
                    else if(!this.isFriend(chess, tmp)){
                        ret.push([tx, ty]);
                        return;
                    }else{
                        return;
                    }
                }catch{
                    return;
                }
            }
        })
        return ret;
    }

    _xiangRule(chess, x, y){
        let ret = [];
        let directMap = [[2, 2], [-2, 2], [2, -2], [-2, -2]];
        directMap.forEach((d)=>{
            try{
                let [dx, dy] = d;
                let tx = x+dx, ty = y+dy;
                let tmp = this.board.board_map[ty][tx];
                if(tmp === undefined) return;
                else if(tmp == 0||!this.isFriend(chess, tmp)){
                    // 判断是否过河，象不能过河
                    if(!(ty>4&&y>4||9-ty>4&&9-y>4)) return;

                    //判断是否别象眼
                    dx = (dx/Math.abs(dx))*(Math.abs(dx)-1);
                    dy = (dy/Math.abs(dy))*(Math.abs(dy)-1);
                    let mx = x+dx, my = y+dy;
                    tmp = this.board.board_map[my][mx];
                    if(tmp === 0) ret.push([tx, ty]);
                }
            }catch{}
        })
        return ret;
    }

    _shiRule(chess, x, y){
        let ret = [];
        let directMap = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
        directMap.forEach((d)=>{
            try{
                let [dx, dy] = d;
                let tx = x+dx, ty = y+dy;
                let tmp = this.board.board_map[ty][tx];
                if(tmp === undefined) return;
                else if(tmp == 0||!this.isFriend(chess, tmp)){
                    // 判断是否出宫，士不能出宫
                    if(tx>2&&tx<6&&(ty>=0&&ty<=2||ty>=7&&ty<=9)){
                        ret.push([tx, ty]);
                    }
                }
            }catch{}
        })
        return ret;
    }

    _jiangRule(chess, x, y){
        let ret = [];
        let directMap = [[1, 0], [-1, 0], [0, -1], [0, 1]];
        directMap.forEach((d)=>{
            try{
                let [dx, dy] = d;
                let tx = x+dx, ty = y+dy;
                let tmp = this.board.board_map[ty][tx];
                if(tmp === undefined) return;
                else if(tmp == 0||!this.isFriend(chess, tmp)){
                    // 判断是否出宫，将不能出宫
                    if(tx>2&&tx<6&&(ty>=0&&ty<=2||ty>=7&&ty<=9)){
                        ret.push([tx, ty]);
                    }
                }
            }catch{}
        })
        return ret;
    }

    _paoRule(chess, x, y){
        let ret = [];
        let directMap = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        directMap.forEach((d)=>{
            const [dx, dy] = d;
            for(let i=1;i<10;i++){
                const tx = dx*i+x, ty = dy*i+y;
                try{
                    let tmp = this.board.board_map[ty][tx];
                    if(tmp===undefined) return;
                    if(tmp === 0) ret.push([tx, ty]);
                    else{
                        //判断炮是否可以打子
                        for(let j=1;j<10;j++){
                            const mx = dx*j+tx, my = dy*j+ty;
                            tmp = this.board.board_map[my][mx];
                            if(tmp === undefined) return;
                            else if(tmp === 0) continue;
                            else if(!this.isFriend(chess, tmp)){
                                ret.push([mx, my]);
                                return;
                            }else{
                                return;
                            }
                        }
                    }
                }catch{
                    return;
                }
            }
        })
        return ret;
    }

    _bingRule(chess, x, y){
        let ret = [];
        let directMap = [];
        let s = (chess-10)/Math.abs(chess-10); // 红棋为-1，蓝棋为+1
        s = this.board.isRed?s:-s; // 兵的行进方向
        directMap.push([0, s]);
        if((y<5&&s<0)||(y>=5&&s>0)){
            directMap.push([1, 0], [-1, 0]);
        }

        directMap.forEach((d)=>{
            try{
                let [dx, dy] = d;
                let tx = x+dx, ty = y+dy;
                let tmp = this.board.board_map[ty][tx];
                if(tmp === undefined) return;
                else if(tmp == 0||!this.isFriend(chess, tmp)){
                    ret.push([tx, ty]);
                }
            }catch{}
        })
        return ret;
    }
}

// 主类
class ChineseChess{
    constructor(canvas_id, ai1, ai2){
        this.redRound = true;//是否该红方着子

        this.board = new Board(canvas_id, 10, 10, 540, 600, this.redRound);
        this.rule = new ChessRule(this.board);
        this.board.registerClickCallback((chess, x, y)=>{
            if(chess == 0) return;
            this.board.selectChess(x, y);
            this.board.renderAll();
            const a = this.rule.nextStep(x, y);
            console.log(a);
            this.board.renderNextStep(a);
        });
        this.board.renderAll();

        /** @type {string} */
        this.red_api = document.getElementById(ai1).value;// 红方
        /** @type {string} */
        this.blue_api = document.getElementById(ai2).value;// 蓝方

        if(this.red_api === '' || this.blue_api === ''){
            this.human(this.red_api?false:true);
        }
    }

    run(){
        let api = this.redRound?this.red_api:this.blue_api;
        if(api === ''){
            // 人类
            return;
        }else{
            // ai
            fetch(api, {
                method:'POST',
                body:JSON.stringify({
                    chessboard:this.board.board_map,
                    round:this.redRound?'red':'blue'
                })
            }).then((res)=>{
                if(res.ok){
                    res.json().then((data)=>{
                        let [sx, sy, tx, ty] = data;
                        this.board.step(sx, sy, tx, ty);
                        this.board.renderAll();
                        this.redRound = !this.redRound;
                        this.run();
                    })
                }
            })
        }
    }


    human(red){
        this.lastClick = [];
        this.lastPos = [];
        this.board.registerClickCallback((chess, x, y)=>{
            if(this.redRound && red || !this.redRound && !red){
                if(this.lastClick.length == 0){
                    this.lastClick = this.rule.nextStep(x, y);
                    this.lastPos = [x, y];
                }else{
                    let r = this.lastClick.some((pos)=>{
                        if(pos[0] === x && pos[1] === y){
                            this.board.step(this.lastPos[0], this.lastPos[1], x, y);
                            this.board.renderAll();
                            this.lastClick = [];
                            this.lastPos = [];
                            
                            this.redRound = !this.redRound;
                            this.run();
                            return true;
                        }
                        return false;
                    })
                    if(chess != 0 && !r){
                        this.lastClick = this.rule.nextStep(x, y);
                        this.lastPos = [x, y];
                    }
                }
            }
        })
    }

}