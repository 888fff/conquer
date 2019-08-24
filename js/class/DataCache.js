/**
 * Created by wwh on 2019/8/22.
 */
function DataCacheLayer(){
    //
    this.worldMap = null;
    this.ui = null;
    this.gameManager = null;
    //这里保存着总的关键数据   登陆时候唯一的userID
    this.player_uid = "";
    //玩家的昵称
    this.player_nickname = "";
    //
    this.UID_COLOR_DICT = null;
}
DataCacheLayer.prototype.init = function (worldMap,ui,gameManager) {
    this.UID_COLOR_DICT = [];
    //下面是一些游戏中的图层和控件
    this.worldMap = worldMap;
    this.ui = ui;
    this.gameManager = gameManager;
};

DataCacheLayer.prototype.reset = function () {
    this.worldMap = null;
    this.UID_COLOR_DICT = null;
    this.ui = null;
    this.gameManager = null;
};

DataCacheLayer.prototype.parsePlayerInfo= function (data) {
    this.player_uid = data.uid;
    this.player_nickname = data.nickname;
};

DataCacheLayer.prototype.parseWorldMap = function (data) {
    //现在用默认地图，全图
    this.worldMap.createWorldMap();
    //this.worldMap.createWorldMapFromData(data);
};

DataCacheLayer.prototype.parseOverlords = function(data){
    var self = this;
    var overlordsData = data.slice(0);//复制一份
    var counter = 0;    //
    //这个overload是数据里面，包含当前主玩家的信息
    overlordsData.forEach(function(lordData){
        var overlord = new game.Overlord();
        overlord.setData(lordData);
        self.UID_COLOR_DICT[overlord.uid] = counter;
        overlord.setColorIndex(counter);
        counter += 1;
        self.gameManager.addOverlord(overlord);
    });
    //更新一下lord和territory的数据
    this.updateOverlordsTerritory();
};

DataCacheLayer.prototype.parseTurnsOrder = function (data) {
     this.gameManager.setTurnQueen(data);
};

DataCacheLayer.prototype.updateOverlordsTerritory = function () {
    this.gameManager.updateAllOverlordsTerritory();
};

DataCacheLayer.prototype.updateTerritory = function (uid,tData) {
    this.gameManager.updateTerritory(uid,tData);
};

DataCacheLayer.prototype.parseAttackResult = function(data){
    //这里解析data数据
    //播放攻击动画
    //TODO data.f_atk VS data.t_atk
    this.gameManager.vfxBubblingText(data.f_tid,data.f_atk.toString());
    this.gameManager.vfxBubblingText(data.t_tid,data.t_atk.toString());

    //
    if(data.ret){
        //重新设置区域归属
        //首先设置From的数值，此时，From的Lord没有变化，只是数据变了
        this.updateTerritory(data.f_uid,data.f_tid);
        //其次设置To的数值，此时，TO的Lord发生了变化，之前的Lord丢失掉这个Territory
        //game.dataCache.updateTerritory(data.t_uid,data.t_tid);
        //现在的Lord拥有这个Territory
        this.updateTerritory(data.f_uid,data.t_tid);

    }else{
        //如果攻击失败
        //首先设置From的数值，此时，From的Lord没有变化，只是数据变了
        this.updateTerritory(data.f_uid,data.f_tid);
        //其次设置To的数值，此时，TO的Lord没有变化，只是数据变了
        this.updateTerritory(data.t_uid,data.t_tid);
    }
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