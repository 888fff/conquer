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
        this.ui =   me.game.world.getChildByName("HUD")[0];


        this.turnQueen = [];
        this.curTurn = null;
        this.overlords = [];    //这里是装载overlords的实例容器
        //
        this.name = "GameMgr";
        this.round = 0;

    },

    getMainOverlord : function () {
        return this.getOverlord(game.dataCache.player_uid);
    },

    isMainOverlord : function(lord){
        if(lord){
            return lord.uid === game.dataCache.player_uid;
        }
        return false;
    },

    isMainOverlordTurn : function(){

        return this.isOverlordTurn(game.dataCache.player_uid);
    },

    isOverlordTurn : function (uid) {
        if(this.curTurn){
            return this.curTurn.getLordID() === uid;
        }
        return false;
    },

    getCurTurnOverlord : function(){
        if(this.curTurn) return this.curTurn.lord;
        return null;
    },



    getOverlord : function (uid) {
        return this.overlords.find(function (lord) {
            return lord.uid === uid;
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

            }else if(territory.overlord.uid === uid){
                overlord.updateTerritory(territoryData,false);
            }else if(territory.overlord.uid !== uid){
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
    /*回合相关*/
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
            //此处开始判断玩家是否还有territory
            for(var i =0;i<this.overlords.length;++i){
                if(!this.overlords[i].hasAnyTerritory()){
                    this.overlords[i].doAction_LoseGame();
                }
            }
        }
    },
    //
    overlordEndTurn : function(uid,round){
        if(this.curTurn.getLordID() === uid){
            this.endTurn();
            this.round = round;
            this.ui.hideTerritoryBtn();
        }
    },

    overlordStartTurn : function (uid) {
        while (this.curTurn.getLordID() !== uid){
            this.endTurn();
            this.startTurn();
        }
    },

    overlordLoseGame : function(uid,round){
        //首先强制结束这个玩家的回合
        this.overlordEndTurn(uid,round);
        //删除这个玩家的turn
        for(var i = 0;i<this.turnQueen.length;++i){
            if(this.turnQueen[i].getLordID() === uid){
                this.turnQueen.splice(i,1);
            }
        }
        //删除这个玩家，并告知原因
        for(i = 0;i<this.overlords.length;++i) {
            if(this.overlords[i].uid === uid){
                this.overlords[i]._LoseGame();
                this.overlords.splice(i,1);
            }
        }
        //如果是当前玩家失败
        if(uid === game.dataCache.player_uid){
            game.lose_game = true;
            me.state.change(me.state.GAMEOVER);
        }
        //游戏成功
        if( this.overlords.length === 1 &&
            this.overlords[0].uid === game.dataCache.player_uid){
            game.lose_game = false;
            me.state.change(me.state.GAMEOVER);
        }

    },
});

function Turn(lord){
   this.lord = lord;
}
Turn.prototype.enter = function(){
    this.lord.refreshAP();
    console.log("It is " + this.lord.uid + " Turn with[" + this.lord.ap + ']AP');
    //
    if(this.ai) this.ai.think();
};
Turn.prototype.execute = function(){

};
Turn.prototype.exit = function(){
    console.log(this.lord.uid + " end the Turn");
};
Turn.prototype.getLordID = function(){
    return this.lord.uid;
};
//植入AI
Turn.prototype.implantAI = function () {
    this.ai = new AI_Simulate(this.lord);
};

function AI_Simulate(lord) {
    this.lord = lord;
    this.thinkStepLimit = 10;

}
AI_Simulate.prototype.think = function(){
    var self = this;
    var world = me.state.current().worldMap;
    //
    if(this.lord.getAP() === 0){
        this.lord.doAction_Pass();
    }
    else if(this.lord.getAP() >= 1) {
        var done = false;
        if (this.lord.getAP() < 2 || (this.lord.getAP() >= 2 && me.Math.random(1, 100) > 75)) {
            //只能进攻或者升级DiceNum
            if (me.Math.random(1, 100) % 2) {
                if(!this.wantAttack(world)){
                    if(!this.wantUpgradeDN(world)){
                        this.lord.doAction_Pass(world);
                    }
                }
            } else {
                if(!this.wantUpgradeDN(world)){
                    if(!this.wantAttack(world)){
                        this.lord.doAction_Pass(world);
                    }
                }
            }
        } else {
            if(!this.wantUpgradeDV(world)){
                if(!this.wantAttack(world)){
                    if(!this.wantUpgradeDN(world)){
                        this.lord.doAction_Pass(world);
                    }
                }
            }
        }
        //

        //
        setTimeout(function () {
            self.think();
        },200);
    }

};
AI_Simulate.prototype.wantAttack = function (world) {
    var self = this;
    try {   //throw new Error('exist')
        var territories = this.shuffle(this.lord.ownTerritories);
        territories.forEach(function (tid) {
            var territory = world.getTerritory(tid);
            if(territory.diceNum > 1){
                var neighbours =  self.shuffle(territory.neighbour);
                neighbours.forEach(function (n_tid) {
                    var n_Territory = world.getTerritory(n_tid);
                    if(n_Territory.overlord === null || n_Territory.overlord.uid !== self.lord.uid){
                        self.lord.doAction_Attack(tid, n_tid);
                        throw new Error('done');
                    }
                });
            }
        });
    } catch (e) {
        if(e.message === 'done'){
            return true;
        }
    }
    return false;
};
AI_Simulate.prototype.wantUpgradeDN = function (world) {
    var self = this;
    try {
        var territories =this.shuffle(this.lord.ownTerritories);
        territories.forEach(function (tid) {
            var territory = world.getTerritory(tid);
            if(territory.diceNum < 8){
                self.lord.doAction_UpgradeDiscNum(tid);
                throw new Error('done');
            }
        });
    } catch (e) {
        if(e.message === 'done'){
            return true;
        }
    }
    return false;
};
AI_Simulate.prototype.wantUpgradeDV = function (world) {
    var self = this;
    try {
        var territories =this.shuffle(this.lord.ownTerritories);
        territories.forEach(function (tid) {
            var territory = world.getTerritory(tid);
            if(territory.diceValueMin < 6){
                self.lord.doAction_UpgradeDiscValue(tid);
                throw new Error('done');
            }
        });
    } catch (e) {
        if(e.message === 'done'){
            return true;
        }
    }
    return false;
};
AI_Simulate.prototype.shuffle = function(arr) {
    var getRandom = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    let newArr = arr.slice(0);

    for (let i = 0; i < newArr.length; i++) {
        let j = getRandom(0, i);
        let temp = newArr[i];
        newArr[i] = newArr[j];
        newArr[j] = temp
    }

    return newArr
};

