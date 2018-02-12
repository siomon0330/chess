     
//检查浏览器是否支持canvas
function checkhHtml5() {
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
}       

//初始化游戏变量
function init() {
    canvasSupported = checkhHtml5();
    
    //记录每一步下的棋以便悔棋
    nowI = -1;
    nowJ = -1;
    
    //是否游戏结束
    isWin = false;
    
    //悔棋按钮现在为disabled
    $('#backBtn').isEnabled = false;
    $('#backBtn').addClass('disabled');
    
    //棋盘用于存放棋盘中落子的情况
    chessBox = [];
    for(var i = 0; i < 15; i++) {
            chessBox[i]=[];
            for(var j=0;j<15;j++){
                chessBox[i][j]=0;//初始值为0
            }
    }
}
        
  
//根据浏览器是否支持canvas选择渲染方式
function start(){
    
    //如果支持canvas
    if(canvasSupported){
        
       //如果有渲染的canvas，先remove掉，用于重新开始一局
       if (child = document.getElementById('mycanvas')){
           document.getElementById('panel-body').removeChild(child);
       } 
       
       //添加画布
       document.getElementById('panel-body').innerHTML +=  '<canvas id="mycanvas" height="450px" width="450px"></canvas>';
       //下一步谁下棋
       me = false;
       chess = document.querySelector('#mycanvas');
       context = chess.getContext('2d');
        
       //绘制棋盘
       drawBoard(context);
        
       //添加棋盘落子function
       chess.onclick = function(e){
                if(isWin){
                    return;
                }
                
                //悔棋按钮必须下了子才能用
                $('#backBtn').isEnabled = true;
                $('#backBtn').removeClass('disabled');
                var x = e.offsetX;//相对于棋盘左上角的x坐标
                var y = e.offsetY;//相对于棋盘左上角的y坐标
                var i = Math.floor(x/30);
                var j = Math.floor(y/30);

                //记录悔棋的坐标
                nowI = i;
                nowJ = j;
                if( chessBox[i][j] == 0 ) {
                    oneStep(i,j,me);

                    if(me){
                        chessBox[i][j]=2;
                        judge(2, i, j);
                    }else{
                        chessBox[i][j]=1;
                        judge(1, i, j);
                    }
                    
                    //更换下棋选手
                    me=!me;

                }
        }
       
    //不支持canvas，用div渲染
    }else{

        //如果有之前渲染的棋盘，先remove掉，用于重新开始一局
        if (child = document.getElementById('chessboard')){
           document.getElementById('panel-body').removeChild(child);
        }
        
        //添加棋盘
        document.getElementById('panel-body').innerHTML +=  '<div class="chessboard" id= "chessboard"></div>';
       
        //设置棋盘
        chessboard = document.getElementsByClassName('chessboard')[0];
        color = 'white';
        createBoard(chessboard);
        chessboard.onclick = setChess;
        }      

}
   
//重新开始或者初始化
function startOver() {

    init();
    start();

}

//棋盘格子的绘制--用于不支持canvas的div渲染
function createBoard () {
    for(var i = 0; i < 15; i++) {
        
        for(var j = 0; j < 15; j++){
            var div = document.createElement('div');
            div.className = 'chess'; 
            
            //id 用于方便后面棋子落位数据获取以及输赢判断的需要
            div.id = 'location-' + i + '-' + j;
            chessboard.appendChild(div);

            if(i == 0){
                div.className += ' top';
            }
            if(i == 14){
                div.className += ' bottom';
            }
            if(j == 0){
                div.className += ' left';
            }
            if(j == 14){
                div.className += ' right';
            }
            
        }
    }
}



//落棋，绘制棋子--用于不支持canvas的div渲染
function setChess () {
    if(isWin){
        return;
    }
    var event = event || window.event;
    var target = event.target;
    var data = target.id.split('-');
    var i = +data[1],
        j = +data[2];
    
    nowI = i;
    nowJ = j;
    $('#backBtn').isEnabled = true;
    $('#backBtn').removeClass('disabled');
    
    
    if(target.className !== 'chessboard') {
        if(target.className.indexOf('active') == -1) {
            target.className += ' active ' + color;
           
            if(color == 'white'){
                chessBox[i][j] = 1;
                judge(1, i, j);
            }else{
                chessBox[i][j] = 2;
                judge(2, i, j);
            }
          
            //改变下一步棋子的颜色
            color = color == 'black' ? 'white' : 'black';
            
            
        }
    }
    
}


//棋盘格子的绘制--用于支持canvas的canvas渲染
function drawBoard(context){
        for(var i=0;i<15;i++){
            context.strokeStyle="#B7B7B7";
            context.moveTo(15+i*30,15);//垂直方向画15根线，相距30px;
            context.lineTo(15+i*30,435);
            context.stroke();
            context.moveTo(15,15+i*30);//水平方向画15根线，相距30px;棋盘为14*14；
            context.lineTo(435,15+i*30);
            context.stroke();
        }
 }
   

