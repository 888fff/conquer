/**
 * Created by wwh on 2019/8/24.
 */
game.VFX_Layer = me.Container.extend({
    init : function (x,y,w,h) {
        this._super(me.Container, "init", [x, y, w, h]);
        this.name = "VFX";
        //this.anchorPoint.set(0, 0);
        this.isPersistent = true;
        this.floating = true;
    },
    //
    spawn_Bubbling_Text : function (pos,text) {
        var self = this;
        var bt = new game.VFX_Bubbling_Text(pos.x,pos.y,text);
        this.addChild(bt,1);
        tween = new me.Tween(bt.pos).
            to({y : bt.pos.y - 20 , value:1 }, 1200).
            easing(me.Tween.Easing.Bounce.Out).
            onComplete(function () {
                self.removeChild(bt);
            });
        tween.start();
    }

});

game.VFX_Bubbling_Text = me.Renderable.extend({
    init: function(x, y ,label) {
        this._super(me.Renderable, 'init', [x, y, 10, 10]);
        this.font = new me.Text(0, 0 ,{
            font: "Arial",
            size: 16,
            fillStyle: "#880000",
            textAlign: "center",
            textBaseline: "middle"
        });
        this.setLabel(label);
        //
        this.color = me.pool.pull("me.Color", 200, 0, 0, 255);
        this.tween = new me.Tween(this.color)
            .to({alpha : 0}, 1200)
            .start();
    },
    setLabel : function (text) {
        this.label = text;
        var ret = this.font.measureText(me.video.renderer, this.label);
        this.textWidth = ret.width;
        this.textHeight = ret.height;

    },
    draw : function (renderer) {
        // draw it baby !
        this.font.fillStyle = this.color;
        this.font.draw(renderer,
            this.label,
                this.pos.x + this.textWidth / 2,
                this.pos.y + this.textHeight / 2
        );
    }
});