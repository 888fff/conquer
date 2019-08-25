/**
 * Created by wwh on 2019/8/23.
 */
game.ReadyScreen = me.Stage.extend({

    init: function() {
        this._super(me.Stage, 'init', []);
    },
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {

        this.bunker = new game.ReadyRenderable();
        me.game.world.addChild( this.bunker );

    },

    keyHandler: function (action, keyCode, edge) {
        if(keyCode === me.input.KEY.ENTER && !this.finished) {
        }
    },

    onDestroyEvent: function() {

    }
});

game.ReadyRenderable = me.Renderable.extend({
    init: function() {
        this._super(me.Renderable, "init",[0, 0,
            me.game.viewport.getWidth(),
            me.game.viewport.getHeight()]);
        this.exiting = false;
        this.counter = 0;
        this.floating = true;
        this.anchorPoint.set(0,0);
        this.bg = new me.ColorLayer("background", "#222222");
        this.bg_size = new me.Rect(0,0,960,640);
        this.text = new me.Text(0,0,{font:"kenpixel", size:20,textAlign:"center",fillStyle:"#FFFFFF"});
        this.label = "waiting.";
    },
    draw: function(renderer) {
        this.bg.draw(renderer,this.bg_size);
        this.text.draw (renderer,this.label,this.width / 2,this.height / 2);
    },

    update: function( dt ) {
        //
        this.counter += dt;
        var gap = Math.floor(this.counter) % 1800;
        if(gap < 600){
            this.label = "等待其他玩家.";
        }
        else if(gap < 1200){
            this.label = "等待其他玩家..";
        }else if(gap < 1800){
            this.label = "等待其他玩家...";
        }

        if(game.launch_game && !this.exiting) {
            this.exiting = true;
            me.state.change(me.state.PLAY);
        }
        return true;
    }
});
