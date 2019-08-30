/**
 * Created by wwh on 2019/8/22.
 */
game.Overlord = me.Object.extend({

    init: function() {
        this.uid = "";
        this.nickname = "unnamed";
        this.colorIndex = -1;
        this.ap = 1;
        //此处保存territory的hexCoord和一些基础数据
        this.ownTerritories = [];
    },

    setData : function(data) {
        this.uid = data.uid;
        this.ownTerritories = data.t;    //store tid
        this.nickname = data.nickname;
        this.ap = data.ap;
    },

    setColorIndex : function (idx) {
        this.colorIndex = idx;
    },

    /**
     * @return {boolean}
     */
    isOwnTerritory : function(hexCoord) {
        var ret = this.ownTerritories.find(function(t){
            return (t.tid.x === hexCoord.x && t.tid.y === hexCoord.y);
        });
        return ret !== undefined;
    },

    setAP : function(ap){
        this.ap = ap;
    },

    getAP : function(){
        return this.ap;
    },

    hasAnyTerritory : function(){
        return this.ownTerritories.length >= 1;
    },

    removeTerritory: function (hexCoord) {
        var idx = this.ownTerritories.findIndex(function (tData) {
            return (hexCoord.x === tData.tid.x && hexCoord.y === tData.tid.y);
        });
        if (idx !== -1) {
            this.ownTerritories.splice(idx, 1);
            return true;
        }
        return false;
    },

    addTerritory: function (territoryData, canUpdate) {
        var idx = this.ownTerritories.findIndex(function (tData) {
            return (territoryData.tid.x === tData.tid.x && territoryData.tid.y === tData.tid.y);
        });
        //有这个territory，意味着更新
        if (idx !== -1) {
            if (canUpdate)
                this.ownTerritories[idx] = territoryData;
        } else {
            //没有这个territory，意味着Add
            this.ownTerritories.push(territoryData);
        }
    },

    updateTerritory: function (territoryData) {
        this.addTerritory(territoryData, true);
    },

    doAction_UpgradeDiscNum : function(tid){
        if(this.isOwnTerritory(tid)){
            console.warn("overlord[" + this.uid + "]---UpgradeDisc");
            game.net.Req_UpgradeDiscNum(this.uid,tid);
        }
    },
    doAction_UpgradeDiscValue : function(tid){
        if(this.isOwnTerritory(tid)){
            console.warn("overlord[" + this.uid + "]---UpgradeValue");
            game.net.Req_UpgradeDiscValue(this.uid,tid);
        }
    },
    doAction_Attack : function(f_tid,t_tid){
        if(this.isOwnTerritory(f_tid) && !this.isOwnTerritory(t_tid)){
            console.warn("overlord[" + this.uid + "]->Attack->(" + t_tid.x +',' +t_tid.y + ')');
            game.net.Req_AttackTerritory(this.uid,f_tid,t_tid);
        }
    },
    doAction_Pass : function(){
        console.warn("overlord[" + this.uid + "]---Pass");
        game.net.Req_Pass(this.uid);
        game.dataCache.gameManager.curTurnUID = null;

    },
    /*
    doAction_LoseGame : function(){
        console.warn("overlord[" + this.uid + "]---LoseGame");
        game.net.Req_Lose(this.uid);
    },

    _LoseGame : function(){
        console.warn("overlord[" + this.uid + "]---be conquered!");
    },

    _UpgradeDiscNum : function(tid){

    },
    _UpgradeDiscValue : function(tid){

    },
    _Attack : function(f_tid,t_tid){

    },
    _Pass : function(){

    }
    */


});
