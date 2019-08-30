game.World = me.Container.extend({
    init : function () {
        this._super(me.Container, "init", [64, 64,
            1, 1
        ]);
        this.HEX_SIZE = 64;
        this.COLS = 7;
        this.ROWS = 7;
        this.name = "WorldMap";
        this.outerRadius = this.HEX_SIZE * 0.5;
        this.innerRadius = this.outerRadius * 0.866025404;
        var sideLength = this.HEX_SIZE / 2;
        this.gridSize_x = 1.5 * sideLength;
        this.gridSize_y = 1.732 * sideLength;
        //
        this.created = false;
    },

    createWorldMap : function () {

        for (var i = 0; i < this.ROWS; i++) {
            for (var j = 0; j < this.COLS; j++) {
                var y = (i + j * 0.5 - Math.floor(j / 2)) * (this.innerRadius * 2);
                var x  = j * (this.outerRadius * 1.5);
                var t = me.pool.pull("tile", x, y);
                this.addChild(t);
                t.hexCoord = this.worldPosToHexCell(t.pos);
            }
        }
        //
        this.linkToNeighbour();

        this.updateChildBounds();

        this.created = true;
    },

    createWorldMapFromData : function (data) {
        if(!data) return;
        console.log("createWorldMapFromData");
        let self = this;
        let worldData = data.map;
        let worldCfg = data.cfg;

        this.HEX_SIZE = worldCfg.s;
        this.COLS = worldCfg.c;
        this.ROWS = worldCfg.r;

        worldData.forEach(function(tData){
            var pos = self.hexCellToWorldPos(tData.hc);
            var t = me.pool.pull("tile", pos.x, pos.y);
            t.hexCoord = tData.hc;
            t.neighbour = tData.nb;
            t.diceNum = tData.dn;
            t.diceValueMin = tData.dv;
            self.addChild(t);
        });

        this.updateChildBounds();

        this.created = true;
    },

    onActivateEvent : function () {

    },
    
    onDeactivateEvent : function () {

    },
    //返回Territory的HexCoord
    selectHexCell : function(world_x,world_y){
        world_x = (world_x + 0.5 * this.gridSize_x);   //将world_x 一小丢偏移
        var grid_x = Math.floor( world_x / this.gridSize_x);
        var grid_y = Math.floor( world_y / this.gridSize_y);
        var pts = [];
        if(grid_x % 2){
            //奇数
            pts.push({x:grid_x,y:(grid_y + 0.5)});
            pts.push({x:(grid_x + 1),y:grid_y});
            pts.push({x:(grid_x + 1),y:(grid_y + 1)});

        }else{
            //偶数
            pts.push({x:grid_x,y:grid_y});
            pts.push({x:grid_x,y:(grid_y + 1)});
            pts.push({x:(grid_x+1),y:(grid_y + 0.5)});
        }
        var index = -1; //最小索引
        var mindist= 9999; //一个非常大的值
        for(var i = 0;i<3;++i){
            var px = pts[i].x * this.gridSize_x;
            var py = pts[i].y * this.gridSize_y;
            var dist = (world_x - px)*(world_x - px) + (world_y - py)*(world_y - py);	         
            //更新最小距离值和索引
            if(dist < mindist)
            {
                mindist = dist;
                index = i;
            }
        }
        //return {x : pts[index].x , y : pts[index].y};
        return {x : pts[index].x - 1 , y : pts[index].y - pts[index].x * 0.5};
    },
    hexCellToWorldPos : function(hexCell){
        return {
            x : (hexCell.x) * this.gridSize_x,
            y : (hexCell.y + (hexCell.x) * 0.5) * this.gridSize_y
        };
    },
    worldPosToHexCell : function(wpos){
        var hexCell_x = Math.floor(wpos.x / this.gridSize_x);
        var hexCell_y = Math.floor(wpos.y / this.gridSize_y - hexCell_x * 0.5);
        return {
            x : hexCell_x,
            y : hexCell_y
        };
    },
    getTerritory : function (hexCoord) {
        var t = null;
        this.forEach(function (child) {
            if(child.hexCoord && child.hexCoord.x === hexCoord.x && child.hexCoord.y === hexCoord.y){
                t = child;
            }
        });
        return t;
    },
    //就是WorldMap整张的Y值在每一列的范围
    getRangeYAxis : function (x) {
        return {min : Math.floor(0 - x/2),max:Math.floor(this.ROWS - x/2)};
    },

    getNeighbour: function (hexCoord,neighbour) {
        //neighbour需要是数组
        var self = this;
        if(Array.isArray(neighbour)){
            neighbour.splice(0, neighbour.length);
            neighbour.push({x:hexCoord.x,y:hexCoord.y - 1});        //top
            neighbour.push({x:hexCoord.x,y:hexCoord.y + 1});        //down
            neighbour.push({x:hexCoord.x - 1,y:hexCoord.y });       //lt
            neighbour.push({x:hexCoord.x - 1 ,y:hexCoord.y + 1});   //ld
            neighbour.push({x:hexCoord.x + 1,y:hexCoord.y - 1});    //rt
            neighbour.push({x:hexCoord.x + 1,y:hexCoord.y });       //rd
            //将不合法的剔除
            for(var i = 0;i<neighbour.length;++i){
                var n = neighbour[i];
                //不合法，将其删除
                if(n.x<0 || n.x > self.COLS - 1){
                    neighbour.splice(i,1);
                    i--;
                    continue;
                }
                var range = self.getRangeYAxis(n.x);
                if(n.y < range.min || n.y > range.max){
                    neighbour.splice(i,1);
                    i--;
                }
            }
            return neighbour;
        }
        return null;
    },

    linkToNeighbour : function () {
        var self = this;
        this.forEach(function (child) {
            self.getNeighbour(child.hexCoord,child.neighbour);
        })
    },
});

