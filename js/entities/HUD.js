/**
 * a HUD container and child items
 */

game.HUD = game.HUD || {};


game.HUD.Container = me.Container.extend({

    init: function(x, y, width, height) {
        // call the constructor
        this._super(me.Container, 'init', [x, y, width, height]);

        var self = this;

        this.anchorPoint.set(0, 0);
        // persistent across level change
        this.isPersistent = true;

        // make sure we use screen coordinates
        this.floating = true;

        // give a name
        this.name = "HUD";

        this.up_A_btn = new game.HUD.Button(
            0,30,"升级♞\n(花费1AP)", function () {
                if(me.state.current().gameManager.isMainOverlordTurn()){
                    var selector = me.state.current().selector;
                    me.state.current().gameManager.getMainOverlord().doAction_UpgradeDiscNum(selector.lastSelect.hexCoord);
                }
            }
        );
        this.up_B_btn = new game.HUD.Button(
            120,30,"升级➹\n(花费2AP)",function () {
                if(me.state.current().gameManager.isMainOverlordTurn()){
                    var selector = me.state.current().selector;
                    me.state.current().gameManager.getMainOverlord().doAction_UpgradeDiscValue(selector.lastSelect.hexCoord);
                }
            }
        );
        this.attack_btn = new game.HUD.Button(
            240,30,"攻击\n(花费1AP)",function () {
                me.state.current().selector.attackState_On();
                self.hideTerritoryBtn();
            }
        );
        this.pass_btn = new game.HUD.Button(
            360,30,"结束回合\n(花费0AP)",function () {
                if(me.state.current().gameManager.isMainOverlordTurn()){
                    me.state.current().gameManager.getMainOverlord().doAction_Pass();
                }
            }
        );

        this.func_btn = new game.HUD.Button(
            0,90,"FUNC A\n(测试)", function () {
                var worldLayer = me.game.world.getChildByName("WorldMap")[0];
                var content = worldLayer.serialize();
                var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
                downFile(blob, "_map.json");//saveAs(blob,filename)
            }
        );

        this.lose_btn = new game.HUD.Button(
            120,90,"FUNC LOSE\n(测试)", function () {
                me.state.current().gameManager.getMainOverlord().doAction_LoseGame();
            }
        );

        this.addChild(this.up_A_btn);
        this.addChild(this.up_B_btn);
        this.addChild(this.attack_btn);
        this.addChild(this.pass_btn);
        this.addChild(this.func_btn);
        this.addChild(this.lose_btn);



        this.updateChildBounds();

        this.infoBar = new game.HUD.Info_Label(this.centerX,0);
        this.addChild(this.infoBar);

        this.hideTerritoryBtn();
    },

    setInfoText : function(text){
        this.infoBar.setText(text);
    },

    showTerritoryBtn : function () {
        if(me.state.current().gameManager.isMainOverlordTurn()){
            this.up_A_btn.show();
            this.up_B_btn.show();
            this.attack_btn.show();
            this.pass_btn.show();
        }
    },

    hideTerritoryBtn :function(){
        this.up_A_btn.hide();
        this.up_B_btn.hide();
        this.attack_btn.hide();
        this.pass_btn.hide();
    }
});

game.HUD.Button = me.GUI_Object.extend({

    init:function (x, y,label,func)
    {
        var settings = {};
        settings.image = me.loader.getImage("button");
//        settings.framewidth = 80;
//        settings.frameheight = 50;
        // super constructor
        this._super(me.GUI_Object, "init", [x, y, settings]);
        this.anchorPoint.set(0, 0);
        this.pos.z = 4;
        this.floating = false;
        //
        this.font = new me.Text(0, 0 ,{
            font: "kenpixel",
            size: 13,
            fillStyle: "black",
            textAlign: "center",
            textBaseline: "middle"
        });

        this.label = label;

        this.click_cb = func;

        this.isHide = false;

        this.setText(this.label);

    },

    setText : function (text) {
        this.label = text;
        var ret = this.font.measureText(me.video.renderer, this.label);
        this.textWidth = ret.width;
        this.textHeight = ret.height;

    },

    hide : function(){
        this.isHide = true;
    },
    show : function () {
        this.isHide = false;
    },

    // output something in the console
    // when the object is clicked
    onClick:function (event)
    {
        if(!this.isHide){
            console.log("---clicked!---");
            // don't propagate the event
            if(this.click_cb)
                this.click_cb();
        }
        return false;
    },

    draw: function(renderer) {
        if(this.isHide) return this.isHide;
        this._super(me.GUI_Object, "draw", [ renderer ]);
        this.font.draw(renderer,
            this.label,
                this.pos.x + this.width / 2,
                this.pos.y + this.textHeight/2
        );
    }
});

game.HUD.Info_Label = me.Renderable.extend({
    /**
     * constructor
     */
    init: function(x, y) {

        this._super(me.Renderable, 'init', [x, y, 10, 10]);

        this.font = new me.Text(0, 0 ,{
            font: "kenpixel",
            size: 16,
            fillStyle: "#EEEEEE",
            textAlign: "center",
            textBaseline: "middle"
        });

        //this.floating = false;

        this.label = "";

        // local copy of the global score
        this.score = -1;

        this.setText("这里是INFO_BAR");
    },

    /**
     * update function
     */
    update : function (dt) {
        var mgr = me.state.current().gameManager;
        var lord = mgr.getCurTurnOverlord();
        if(lord != null){
            if(mgr.isMainOverlordTurn()){
                this.setText('玩家' + lord.nickname +'的回合，剩余AP['+ lord.ap +']');
            }
            else{
                this.setText('等待玩家' + lord.nickname +'的回合...');
            }
        }
    },

    setText : function (text) {
        this.label = text;
        var ret = this.font.measureText(me.video.renderer, this.label);
        this.textWidth = ret.width;
        this.textHeight = ret.height;

    },
    /**
     * draw the score
     */
    draw : function (renderer) {
        // draw it baby !
        this.font.draw(renderer,
            this.label,
                this.pos.x + this.textWidth / 2,
                this.pos.y + this.textHeight / 2
        );
    },



});
