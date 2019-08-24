//游戏在一切就绪之后才会开始
function Game(){
    this.turnQueen = [];
    this.curTurn = null;
    //////DATA//////
    //这里的player_uid 是从datacache获得的
    this.player_uid = -1;
    this.world = new World();
}
Game.prototype.CreateWorld = function(data){
    this.world.Setup(data);
}
Game.prototype.Start = function(data){
    var self = this;
    this.player_uid = data.player_uid;
    data.turnsUID.forEach(uid => {
        self.turnQueen.push(new Turn(DataCache().GetOverlord(uid)));
    });
    //开始主循环
    this.Loop();
}
Game.prototype.StartTurn = function(){
    this.curTurn = this.turnQueen.shift();
    this.curTurn.Enter();
}
Game.prototype.DoTurn = function(){
    if(!this.curTurn){
        this.StartTurn();
    }
    if(this.curTurn){
        this.curTurn.Execute();
    }
}
Game.prototype.EndTurn = function(){
    this.curTurn.Exit();
    this.turnQueen.push(this.curTurn);
    this.curTurn = null;
}
Game.prototype.GameOver = function(){

}
Game.prototype.Loop = function(){
    requestAnimationFrame(Game.prototype.Loop.bind(this));
    //
    this.DoTurn();
    this.UpdateHTML();
    this.UpdateUI();
}
Game.prototype.UpdateHTML = function(){
    this.world.UpdateHTML();
}
Game.prototype.UpdateUI = function(){
    //
    var btn = document.getElementById('btn_1');
    btn.disabled = !(this.curTurn && this.curTurn.lord.uid == this.player_uid);
    btn = document.getElementById('btn_2');
    btn.disabled = !(this.curTurn && this.curTurn.lord.uid == this.player_uid);
    btn = document.getElementById('btn_3');
    btn.disabled = !(this.curTurn && this.curTurn.lord.uid == this.player_uid);
    var info = document.getElementById('info');
    info.innerText= "当前回合[" + this.curTurn.lord.name +"]";
}

