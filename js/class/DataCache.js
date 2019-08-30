/**
 * Created by wwh on 2019/8/22.
 */
function DataCacheLayer(){
    //
    this.worldMap = null;
    this.ui = null;
    this.gameManager = null;
    //
    this.UID_COLOR_DICT = [];
    //这里保存着总的关键数据   登陆时候唯一的userID
    this.player_uid = "";
    //玩家的昵称
    this.player_nickname = "";
    //缓冲的内容
    this.curTurnData = null;
    this.worldData = null;
    this.overlordsData = null;
    this.netInfo = "";
    //
    this.gameManager = null;
}
DataCacheLayer.prototype.createMelonJSComponent = function(){
    this.gameManager = new game.GameManager();
};

DataCacheLayer.prototype.init = function (worldMap,ui) {
    //下面是一些游戏中的图层和控件
    this.worldMap = worldMap;
    this.ui = ui;
};

DataCacheLayer.prototype.reset = function () {
    this.worldMap = null;
    this.UID_COLOR_DICT = [];
    this.ui = null;
    this.gameManager = null;
    //
    this.curTurnData = null;
    this.worldData = null;
    this.overlordsData = null;
};

DataCacheLayer.prototype.parseWorldMap = function (data) {
    //现在用默认地图，全图
    game.dataCache.worldData = data;
};

DataCacheLayer.prototype.parseOverlords = function(data){
    let self = this;
    let counter = 0;    //
    this.overlordsData = data;
    //这个overload是数据里面，包含当前主玩家的信息
    this.overlordsData.forEach(function(lordData){
        var overlord = new game.Overlord();
        overlord.setData(lordData);
        self.UID_COLOR_DICT[overlord.uid] = counter;
        counter += 1;
        overlord.setColorIndex(counter);
        self.gameManager.addOverlord(overlord);
    });
    //更新一下lord和territory的数据,放在世界生成后去做
    //this.updateOverlordsTerritory();
};
DataCacheLayer.prototype.parseCurTurn = function (data) {
    if(data){
        this.curTurnData = data.uid;
        if(this.gameManager)
            this.gameManager.setCurTurnUID(this.curTurnData,data);
    }
};

DataCacheLayer.prototype.parsePassData = function (data) {
    if(data.uid === this.player_uid)
        if(this.gameManager)
            this.gameManager.ui.hideTerritoryBtn();

};
DataCacheLayer.prototype.launchGame = function () {
    game.launch_game = true;
};

DataCacheLayer.prototype.parseLoseGameData = function(data){
    this.gameManager.overlordLoseGame(data.uid,data.rd);
};
DataCacheLayer.prototype.parseWinGameData = function(data){
    this.gameManager.overlordWinGame(data.uid,data.rd);
};


DataCacheLayer.prototype.parseUpgradeDiscNum = function(data){
    data = data.extra;
    if(data.ret){
        let uid = data.uid;
        let tid = data.tid;
        let disc_num = data.dn;
        let territory = this.worldMap.getTerritory(tid);
        if(uid === territory.overlord.uid){
            territory.upgradeDiceNum(disc_num);
        }
        let ol = this.gameManager.getOverlord(data.uid);
        ol.setAP(data.ap);
    }
    else{
        console.log(data.uid +" UpgradeDiscNum ret:" + data.ret);
    }
};
DataCacheLayer.prototype.parseUpgradeDiscValue = function(data){
    data = data.extra;
    if(data.ret){
        var uid = data.uid;
        var tid = data.tid;
        var disc_value = data.dv;
        var territory = this.worldMap.getTerritory(tid);
        if(uid === territory.overlord.uid){
            territory.upgradeDiceValue(disc_value);
        }
        var ol = this.gameManager.getOverlord(data.uid);
        ol.setAP(data.ap);
    }
    else{
        console.log(data.uid +" UpgradeDiscNum ret:" + data.ret);
    }
};

DataCacheLayer.prototype.parseAttackResult = function(data){
    //这里解析data数据
    //播放攻击动画
    //TODO data.f_atk VS data.t_atk
    data = data.extra;
    let f_tData = data.f_tData;
    let t_tData = data.t_tData;
    this.gameManager.vfxBubblingText(f_tData.tid,data.f_atk.toString());
    this.gameManager.vfxBubblingText(t_tData.tid,data.t_atk.toString());
    //
    let ol = this.gameManager.getOverlord(data.f_uid);
    ol.setAP(data.ap);
    //
    if(data.ret){
        //重新设置区域归属
        this.gameManager.updateTerritory(data.f_uid,f_tData,'update');
        this.gameManager.updateTerritory(data.t_uid,t_tData,'delete');
        this.gameManager.updateTerritory(data.f_uid,t_tData,'add');


    }else{
        //如果攻击失败
        //首先设置From的数值，此时，From的Lord没有变化，只是数据变了
        this.gameManager.updateTerritory(data.f_uid,f_tData,'update');
        //其次设置To的数值，此时，TO的Lord没有变化，只是数据变了
        this.gameManager.updateTerritory(data.t_uid,t_tData,'update');
    }
};

DataCacheLayer.prototype.updateOverlordsTerritory = function () {
    this.gameManager.updateAllOverlordsTerritory();
};


game.dataCache = new DataCacheLayer();
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