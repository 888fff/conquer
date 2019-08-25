/**
 * Created by wwh on 2019/8/22.
 */
game.Overlord = me.Object.extend({

    init: function init() {
        this.uid = "";
        this.nickname = "unnamed";
        this.colorIndex = -1;
        this.ap = 1;
        //此处保存territory的hexCoord和一些基础数据
        this.ownTerritories = [];
    },

    setData : function setData(data) {
        this.uid = data.uid;
        this.ownTerritories = data.territories;    //store tid
        this.nickname = data.nickname;
    },

    setColorIndex : function (idx) {
        this.colorIndex = idx;
    },

    /**
     * @return {boolean}
     */
    IsOwnTerritory : function(hexCoord) {
        var ret = this.ownTerritories.find(function(t){
            return (t.x === hexCoord.x && t.y === hexCoord.y);
        });
        return !!ret;
    },

    refreshAP : function(){
        this.ap = this.ownTerritories.length;
    },

    setAP : function(ap){
        this.ap = ap;
    },

    getAP : function(){
        return this.ap;
    },

    expenseAP : function(cost){
         if(cost < this.ap){
            return false;
         }
         this.ap -= cost;
         return true;
    },

    hasAnyTerritory : function(){
        return this.ownTerritories.length >= 1;
    },

    updateTerritory : function (territoryData,remove) {
        var found = false;
        var i = 0;
        for(i = 0;i<this.ownTerritories.length;++i){
            if( this.ownTerritories[i].x === territoryData.x &&
                this.ownTerritories[i].y === territoryData.y){
                found = true;
                if(remove === true){
                    this.ownTerritories.splice(i,1);
                    break;
                }else{
                    this.ownTerritories[i] = territoryData;
                }
            }
        }
        if(!found){
            this.ownTerritories.push(territoryData);
        }
    },

    doAction_UpgradeDiscNum : function(tid){
        if(this.IsOwnTerritory(tid)){
            console.warn("overlord[" + this.uid + "]---UpgradeDisc");
            game.net.Req_UpgradeDiscNum(this.uid,tid);
        }
    },
    doAction_UpgradeDiscValue : function(tid){
        if(this.IsOwnTerritory(tid)){
            console.warn("overlord[" + this.uid + "]---UpgradeValue");
            game.net.Req_UpgradeDiscValue(this.uid,tid);
        }
    },
    doAction_Attack : function(f_tid,t_tid){
        if(this.IsOwnTerritory(f_tid) && !this.IsOwnTerritory(t_tid)){
            console.warn("overlord[" + this.uid + "]->Attack->(" + t_tid.x +',' +t_tid.y + ')');
            game.net.Req_AttackTerritory(this.uid,f_tid,t_tid);
        }
    },
    doAction_Pass : function(){
        console.warn("overlord[" + this.uid + "]---Pass");
        game.net.Req_Pass(this.uid);

    },
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



});