var GameInstance = (function () {
    var instance;
    return function () {
        if (!instance) {
            instance = new Game();
        }
        return instance;
    }
})();
//回合
function Turn(load){
    this.lord = load;
}
Turn.prototype.Enter = function(){

}
Turn.prototype.Execute = function(){
    
}
Turn.prototype.Exit = function(){
    
}
//
Turn.prototype.GetLordID = function(){
    return this.lord.uid;
}
//城主
function Overlord(uid,color){
    this.uid = uid;
    this.name = "unnamed";
    this.color = color || "#f00";
    //此处保存tid!
    this.ownTerritories = [];   
    //
}
Overlord.prototype.Serialize = function(){
    return {

    };
}
Overlord.prototype.Unserialize = function(data){
    this.uid = data.uid || this.uid;
    this.ownTerritories = data.territories;    //store tid
    this.name = data.name;
}
Overlord.prototype.IsOwnTerritory = function(tid){
    return !!this.ownTerritories.find(function(t){
        return (t == tid);
    });
}
Overlord.prototype.DoAction_UpgradeDiscNum = function(tid){
    if(this.IsOwnTerritory(tid)){
        console.log("overlord[" + this.uid + "]---UpgradeDisc");
        Net.Req_UpgradeDiscNum(this.uid,tid);
    }
}
Overlord.prototype.DoAction_UpgradeDiscValue = function(tid){
    if(this.IsOwnTerritory(tid)){
        console.log("overlord[" + this.uid + "]---UpgradeValue");
        Net.Req_UpgradeDiscValue(this.uid,tid);
    }
}
Overlord.prototype.DoAction_Attack = function(f_tid,t_tid){
    if(this.IsOwnTerritory(f_tid) && !this.IsOwnTerritory(t_tid)){
        console.log("overlord[" + this.uid + "]---Attack");
        Net.Req_AttackTerritory(this.uid,f_tid,t_tid);
    }
}
Overlord.prototype.DoAction_Pass = function(){
    if(GameInstance().curTurn.GetLordID() == uid){
        console.log("overlord[" + this.uid + "]---Pass");
        Net.Req_Pass(this.uid);
    }
}
Overlord.prototype._UpgradeDiscNum = function(tid){

}
Overlord.prototype._UpgradeDiscValue = function(tid){
    
}
Overlord.prototype._Attack = function(f_tid,t_tid){
    
}
Overlord.prototype._Pass = function(){
    
}
//-----------------------------------------
//  网络交换
function NetLayer(){
    this.ip = "127.0.0.1";
}
NetLayer.prototype.Start = function(){

}
NetLayer.prototype.Request = function( t/*message type */, msg ){
    //这里进行总的请求
    //Emit......
    console.log('emit msg[' + msg.toString() + ']');
}
//发送请求升级骰子个数
NetLayer.prototype.Req_UpgradeDiscNum = function(uid,tid){
    this.Request('rUDN',{uid:uid,tid:tid});
}
//获得升级骰子个数的返回消息
NetLayer.prototype.onUpgradeDiscNum = function(data){
    //如果有数据，且数据的ret是真
    if(data.ret){
        var tid = data.tid;
        var disc_num = data.dn;
    }
    else{
        console.log("onUpgradeDiscNum ret:" + data.ret); 
    }
}
//发送请求升级骰子最小值
NetLayer.prototype.Req_UpgradeDiscValue = function(uid,tid){
    this.Request('rUDV',{uid:uid,tid:tid});
    
}
//获得升级骰子最小值的返回消息
NetLayer.prototype.onUpgradeDiscValue = function(data){

}
//发送请求攻击消息
NetLayer.prototype.Req_AttackTerritory = function(uid,from_tid,to_tid){
    this.Request('rAT',{uid:uid,f_tid:from_tid,t_tid:to_tid});    
}
//获得攻击的返回消息
NetLayer.prototype.onAttackTerritory = function(data){

}
//发送过牌的消息
NetLayer.prototype.Req_Pass = function(uid){
    this.Request('rP',{uid:uid});    
}
//获得过牌的返回消息
NetLayer.prototype.onPass = function(data){

}
//获得游戏开始的消息
NetLayer.prototype.onGameStart = function(data){
    GameInstance().Start(data);
}
var Net = (function () {
    var instance;
    return function () {
        if (!instance) {
            instance = new NetLayer();
        }
        return instance;
    }
})();
//---------------------------------------------------
//  数据缓存,保存着各种相关核心数据
function DataCacheLayer(){
    this.max_land_num = 9;
    this.mapData = null;
    //这里保存着总的关键数据
    this.player_uid = -1;
    //保存overlord的实例
    this.overlords = [];
    //
    this.UID_COLOR = ["#f00","#0f0","#00f","#0ff","#ff0","#f0f","#fff"];

}
DataCacheLayer.prototype._DebugStart = function(){
    this.ReciveData({
        player_uid : 22,
        overlords : [{
            uid : 11,
            name : "电脑11",
            territories : [0]
        },{
            uid : 22,
            name : "温伟航",
            territories : [1]
        },{
            uid : 33,
            name : "电脑33",
            territories : [2] 
        },{ //无人占据的
            uid : 0,
            name : "n/a",
            territories : [3,4,5,6,7,8] 
        }],
        worldData : {
            max_land_num : this.max_land_num,
        }
    });
}
//从远端或者其他地方获得到数据
DataCacheLayer.prototype.ReciveData = function(data){
    var self = this;
    this.player_uid = data.player_uid;
    var idx = 1;
    GameInstance().CreateWorld(data.worldData);
    //将lord相关内容生成,保存起来
    data.overlords.forEach(function(lordData){
        //默认是白色
        var color = self.UID_COLOR[self.UID_COLOR.length - 1];
        //如果不是无人占据,则,填充颜色,玩家永远是红色
        if(lordData.uid != 0){
            color = (lordData.uid == data.player_uid ? self.UID_COLOR[0] : self.UID_COLOR[idx++]);
        } 
        var overlord = new Overlord(0,color);
        overlord.Unserialize(lordData);
        self.overlords.push(overlord);
        //将拥有的地形设置其overlord
        overlord.ownTerritories.forEach(tid =>{
            var t = GameInstance().world.GetTerritory(tid);
            t.SetOverlord(overlord);
        });
    });
    //
}
//得到世界地图
DataCacheLayer.prototype.GetWorldMap = function(){

}
DataCacheLayer.prototype.GetOverlord = function(uid){
    return this.overlords.find(function(lord){
        return (lord.uid == uid);
    });
}
//得到单例DataCache
var DataCache = (function () {
    var instance;
    return function () {
        if (!instance) {
            instance = new DataCacheLayer();
        }
        return instance;
    }
})();
//世界,可以理解为是地图数据
function World(){
    //这里保存着Territory的实例
    this.territories = [];
    this.worldMap_HTML = null;
}
//设置世界
World.prototype.Setup = function(data){
    //这里测试用，先得到svg的地图数据，其实这些数据应该是从DC传入的
    //其实现在有点写反了,应该是传入html数据,然后展示在页面上,然后从中提取数据
    for (var i = 0; i < data.max_land_num; ++i) {
        var land_block = document.getElementById('land_' + i.toString());
        var dests = land_block.getAttribute('link').split(',');
        var links = new Array();
        dests.forEach(n => {
            links.push(parseInt(n));
        });
        // //territoryData
        var td = {
            tid:i,
            caption:"区域_" + i,
            neighbour : links,
            dn : 1,
            dv : 1,
            gc : 1
        }
        var territory = new Territory(land_block);
        territory.Unserialize(td);
        this.territories.push(territory);
    }
}
World.prototype.GetTerritory = function(tid){
    return this.territories.find( t => {
        return (t.tid == tid);
    });
}
World.prototype.UpdateHTML = function(){
     //数据缓存池子，接受到数据后，用于更新前端页面
     var self = this;
     this.territories.forEach( t => {
        t.UpdateHTML(self);
     })
}
//国家---Overlord的特性相关
function Country(id){

}
Country.prototype.Inborn = function(){

}
//地域,这个只是表现层次
function Territory(html){
    this.html = html;
    this.tid = 0;
    this.caption = "区域";
    this.neighbour = [];
    //--------下面是动态设置的
    this.overlord = null;       //这里保存着overlord的类
    this.diceNum = 1;           //骰子个数
    this.diceValueMin = 1;      //骰子最小值
    this.diceValueMax = 6;      //骰子最大值
    this.gainCoin = 1;          //区域获得金币数
}
//序列化和反序列化
Territory.prototype.Serialize = function(){
    return {

    };
}
Territory.prototype.Unserialize = function(data){
    this.tid = data.tid;
    this.caption = data.caption;
    this.neighbour = data.neighbour;
    this.diceNum = data.dn;             //骰子个数
    this.diceValueMin = data.dv;        //骰子最小值
    this.diceValueMax = 6;              //骰子最大值
    this.gainCoin = data.gc;            //区域获得金币数
}
//
Territory.prototype.SetOverlord = function(lord){
    this.overlord = lord;
}
Territory.prototype.UpgradeDiceNum = function(dn){
    if(dn) this.diceNum = dn;
    else this.diceNum += 1;
}
Territory.prototype.UpgradeDiceValue = function(dv){
    if(dv) this.diceValueMin = dv;
    else this.diceValueMin += 1;    
}
Territory.prototype.IsNeighbour = function(tid){
    return !!this.neighbour.find(function(n){
        return (n == tid);
    });
}
Territory.prototype.UpdateHTML = function(world){
    this.html.firstElementChild.setAttribute('fill', this.overlord.color);
}
