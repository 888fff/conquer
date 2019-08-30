game.PlayScreen = me.Stage.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
        // reset the score
        game.data.score = 0;
        let self = this;

        this.HUD = new game.HUD.Container(70,me.game.viewport.getHeight() - 240,200,200);
        me.game.world.addChild(this.HUD,10);

        this.worldMap = new game.World();
        setTimeout(function () {
            if(!self.worldMap.created){
                self.worldMap.createWorldMapFromData(game.dataCache.worldData);
                game.dataCache.gameManager.updateAllOverlordsTerritory();
            }
        },500);
        me.game.world.addChild(this.worldMap, 2);

        this.VFX = new game.VFX_Layer(this.worldMap.pos.x,this.worldMap.pos.y,this.worldMap.width,this.worldMap.height);
        me.game.world.addChild(this.VFX,9);

        // this.gameManager = new game.GameManager();
        this.gameManager = game.dataCache.gameManager;
        me.game.world.addChild(this.gameManager);

        this.selector = new game.TSelect();
        me.game.world.addChild(this.selector, 4);

        //
        game.dataCache.init(this.worldMap,this.HUD);
        game.dataCache.gameManager.start();



        me.game.world.addChild(new me.ColorLayer("background", "#222222"), 0);

        me.input.registerPointerEvent("pointermove", me.game.viewport, function (event) {
            me.event.publish("pointermove", [event]);
        }, false);
        me.input.registerPointerEvent("pointerdown", me.game.viewport, function (event) {
            me.event.publish("pointerdown", [event]);
        }, false);

        this.selector.setupControl();

    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {

        this.selector.releaseControl();
        me.input.releasePointerEvent("pointermove", me.game.viewport);
        me.input.releasePointerEvent("pointerdown", me.game.viewport);
        // remove the HUD from the game world
        this.gameManager.end();
        //
        me.game.world.removeChild(this.HUD);
        me.game.world.removeChild(this.worldMap);
        me.game.world.removeChild(this.VFX);

        me.game.world.removeChild(this.gameManager);
        me.game.world.removeChild(this.selector);
    },

    acquireData : function () {

    }
});
