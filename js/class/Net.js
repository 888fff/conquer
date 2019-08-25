/**
 * Created by wwh on 2019/8/22.
 */
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
    var randomNum = function(minNum,maxNum){
        switch(arguments.length){
            case 1:
                return parseInt(Math.random()*minNum+1,10);
            case 2:
                return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
            default:
                return 0;
        }
    };
    console.log('emit msg[' + JSON.stringify(msg) + ']');
    //这里简单模拟一下
    var self = this;
    var world = me.state.current().worldMap;
    const AP_Cost_1 = 1;
    const AP_Cost_2 = 2;
    const AP_Cost_3 = 3;


    switch (t){
        case "rATK":
        {
            //此处模拟一下进攻结果的生成
            var randomSum = function (dn,dv) {
                var sum = 0;
                for(var i = dn;i>0;i--){
                    sum += randomNum(dv,6);
                }
                return sum;
            };
            var from_t = world.getTerritory(msg.f_tid);
            var to_t = world.getTerritory(msg.t_tid);
            var f_akt = randomSum(from_t.diceNum,from_t.diceValueMin);
            var t_akt = randomSum(to_t.diceNum,to_t.diceValueMin);
            var ret = (f_akt > t_akt);
            //计算出剩余战斗力
            var remain = 1;
            var occupy = from_t.diceNum - 1;
            if(!ret){   //如果进攻失败
                occupy = to_t.diceNum - 1;
            }
            var t_uid = (to_t.overlord == null)? "" : to_t.overlord.uid;
            var t_dv = Math.max(1,to_t.diceValueMin - 1);

            if(from_t.overlord.ap >= AP_Cost_1){
                var ap = from_t.overlord.ap - AP_Cost_1;
                setTimeout(function(){
                    self.onGame_AttackTerritory({
                        f_uid  : msg.uid,
                        t_uid : t_uid,
                        ret  : ret,     //进攻的结果是否成功
                        ap : ap,
                        f_atk: f_akt,   //进攻方的战斗值
                        t_atk: t_akt,   //防守方的战斗值
                        f_tid:{x:msg.f_tid.x , y:msg.f_tid.y , dn:remain ,dv:from_t.diceValueMin},   //进攻方区域的hexCoord和dn,dv等
                        t_tid:{x:msg.t_tid.x , y:msg.t_tid.y , dn:occupy ,dv:t_dv}    //防守方区域的hexCoord和dn,dv等
                    });
                },0);
            }


        }
        break;
        case 'rP':
        {
            var uid = msg.uid;
            setTimeout(function(){
                self.onGame_Pass({
                    uid  : uid,
                    rd   : 0        //现在是多少回合
                });
            },0);
        }
        break;
        case 'rL':{
            var uid = msg.uid;
            setTimeout(function(){
                self.onGame_LoseGame({
                    uid  : uid,
                    rd   : 0        //失败在多少回合
                });
            },0);
        }
        break;
        case 'rUDN':
        {
            var uid = msg.uid;
            var tid = msg.tid;
            var t = world.getTerritory(msg.tid);
            if(t.overlord.uid === uid && t.overlord.ap >= AP_Cost_1){
                var ret = false;
                if(t.diceNum + 1 <= 8){
                    ret = true;
                }
                var dn = Math.min(t.diceNum + 1, 8);
                var ap = t.overlord.ap - AP_Cost_1;

                setTimeout(function () {
                    self.onGame_UpgradeDiscNum({
                        ret : ret,
                        uid : uid,
                        tid : tid,
                        dn : dn,
                        ap : ap
                    });
                },0);
            }
        }
        break;
        case 'rUDV':
        {
            var uid = msg.uid;
            var tid = msg.tid;
            var t = world.getTerritory(msg.tid);
            if(t.overlord.uid === uid && t.overlord.ap >= AP_Cost_2){
                var ret = false;
                if(t.diceValueMin + 1 <= 6){
                    ret = true;
                }
                var dv = Math.min(t.diceValueMin + 1, 6);
                var ap = t.overlord.ap - AP_Cost_2;
                setTimeout(function () {
                    self.onGame_UpgradeDiscValue({
                        ret : ret,
                        uid : uid,
                        tid : tid,
                        dv : dv,
                        ap : ap
                    });
                },0);
            }
        }
        break;

    }

};
//发送请求升级骰子个数
NetLayer.prototype.Req_UpgradeDiscNum = function(uid,tid){
    this.Request('rUDN',{uid:uid,tid:tid});
};
//获得升级骰子个数的返回消息
NetLayer.prototype.onGame_UpgradeDiscNum = function(data){
    //如果有数据，且数据的ret是真
    game.dataCache.parseUpgradeDiscNum(data);
};
//发送请求升级骰子最小值
NetLayer.prototype.Req_UpgradeDiscValue = function(uid,tid){
    this.Request('rUDV',{uid:uid,tid:tid});

};
//获得升级骰子最小值的返回消息
NetLayer.prototype.onGame_UpgradeDiscValue = function(data){
    game.dataCache.parseUpgradeDiscValue(data);
};
//发送请求攻击消息
NetLayer.prototype.Req_AttackTerritory = function(uid,from_tid,to_tid){
    this.Request('rATK',{uid:uid,f_tid:from_tid,t_tid:to_tid});
};
//获得攻击的返回消息
NetLayer.prototype.onGame_AttackTerritory = function(data){
    game.dataCache.parseAttackResult(data);
};
//发送回合结束的消息
NetLayer.prototype.Req_Pass = function(uid){
    this.Request('rP',{uid:uid});
};
//某人失败退出游戏了
NetLayer.prototype.Req_Lose = function(uid){
    this.Request('rL',{uid:uid});
};

