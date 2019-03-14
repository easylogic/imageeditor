import { editor } from "../editor";
import { Segment } from "./Segment";
import { isNotUndefined } from "../../util/functions/func";
import { ArtBoard } from "../ArtBoard";

var MAX_DIST = 1; 

export class Guide {

    constructor () { }

    initialize (rect, cachedItems, direction) {
        this.direction = direction;
        this.rect = rect
        this.cachedItems = cachedItems;

        var project = editor.selection.currentProject;
        this.checkLayers = []
        if (project) {
            if (this.cachedItems[0] instanceof ArtBoard) {
                this.checkLayers = project.artboards.filter(item => !this.cachedItems[item.id])
            } else {
                this.checkLayers = project.allItems.filter(item => !this.cachedItems[item.id])
            }

        }
    }

    compareX (A, B, dist = MAX_DIST) {
        var AX = [A.screenX.value, A.centerX.value, A.screenX2.value]
        var BX = [B.screenX.value, B.centerX.value, B.screenX2.value]

        var results = []
        AX.forEach( (ax, source) => {
            BX.forEach( (bx, target) => {
                var isSnap = Math.abs(ax - bx) <= dist;

                if (isSnap) {
                    // ax -> bx <= dist 
                    results.push({ A, B, source, target, ax, bx})
                }
            })
        })

        return results;
    }

    compareY (A, B, dist = MAX_DIST) {
        var AY = [A.screenY.value, A.centerY.value, A.screenY2.value]
        var BY = [B.screenY.value, B.centerY.value, B.screenY2.value]

        var results = []
        AY.forEach( (ay, source) => {
            BY.forEach( (by, target) => {
                var isSnap = Math.abs(ay - by) <= dist;

                if (isSnap) {
                    // aY -> bY <= dist 
                    results.push({ A, B, source, target, ay, by})
                }
            })
        })

        return results;
    }    

    compare (A, B, dist = MAX_DIST) {

        var xCheckList = this.compareX(A, B, dist);
        var yCheckList = this.compareY(A, B, dist);

        return [...xCheckList, ...yCheckList];
    }

    getLayers (dist = MAX_DIST) {

        var layers = this.checkLayers;
        var points = []

        layers.forEach(B => {
            points.push(...this.compare(this.rect, B, dist));
        })

        return points

    } 

    caculate (dist = MAX_DIST) {

        var list = this.getLayers(dist);
        
        if (Segment.isMove(this.direction)) {
            list.forEach(it => this.moveSnap(it))
        } else {
            list.forEach(it => this.sizeSnap(it));
        }

        return list; 
    }

    sizeSnap(it) {
        if (isNotUndefined(it.ax)) {
            var minX, maxX, width; 
            switch(it.source) {
            case 2: 
                minX = this.rect.screenX.value; 
                maxX = it.bx;
                width = maxX - minX;   
                this.rect.width.set(width);                            
                break;
            // case 1: 
            //     minX = this.rect.screenX.value; 
            //     maxX = minX + (it.bx - minX) * 2; 
            //     width = maxX - minX;   
            //     this.rect.width.set(width);                            
            //     break;                
            case 0: 
                minX = it.bx; 
                maxX = this.rect.screenX2.value;
                width = maxX - minX;   
                this.rect.x.set(minX);
                this.rect.width.set(width);                            
                break; 
            }


        } else {
            var minY, maxY, height; 

            switch(it.source) {
            case 2: 
                minY = this.rect.screenY.value; 
                maxY = it.by;
                height = maxY - minY;   
                this.rect.y.set(minY);
                this.rect.height.set(height);                
                break;

            // case 1: 
            //     minY = this.rect.screenY.value;                 
            //     height = (it.by - minY) * 2;
            //     this.rect.y.set(it.by - (it.by - minY));                         
            //     this.rect.height.set(height);                
            //     break;                
            case 0: 
                minY = it.by; 
                maxY = this.rect.screenY2.value;
                height = maxY - minY;   
                this.rect.y.set(minY);
                this.rect.height.set(height);                
                break; 
            }

        }
    }

    moveSnap(it) {
        if (isNotUndefined(it.ax)) {
            var distX = Math.round(this.rect.width.value / 2 * it.source);
            var minX = it.bx - distX;             
            this.rect.x.set(minX);            
        } else if (isNotUndefined(it.ay)) {
            var distY = Math.round(this.rect.height.value / 2 * it.source);
            var minY = it.by - distY;             
            this.rect.y.set(minY);              
        }

    }
}