//绘制棋子--用于支持canvas的canvas渲染
function oneStep(i,j,k) {

        context.beginPath();
        context.arc(15+i*30,15+j*30,15,0,2*Math.PI);//绘制棋子
        var g=context.createRadialGradient(15+i*30,15+j*30,12,15+i*30,15+j*30,0);//设置渐变
        if(k){                           //k=true是黑棋，否则是白棋
            g.addColorStop(0,'#0f0e0e');//黑棋
            g.addColorStop(1,'#ffffff');

        }else {
            g.addColorStop(0,'#cecccc');//白棋
            g.addColorStop(1,'#ffffff');
        }
        context.fillStyle=g;
        context.fill();
        context.closePath();
    }


//判断输赢，分上下左右对角线来找知否有连着的5个棋子  
function judge (num, x, y) {
    
    //左右方向  
    var n1 = 0;
    
    //上下方向  
    var n2 = 0;
    
    //左上到右下方向  
    var n3 = 0;
    
    // 右上到左下方向  
    var n4 = 0; 
    
    //***************左右方向**********************************  
    //先从点击的位置向左寻找，相同颜色的棋子n1自加，直到不是相同颜色的棋子，则跳出循环  
    for (var i = x; i >= 0; i--) {
        if (chessBox[i][y] != num) {
            break;
        }
        n1++;
    }
    //然后从点击的位置向右下一个位置寻找，相同颜色的棋子n1自加，直到不是相同颜色的棋子，则跳出循环  
    for (var i = x + 1; i < 15; i++) {
        if (chessBox[i][y] != num) {
            break;
        }
        n1++;
    }
    
    //****************上下方向******************************  
    for (var i = y; i >= 0; i--) {
        if (chessBox[x][i] != num) {
            break;
        }
        n2++;
    }
    for (var i = y + 1; i < 15; i++) {
        if (chessBox[x][i] != num) {
            break;
        }
        n2++;
    }
    
    //****************左上到右下斜方向******************************  
    for (var i = x, j = y; i >= 0, j >= 0; i--, j--) {
        if (i < 0 || j < 0 || chessBox[i][j] != num) {
            break;
        }
        n3++;
    }
    for (var i = x + 1, j = y + 1; i < 15, j < 15; i++, j++) {
        if (i >= 15 || j >= 15 || chessBox[i][j] != num) {
            break;
        }
        n3++;
    }
    
    //****************右上到左下斜方向******************************  
    for (var i = x, j = y; i >= 0, j < 15; i--, j++) {
        if (i < 0 || j >= 15 || chessBox[i][j] != num) {
            break;
        }
        n4++;
    }
    for (var i = x + 1, j = y - 1; i < 15, j >= 0; i++, j--) {
        if (i >= 15 || j < 0 || chessBox[i][j] != num) {
            break;
        }
        n4++;
    }
    
    
    var str;
    if (n1 >= 5 || n2 >= 5 || n3 >= 5 || n4 >= 5) {
        isWin = true;
        $('#backBtn').isEnabled = false;
        $('#backBtn').addClass('disabled');
        if (num == 1) { //白棋  
            str = "白棋赢了，游戏结束！"
        } else if (num == 2) { //黑棋  
            str = "黑棋赢了，游戏结束！"
        }
        
        //显示对话框通知玩家结果
       $('.modal-body').html(str);
       $('#resultBtn').click()

    }
}
      

//悔棋按钮
function back () {
    
    //已有输赢
    if(isWin){
        return;
    }
    
    //不能连续悔棋
    $('#backBtn').isEnabled = false;
    $('#backBtn').addClass('disabled');


    //canvas方式悔棋
    if(canvasSupported){
            me = !me;
            chessBox[nowI][nowJ] = 0;
            clearBoard(nowI, nowJ);
           
    //div渲染方式
    }else{

        color = color == 'black' ? 'white' : 'black';
        chessBox[nowI][nowJ] = 0;

        var id = 'location-' + nowI + '-' + nowJ;
        $('#'+id).removeClass('active white');
        $('#'+id).removeClass('active black');
    }

}
        
   
//悔棋清除棋盘--用于canvas方式           
function clearBoard (i, j){
    context.clearRect((i) * 30, (j) * 30, 30, 30);
    context.strokeStyle="#868686";
    context.beginPath();

    var x1 = 15 + i*30;
    var y1 = j*30;
    var y2 = j*30 + 30;
    //为了保证重画时不超出边界
    if(y1 < 15){
        y1 = 15;
    }
    if(y2 > 435){
        y2 = 435;
    }

    context.moveTo(x1 , y1);
    context.lineTo(x1 , y2);
    context.stroke();

    var x2 = i*30;
    var x3 = (i+1)*30;
    var y3 =j*30+15
    //为了保证重画时不超出边界
    if(x2 < 15){
        x2 = 15;
    }
    if(x3 > 435){
        x3 = 435
    }

    context.moveTo(x2, y3);
    context.lineTo(x3 , y3);
    context.stroke();

}

