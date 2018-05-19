var last_select_land = null;
var last_select_lord = null;

var g_lands = new Array();
//
var MAX_LAND_NUM = 9;
//地形 0~5 一共6种地形
/*
    @ - 包含资源 （由高至低）
    # - 战斗影响
    平原：  @ 食物 棉花 水 木材         # 无               
    山地：  @ 矿石 硫磺 木材 食物       # 战斗方攻击降低 10%
    草地：  @ 棉花 食物 水              # 无
    冰原：  @ 水 矿石 木材              # 战斗方士气降低 10%，每回合额外消耗食物
    沙漠：  @ 矿石 硫磺                 # 战斗方士气降低 10%，每回合额外损失兵力
    沼泽：  @ 水 食物 木材 硫磺          # 行军速度降低50% 战斗方攻击降低 10%
 
*/
var LAND_TYPES = new Array('平原', '山地', '草地', '冰原', '沙漠', '沼泽');
var LAND_TYPE_COLORS = new Array('#FFFF99', '#999966', '#66cc00', '#ccffff', '#ffcc33', '#336699');
//地形中，资源的增长值
var LAND_RES_INCREASE = new Array(
    //以每回合增加10为峰值
    new Array(10, 0, 8, 0, 6, 4),
    new Array(0, 8, 0, 7, 6, 2),
    new Array(8, 0, 10, 0, 0, 6),
    new Array(0, 4, 0, 0, 4, 9),
    new Array(0, 3, 0, 2, 0, 0),
    new Array(3, 0, 0, 1, 2, 4),
);
//资源类型
var RES_TYPES = new Array('食物', '矿石', '棉花', '硫磺', '木材', '水');
//军备类型
/*
    马匹：增加军团行军速度，在平原，草地，沙漠提升攻击力，在沼泽和冰原减少攻击力
    火枪：增加军团攻击力，减少 马匹 在战争中的额外效果，
    战争机器：无视防守方的额外加成
    防具：减少进攻方的攻击力
    服装：增加士气，在冰原上攻击力提升
    武器：增加军团攻击力
*/
var ARMAMENT_TYPES = new Array('马匹', '火枪', '战争器械', '防具', '服装', '武器');
//军备研发依赖{资源}的类型,以最大消耗 5 为最大值   [对于火枪和战争机械额外判断]
var ARMAMENT_DEPEND = new Array(
    new Array(1, 0, 0, 0, 1, 2),
    new Array(0, 1, 1, 2, 3, 0),
    new Array(0, 3, 0, 0, 4, 0),
    new Array(0, 1, 1, 0, 2, 0),
    new Array(0, 0, 3, 0, 1, 0),
    new Array(0, 2, 0, 0, 3, 0)
);
//科技提升
/*
    指南针：对整个领土有效，加强军团行军的速度
    火药：  可以在军备中战争火枪
    造纸术：可以在军备中研发战争机械
    印刷术：可以使城镇幸福指数升高，征兵比例提升
*/
var TECH_TYPES = new Array('无科技', '指南针', '火药', '造纸术', '印刷术');
//王国 一共有4个,其中0位置是默认无王国的
var LORD_COLORS = new Array('#eeeeee', '#333333', '#cc3366', '#339966', '#0099cc');
/*基础比例常量*/
//征兵
var CONSCRIPTION_RATE = 0.1;
//最大王国数目
var LORD_MAX_NUM = 4;
//初始王国数目
var INIT_LORD_NUM = 2;
//初始玩家数目
var INIT_PLAYER_NUM = 2;
//城镇派出军团的限制，仅当所派出的军团到达目的地，或者消亡后，才可以继续远征
var LORD_MATCH_LIMIT = 3;
//每回合每个士兵消耗的补给
var COST_SUPPLY = 0.1;
//当补给不足时，每回合死亡的军队数目比列
var FAMINE_DEAD = 0.05; //意味着，在没有补给的情况下，可以坚持20回合，哈哈
var FAMINE_DEAD_CONST = 10; //饥饿情况下固定死亡常数
var FAMINE_LOSE_MORALE = 5; //饥荒下，士气值每回合损失
//王国人口数目上限
var POPULATION_LIMIT = 5000;
//触发损失幸福值的基数值
var LOST_HAPPINESS_BASE = 10;
//损失幸福指数比例范围
var LOST_HAPPINESS_RANGE = {
    min: 0.02,
    max: 0.1
};
//幸福值增长数目
var HAPPINESS_INC = 5;
//
var MORALE_2_HAPPINESS = 10;
//每个领土中的军团
var LEGION_NUM = 3;
/////////////
var random_range = function(min, max) {
    if (max == null) {
        max = min;
        min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
};
//玩家管理器
var g_PlayerManager = null;
/*-------------------
    游戏对象的定义
--------------------*/
/*
    @大陆板块
*/
function Land(id, name, neighbor, land_type, lord) {
    this.id = id; //地形ID
    this.name = name; //地形名称
    this.neighbor = neighbor; //相邻地形
    this.land_type = land_type; //地形类型
    this.lord = lord || new Lord(); //此地形的领主
    //
    this.debugInfo = function() {
        return '<h4 style="color:blue;margin:0px">' +
            '地形ID:' + this.id + '<br>' +
            '地形类型:' + LAND_TYPES[this.land_type] + '<br>' +
            '相邻地形:' + this.neighbor.toString() + '</h4>';
    }
}
/*
    @领土
    参数：所属大陆，所属玩家ID，人口，幸福值
*/
function Lord(landID, ownerID, p, h) {
    this.landID = landID || 0; //所属大陆地形
    this.ownerID = ownerID || 0; //所属玩家,玩家ID
    this.population = p || 0; //人口
    this.happiness = h || 0; //幸福度，影响人口的增长比率
    this.matching_legion = new Array(LEGION_NUM); //远征部队
    this.techs = 0; //默认选择一个开始科技
    this.state = 0; //此王国的状态  0 空闲，1 已经行动完毕，2被锁定
    this.res = new Array(RES_TYPES.length); //此王国初始有什么资源
    //---------------------一些隐藏的因素因子
    this.beConscripted = 0; //被征兵次数
    //初始化
    this.init = function(landID, p, h) {
        this.landID = landID;
        this.population = p;
        this.happiness = h;
        //
        for (var i = 0; i < LEGION_NUM; ++i) {
            this.matching_legion[i] = new Legion();
        }
        for (var i = 0; i < RES_TYPES.length; ++i) {
            this.res[i] = 0;
        }
    };
    this.setOwner = function(o) {
        this.ownerID = o;
    };
    this.hasOwner = function() {
        return this.ownerID != 0;
    };
    this.getLandID = function() {
        return this.landID;
    };
    this.getMaxConscriptNum = function() {
        return this.population * CONSCRIPTION_RATE;
    };
    this.doneAction = function() {
        this.state = 1;
    };
    this.locked = function() {
        this.state = 2;
    };
    //融合一个远征军
    this.absorbLegion = function(lg) {
        if (this.ownerID == lg.ownerID) {
            this.population = Math.min(this.population + lg.num, POPULATION_LIMIT);
            this.res[0] += lg.supply;
            this.happiness += lg.moraleToHappiness();
            ls.destory();
        } else {
            //开始攻击
        }
    };
    //损失一个远征军
    this.lostLegion = function(lg) {

    };
    //行动-派军远征
    this.expedition = function(n, s, dest) {
        _.each(this.matching_legion, function(lg, index) {
            if (lg.isActive == false && n <= this.getMaxConscriptNum() && s <= this.res[0] && dest <=
                g_lands.length) {
                lg.reset(n, 1, s, dest, this.ownerID);
                this.population -= n;
                this.res[0] -= s;
                this.beConscripted++;
                //如果小于，则触发损失幸福值
                if (random_range(0, LOST_HAPPINESS_BASE) < this.beConscripted) {
                    this.happiness -= (this.happiness * random_range(LOST_HAPPINESS_RANGE.min,
                        LOST_HAPPINESS_RANGE.max));
                    if (this.happiness < 0) {
                        this.happiness = 0;
                    }
                }
            }
        });
    };
    //行动-发展王国
    this.develop = function() {
        for (var i = 0; i < this.res.length; ++i) {
            var land = g_lands[this.landID];
            this.res[i] += LAND_RES_INCREASE[land.land_type][i];
        }
        this.happiness += HAPPINESS_INC;
    };
    //行动-研发军备
    this.research = function() {

    };
    //
    this.finishTurn = function() {
        this.state = 0;
    };
    ///
    this.debugInfo = function() {
        var res_html = "<br>";
        _.each(this.res, function(element, index) {
            res_html += RES_TYPES[index] + ':' + element + '<br>';
        });
        var lg_html = "";
        _.each(this.matching_legion, function(element, index) {
            lg_html += element.debugInfo();
        });
        return "<b>所属大陆:</b>" + g_lands[this.landID].debugInfo() +
            "<b>所属玩家:</b>" + this.ownerID + "<br>" +
            "<b>人口:</b>" + this.population + "<br>" +
            "<b>幸福度:</b>" + this.happiness + "<br>" +
            "<b>科技:</b>" + TECH_TYPES[this.techs] + "<br>" +
            "<b>军团:</b>" + lg_html +
            "<b>资源:</b>" + res_html;
    }

}

function Legion(n, m, s, ownerID) {
    this.num = n || 0; //部队数目
    //其中,数组中的每个元素,就是这个军团的军备数目
    this.armaments = new Array(ARMAMENT_TYPES.length);
    this.morale = m || 1; //士气 
    this.supply = s || 0; //补给
    this.isActive = false; //是否是激活状态
    this.destLand = -1; //目的大陆
    this.ownerID = ownerID || -1; //所属玩家
    //死亡数目
    this.dead_num = 0;
    //---
    this._finishTurn = function() {
        //当补给不足时，部队死亡部分
        if (this.supply < 0 && this.isActive) {
            this.dead_num = this.num * FAMINE_DEAD + FAMINE_DEAD_CONST;
            this.num -= this.dead_num;
            this.morale = Math.max(0, this.morale - FAMINE_LOSE_MORALE);
            if (this.num <= 0) {
                this.destory();
            }
        }
        this.supply -= this.COST_SUPPLY * this.num;
    };
    //
    this.destory = function() {
        this.isActive = false;
    };
    //
    this.reset = function(n, m, s, d, o) {
        this.isActive = true;
        this.num = n;
        this.morale = m;
        this.supply = s;
        this.dead_num = 0;
        this.destLand = d; //目的大陆
        this.ownerID = o;
    };
    //
    this.moraleToHappiness = function() {
        return (this.morale - 1) * MORALE_2_HAPPINESS;
    };
    //
    this.goMatching = function() {

    };
    //
    this.debugInfo = function() {
        return '<h5 style="color:orange;margin:2px">' + "<div style='border:1px dashed pink;width:200px'>" +
            '部队数目:' + this.num + '<br>' +
            '士气:' + this.morale + '<br>' +
            '补给:' + this.supply + '<br>' +
            '目的大陆ID:' + this.destLand + '<br>' +
            '所属玩家ID:' + this.ownerID + '</div></h5>';
    }
}

//
//  玩家
//
var PLAYER_LAND_SELECT = 0;
var PLAYER_LORD_SELECT = 1;

function Player(id, t) {
    this.playerID = id;
    this.isRealPlayer = true;
    this.playerType = t || 0; //0 是地图上的非中立玩家;1 是地图上的中立玩家
    this.state = PLAYER_LAND_SELECT;
    this.enableAI = function() {
        this.isRealPlayer = false;
    };
    this.getLords = function() {
        var ret = new Array();
        _.each(g_lands, function(element, index) {
            if (element.lord.ownerID == this.playerID) {
                ret.push(element.lord);
            }
        });
        return ret;
    };
    this.getLands = function() {
        var ret = new Array();
        _.each(g_lands, function(element, index) {
            if (element.lord.ownerID == this.playerID) {
                ret.push(element);
            }
        });
        return ret;
    };
    //
    this.finishTurn = function() {
        var lords = this.getLords();
        _.each(lords, function(element, index) {
            element.finishTurn();
        });
    };
    //
    this.think = function() {
        alert("AI thinked!");
    };
    //
    this.debugInfo = function() {
        return '<h4 style="color:green">' + "玩家ID:" + this.playerID + "<br>" + "真实玩家:" + this.isRealPlayer.toString() + '</h4>';
    }
}

function PlayerManager() {
    this.players = new Array(INIT_PLAYER_NUM + 1);
    this.curPlayer = 0;
    this.initManager = function() {
        this.players[0] = new Player(1); //默认是无玩家，或者是中立玩家
        for (var i = 1; i < this.players.length; i++) {
            this.players[i] = new Player(i);
        }
    };
    this.getPlayer = function(idx) {
        return this.players[idx];
    };
    this.nextPlayer = function() {
        this.curPlayer++;
        if (this.curPlayer < this.players.length) {
            return this.getPlayer[this.curPlayer];
        }
        return null;
    }
    this.finishTurn = function() {
        this.curPlayer = 0;
        _.each(this.players, function(element, index) {
            element.finishTurn();
        });
    }
};
//

///////////////////////////////////////
//
//      Game相关
//
////////////////////////////////////////
window.onload = function() {
    g_PlayerManager = new PlayerManager();
    g_PlayerManager.initManager();
    //
    random_world();
    refresh_world();
}

function random_world() {
    for (var i = 0; i < MAX_LAND_NUM; ++i) {
        var lt = parseInt(Math.random() * 100) % LAND_TYPES.length;
        var land_block = document.getElementById('land_' + i.toString());
        var dests = land_block.getAttribute('link').split(',');
        var links = new Array();
        _.each(dests, function(element, index) {
            links.push(parseInt(element));
        });
        var land = new Land(i, 'land_' + i, links, lt);
        land.lord.init(land.id, 1000, 100);
        g_lands.push(land);
    }

    for (var i = 1; i <= INIT_LORD_NUM; ++i) {
        var lt = parseInt(Math.random() * 100) % MAX_LAND_NUM;
        if (!g_lands[lt].lord.hasOwner()) {
            g_lands[lt].lord.setOwner(i);
        } else {
            i--;
        }
    }
}

function refresh_world() {
    for (var i = 0; i < MAX_LAND_NUM; ++i) {
        document.getElementById('land_' + i.toString()).firstElementChild.setAttribute('fill', LAND_TYPE_COLORS[
            g_lands[i].land_type]);
        var lord_slot = document.getElementById('lord_slot_' + i.toString());
        lord_slot.firstElementChild.setAttribute('fill', LORD_COLORS[g_lands[i].lord.ownerID]);
    }
}

function select_lord(item) {
    var land = get_last_select_land();
    var player = g_PlayerManager.getPlayer(1);
    if (player.state == PLAYER_LORD_SELECT) {
        var ownerID = g_lands[parseInt(item.id.split('_')[2])].lord.ownerID;
        last_select_lord = g_lands[parseInt(item.id.split('_')[2])].lord;
        land.lord.expedition(20, 50, last_select_lord.landID);
        g_PlayerManager.getPlayer(1).state == PLAYER_LAND_SELECT;
    }
}

function select_land(item) {
    if (g_PlayerManager.getPlayer(1).state == PLAYER_LAND_SELECT) {
        if (last_select_land) {
            last_select_land.firstElementChild.removeAttribute("filter");
        }
        item.firstElementChild.setAttribute("filter", "url(#fx_offset)");
        last_select_land = item;
        console.log(get_land(item.id));
    }
    //

}

function get_land(item_id) {
    return g_lands[parseInt(item_id.split('_')[1])];
}

function get_last_select_land() {
    if (!last_select_land) return null;
    var id = last_select_land.id;
    return (get_land(id));
}
/*
    测试用
*/
function test_finish_turn() {
    g_PlayerManager.getPlayer(1).finishTurn();
}

function test_get_player_info() {
    var info = document.getElementById('info');
    info.innerHTML = g_PlayerManager.getPlayer(1).debugInfo();
}

function test_get_lord_info() {
    var land = get_last_select_land();
    if (land && land.lord)
        info.innerHTML = land.lord.debugInfo();
}

function test_do_expedition() {
    var land = get_last_select_land();
    if (land && land.lord) {
        var player = g_PlayerManager.getPlayer(1);
        player.state = PLAYER_LORD_SELECT;
    }
}