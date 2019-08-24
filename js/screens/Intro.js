game.IntroScreen = me.Stage.extend({

    init: function() {
        this._super(me.Stage, 'init', []);
        this.finished = false;
    },
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {

        this.bunker = new game.BunkerRenderable();
        me.game.world.addChild( this.bunker );

        this.subscription = me.event.subscribe( me.event.KEYDOWN, this.keyHandler.bind(this));
        //me.audio.play("bunkerlogo");
        this.finished = false;
    },

    keyHandler: function (action, keyCode, edge) {
        if(keyCode === me.input.KEY.ENTER && !this.finished) {
            //me.state.change(me.state.PLAY);
            //me.audio.fade("radmarslogo", 1.0, 0.0, 1000);
            this.finished = true;
        }
    },

    onDestroyEvent: function() {
        //me.audio.stopTrack();
        me.event.unsubscribe(this.subscription);
    }
});

game.BunkerRenderable = me.Renderable.extend({
    init: function() {
        this._super(me.Renderable, "init",[0, 0,
                me.game.viewport.getWidth(),
                me.game.viewport.getHeight()]);
        this.exiting = false;
        this.counter = 0;
        this.floating = true;
        this.anchorPoint.set(0,0);

        var cx = this.width / 2;
        var cy = this.height / 2;
        this.bg = new me.ColorLayer("background", "#222222");
        this.bg_size = new me.Rect(0,0,960,640);
        /*
        this.bg.pos.x = cx;
        this.bg.pos.y = cy;
        */
        this.bunker_logo = new me.Sprite( cx - 200,cy - 125,{
            image : "bunker_logo",
            framewidth : 400,
            frameheight : 225
        });
        this.bunker_logo.addAnimation("idle",[{name:0,delay:1500}]);
        this.bunker_logo.addAnimation("flash",[1,2]);
        this.bunker_logo.setCurrentAnimation("idle", "flash");
    },
    draw: function(renderer) {
        this.bg.draw(renderer,this.bg_size);
        this.bunker_logo.draw(renderer);
    },

    update: function( dt ) {
        this.bunker_logo.update(dt);
        //
        if ( this.counter < 350 ) {
            this.counter++;
        }
        else if(me.state.current().finished && !this.exiting) {
            this.exiting = true;
            me.state.change(me.state.READY);
        }
        return true;
    }
});