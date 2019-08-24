game.Territory = me.Entity.extend({
    init : function (x,y) {
        this._super(me.Entity, "init", [x,y, { 
            image : "tiles", 
            width: 64,
            height: 64
        }]);
        //
        this.frameNum = 8;
        //
        this.text = new me.Text(0,0,{font:"Arial", size:16,textAlign:"center"});
        this.fontHeight = this.text.measureText(me.video.renderer, "DUMMY").height;
        //
        this.hexCoord = {};
        this.caption = "HEX区域";      //地形名称
        this.neighbour = [];        //周围的地形块
        this.overlord = null;       //这里保存着overlord的实例
        this.diceNum = 1;           //骰子个数
        this.diceValueMin = 1;      //骰子最小值
        this.diceValueMax = 6;      //骰子最大值
        this.gainCoin = 1;          //区域获得金币数
        //
        //this.setFlagImage();
        this.renderable.addAnimation("default", [ this.frameNum ], 1);
        this.renderable.setCurrentAnimation("default");

    },

    setData : function (data) {
        this.diceNum = data.dn || this.diceNum;           //骰子个数
        this.diceValueMin = data.dv || this.diceValueMin;      //骰子最小值
        this.diceValueMax = 6;              //骰子最大值
        this.gainCoin = data.gc || this.gainCoin; //区域获得金币数
    },

    Serialize : function(){
        return {

        };
    },

    setFlagImage : function(idx){
        this.renderable.addAnimation("normal", [idx], 1);
        this.renderable.setCurrentAnimation("normal");
    },

    draw : function(renderer){
        this._super(me.Entity, "draw", [renderer]);
        /*
        this.text.draw (
            renderer,
            "( " + this.hexCoord.x.toFixed(1) +','+this.hexCoord.y.toFixed(1) + " )",
            0,0 - this.fontHeight
        );
        */
        this.text.draw (
            renderer,
                "♞" + this.diceNum+'\n'+"➹"+this.diceValueMin,
            0,0 - this.fontHeight
        );
    },

    //----
    setOverlord : function(lord){
        this.overlord = lord;
        if(this.overlord){
            this.setFlagImage(this.overlord.colorIndex);
        }
    },
    upgradeDiceNum : function(dn){
        if(dn) this.diceNum = dn;
        else this.diceNum += 1;
    },
    upgradeDiceValue : function(dv){
        if(dv) this.diceValueMin = dv;
        else this.diceValueMin += 1;  
    },
    isNeighbour : function(hexCoord){
        return !!this.neighbour.find(function(n){
            return (n.x == hexCoord.x && n.y == hexCoord.y);
        });
    }


});