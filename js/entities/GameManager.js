/**
 * Created by wwh on 2019/8/22.
 */
game.GameManager = me.Renderable.extend({
    init: function() {
        this.ready = false;
        //
        this._super(me.Renderable, 'init', [ 0, 0, 1, 1 ]);
        this.world = me.game.world.getChildByName("WorldMap")[0];
        this.vfx =   me.game.world.getChildByName("VFX")[0];

        this.turnQueen = [];
        this.curTurn = null;
        this.overlords = [];    //这里是装载overlords的实例容器
        //
        this.name = "GameMgr";

    },

    getMainOverlord : function () {
        return this.getOverlord(game.dataCache.player_uid);
    },

    isMainOverlord : function(lord){
        if(lord){
            return lord.uid == game.dataCache.player_uid;
        }
        return false;
    },

    getOverlord : function (uid) {
        return this.overlords.find(function (lord) {
            return lord.uid == uid;
        });
    },

    addOverlord : function (lord) {
        this.overlords.push(lord);
    },

    updateAllOverlordsTerritory : function () {
        var self = this;
        this.overlords.forEach(function (lord) {
            lord.ownTerritories.forEach(function (territoryData) {
                //territoryData这里不但有hexCoord还有DiscNum等数据
                var t = self.world.getTerritory(territoryData);
                if(t){
                    t.setOverlord(lord);
                    t.setData(territoryData);
                }
            });
        });
    },

    updateTerritory : function (uid,territoryData) {
        //首先找到这个territory，然后设置
        var territory = this.world.getTerritory(territoryData);
        territory.setData(territoryData);
        //找到overlord
        var overlord = this.getOverlord(uid);
        if(territory){
            if(territory.overlord == null){
                territory.setOverlord(overlord);
                overlord.updateTerritory(territoryData,false);

            }else if(territory.overlord.uid == uid){
                overlord.updateTerritory(territoryData,false);
            }else if(territory.overlord.uid != uid){
                var old_overlord = this.getOverlord(territory.overlord.uid);
                territory.setOverlord(overlord);
                overlord.updateTerritory(territoryData,false);
                old_overlord.updateTerritory(territoryData,true);
            }
        }
    },

    setTurnQueen : function (turnsUID_Array) {
        var self = this;
        turnsUID_Array.forEach(function(uid){
            var lord = self.getOverlord(uid);
            self.turnQueen.push(new Turn(lord));
        });
    },

    vfxBubblingText : function (tid,label) {
        var t = this.world.getTerritory(tid);
        this.vfx.spawn_Bubbling_Text(t.pos,label);
    },

    start : function(){
        this.ready = true;
    },

    end : function () {
        this.ready = false;
    },

    startTurn : function(){
        this.curTurn = this.turnQueen.shift();
        this.curTurn.enter();
    },
    doTurn : function(){
        if(!this.curTurn){
            this.startTurn();
        }
        if(this.curTurn){
            this.curTurn.execute();
        }
    },
    endTurn : function(){
        this.curTurn.exit();
        this.turnQueen.push(this.curTurn);
        this.curTurn = null;
    },
    
    update : function (dt) {
        if(this.ready){
            this._super(me.Renderable, "update", [ dt ]);
            this.doTurn();
        }
    }

});

function Turn(load){
   this.lord = load;
}
Turn.prototype.enter = function(){

};
Turn.prototype.execute = function(){

};
Turn.prototype.exit = function(){

};
Turn.prototype.getLordID = function(){
    return this.lord.uid;
};
