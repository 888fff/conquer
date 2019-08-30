/**
 * Created by wwh on 2019/8/22.
 */
game.TSelect = me.Renderable.extend({
    /** Constructor */
    init: function() {
        this.worldLayer = me.game.world.getChildByName("WorldMap")[0];
        this.ui = me.game.world.getChildByName("HUD")[0];
        this.gameManager = me.game.world.getChildByName("GameMgr")[0];


        this._super(me.Renderable, 'init', [ 0, 0,
            this.worldLayer.HEX_SIZE,
            this.worldLayer.HEX_SIZE
        ]);

        this.anchorPoint.set(0, 0);

        this.floating = true;

        this.name = "selector";

        this.hexShape = new me.Polygon(0, 0,[
            {x : this.worldLayer.HEX_SIZE * 0.25 , y : 0},
            {x : this.worldLayer.HEX_SIZE * 0.75 , y : 0},
            {x : this.worldLayer.HEX_SIZE , y : this.worldLayer.innerRadius},
            {x : this.worldLayer.HEX_SIZE * 0.75 , y : this.worldLayer.innerRadius * 2},
            {x : this.worldLayer.HEX_SIZE * 0.25 , y : this.worldLayer.innerRadius * 2},
            {x : 0 , y : this.worldLayer.innerRadius}
        ]);
        this.shapeColor = ["#8fc31f","#fff100","#e60012"];
        this.state = 0  ;//正常选择 1为攻击选择

        this.currentHexCell = null;
        this.lastSelect = null;
        this.lastSelectHexShape = this.hexShape.clone();


        this.text = new me.Text(0,0,{ font:"Arial", size:10 , textAlign:"center" ,color:"#FFFFFF"});


        this.isKinematic = false;

        this.pointermoveEvent = null;
        this.pointerdownEvent = null;
        this.viewportEvent = null;
    },
    setupControl : function () {
        this.pointermoveEvent = me.event.subscribe("pointermove", this.pointerMove.bind(this));
        this.pointerdownEvent = me.event.subscribe("pointerdown", this.pointerDown.bind(this));
        this.viewportEvent = me.event.subscribe(me.event.VIEWPORT_ONCHANGE, this.viewportMove.bind(this));
    },

    releaseControl : function () {
        me.event.unsubscribe(this.pointermoveEvent);
        me.event.unsubscribe(this.pointerdownEvent);
        me.event.unsubscribe(this.viewportEvent);
    },

    normalState_On: function () {
        this.state = 0;
    },

    attackState_On: function () {
       if(this.lastSelect.diceNum > 1){
           this.state = 1;
       }
    },

    pointerDown : function (event) {

        if(this.worldLayer.childBounds.containsPoint(event.gameWorldX,event.gameWorldY)){
            var hexCoord = this.worldLayer.selectHexCell(
                    event.gameWorldX - this.worldLayer.pos.x,
                    event.gameWorldY - this.worldLayer.pos.y);
            /*
            var worldPos = this.worldLayer.hexCellToWorldPos(hexCoord);
            console.log("onSelect (" + hexCoord.x.toFixed(2) + ',' + hexCoord.y.toFixed(2) + ')');
            console.log("WorldPos (" + worldPos.x.toFixed(2) + ',' + worldPos.y.toFixed(2) + ')');
            hexCoord = this.worldLayer.worldPosToHexCell(worldPos);
            console.log("HexCellPos (" + hexCoord.x.toFixed(2) + ',' + hexCoord.y.toFixed(2) + ')');
            */
            var territory = this.worldLayer.getTerritory(hexCoord);
            if(territory){
                console.log("Territory ID:(" + territory.hexCoord.x + ',' + territory.hexCoord.y + ')');
            }

            if(this.state === 0){
                if(territory
                    && territory.overlord
                    && this.gameManager.isMainOverlord(territory.overlord.uid)
                    && this.gameManager.isMainOverlordTurn()){
                    this.lastSelect = territory;
                    this.lastSelectHexShape.pos.set(
                            this.lastSelect.pos.x + this.worldLayer.pos.x,
                            this.lastSelect.pos.y + this.worldLayer.pos.y);
                    this.ui.showTerritoryBtn(territory);
                }else{
                    this.lastSelect = null;
                    this.ui.hideTerritoryBtn();
                }
            }else if(this.state === 1){
                if( territory
                    && (!territory.overlord || !this.gameManager.isMainOverlord(territory.overlord.uid))){
                    this.lastSelect.overlord.doAction_Attack(this.lastSelect.hexCoord,territory.hexCoord);
                    this.lastSelect = null;
                }else{
                    this.lastSelect = null;
                }
                //无论成功与否，都将ATK状态切换到Normal状态
                this.normalState_On();
            }

        }else{
            this.currentHexCell = null;
            //this.ui.hideTerritoryBtn();

            //this.lastSelect = null;
            //this.normalState_On();

        }

    },
    pointerMove : function (event) {
        var hexCoord = this.worldLayer.selectHexCell(
                event.gameWorldX - this.worldLayer.pos.x,
                event.gameWorldY - this.worldLayer.pos.y);
        var t = this.worldLayer.getTerritory(hexCoord);
        if (t && t !== this.currentHexCell) {

            this.hexShape.pos.set(t.pos.x + this.worldLayer.pos.x, t.pos.y + this.worldLayer.pos.y);

            this.currentHexCell = t;
        }
    },
    viewportMove : function (pos) {
        this.currentHexCell = null;
    },
    update : function (dt) {
        return (typeof(this.currentHexCell) === "object");
    },
    draw: function(renderer) {
        //这个CurrentHexCell是游标
        if (this.currentHexCell) {
            renderer.save();
            renderer.setGlobalAlpha(1);
            renderer.setColor(this.shapeColor[0]);
            renderer.setLineWidth(4);
            renderer.strokePolygon(this.hexShape);
            renderer.restore();
        }
        if(this.lastSelect){

            if(this.state == 0){
                renderer.save();
                renderer.setGlobalAlpha(1);
                renderer.setColor(this.shapeColor[1]);
                renderer.setLineWidth(4);
                renderer.strokePolygon(this.lastSelectHexShape);
                renderer.restore();
            }


            if(this.state == 1){
                renderer.save();
                renderer.setGlobalAlpha(1);
                renderer.setColor(this.shapeColor[2]);
                renderer.setLineWidth(4);
                renderer.strokePolygon(this.lastSelectHexShape);
                renderer.restore();
            }

        }
        //

    }
});