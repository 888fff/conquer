
/* Game namespace */
var game = {

    // an object where to store game information
    data : {
        // score
        score : 0
    },

    launch_game : false,


    // Run on page load.
    "onload" : function () {
        // Initialize the video.
        if (!me.video.init(960, 640, {
            wrapper : "screen",
            scale : "auto",
            scaleMethod : "fill-max",//"flex-width",
            doubleBuffering : true,
            renderer:me.video.CANVAS
        })) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        // Initialize the audio.
        me.audio.init("mp3,ogg");
        me.loader.preload(game.resources, this.loaded.bind(this));
    },

    // Run on game resources loaded.
    "loaded" : function () {
        /*
        game.ui_texture = new me.video.renderer.Texture([
            me.loader.getJSON("UI_Assets-0"),
            me.loader.getJSON("UI_Assets-1"),
            me.loader.getJSON("UI_Assets-2")
        ]);*/

        me.state.set(me.state.MENU,     new game.IntroScreen());
        me.state.set(me.state.READY,    new game.ReadyScreen());
        me.state.set(me.state.PLAY,     new game.PlayScreen());
        //me.state.set(me.state.SCORE, new game.ScoreScreen());


        me.pool.register("tile", game.Territory);
        // 设置转场效果
        //me.state.transition('fade', '#000', 1000);
        //开始！！
        me.state.change(me.state.PLAY);
    }
};