//获得过牌的返回消息(回合结束)
NetLayer.prototype.onGame_Pass = function(data){
    game.dataCache.parsePassData(data);
};
NetLayer.prototype.onGame_LoseGame = function(data){
    game.dataCache.parseLoseGameData(data);
};
//获得回合开始的消息
NetLayer.prototype.onGame_StartTurn = function(data){
    game.dataCache.parseStartTurn(data);
};
//获得游戏开始的消息
NetLayer.prototype.onGame_GameStart = function(data){
    //TODO GameStart!!
    game.dataCache.parseWorldMap(data.wm);//world map
    game.dataCache.parsePlayerInfo(data.player);//player
    game.dataCache.parseOverlords(data.overlords);//overlords
    game.dataCache.parseTurnsOrder(data.turns);//overlords
    game.dataCache.parseMode(data.mode);
    //
    game.dataCache.launchGame();
};
//
NetLayer.prototype.onMsg_EnterLobby = function(data){
    console.log("onMsg_EnterLobby");
};
NetLayer.prototype.onMsg_EnterRoomSuccess = function(data){
    console.log("onMsg_EnterRoomSuccess");

};
NetLayer.prototype.onMsg_LeaveRoomSuccess = function(data){
    console.log("onMsg_LeaveRoomSuccess");

};
NetLayer.prototype.onMsg_CreateRoomSuccess = function(data){
    console.log("onMsg_CreateRoomSuccess");

};
NetLayer.prototype.onMsg_ReEnterRoom = function(data){
    console.log("onMsg_ReEnterRoom");

};
NetLayer.prototype.onMsg_SetReadySuccess = function(data){
    console.log("onMsg_SetReadySuccess");
    game.launch_game = true;
    setTimeout(function () {
        game.net.onGame_GameStart(data);
    },100);

};
NetLayer.prototype.onMsg_QuitGameSuccess = function(data){
    console.log("onMsg_QuitGameSuccess");

};
NetLayer.prototype.onMsg_PlayerMsg = function(data){
    console.log("onMsg_PlayerMsg");

};
NetLayer.prototype.onMsg_GetPlayerInfo = function(data){
    console.log("onMsg_GetPlayerInfo");

};
//
game.net = new NetLayer();
//
var Net = (function () {
    var instance;
    return function () {
        if (!instance) {
            instance = new NetLayer();
        }
        return instance;
    }
})();