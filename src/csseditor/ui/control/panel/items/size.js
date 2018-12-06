import BasePropertyItem from "./BasePropertyItem";
import { parseParamNumber } from "../../../../../util/filter/functions";
import { EVENT_CHANGE_LAYER_POSITION, EVENT_CHANGE_LAYER_SIZE, CHANGE_LAYER_SIZE, CHANGE_LAYER_POSITION, EVENT_CHANGE_EDITOR } from "../../../../types/event";

export default class Size extends BasePropertyItem {
    template () {
        return `
            <div class='property-item size show'>
                <div class='title' ref="$title">Dimesion</div>
                <div class='items'>
                    <div>
                        <label>fixed</label>
                        <div>
                            <button type="button" ref="$rect">like width</button>
                        </div>
                    </div>                   
                    <div>
                        <label>Width</label>
                        <div>
                            <input type='number' ref="$width"> <span>px</span>
                        </div>
                        <label>Height</label>
                        <div>
                            <input type='number' ref="$height"> <span>px</span>
                        </div>
                    </div>   
                    <div>
                        <label>X</label>
                        <div>
                            <input type='number' ref="$x"> <span>px</span>
                        </div>
                        <label>Y</label>
                        <div>
                            <input type='number' ref="$y"> <span>px</span>
                        </div>
                    </div>                                 
                                 
                </div>
            </div>
        `
    }

    [EVENT_CHANGE_LAYER_POSITION] () {
        this.refresh()
    }

    [EVENT_CHANGE_LAYER_SIZE] () {
        this.refresh();
    }

    [EVENT_CHANGE_EDITOR] () {
        this.refresh()
    }

    refresh() {
        var item = this.read('/selection/current')
        if (!item) return; 
        if (!item.length) return; 

        item = item[0];
        if (this.read('/selection/is/image')) return; 
        if (item.width) {
            this.refs.$width.val(parseParamNumber(item.width))
        }

        if (item.height) {
            this.refs.$height.val(parseParamNumber(item.height))
        }

        if (item.x) {
            this.refs.$x.val(parseParamNumber(item.x))
        }

        if (item.y) {
            this.refs.$y.val(parseParamNumber(item.y))
        }        
        
    }

    'click $rect' (e) {

        this.read('/selection/current/layer/id', (id) => {
            
            var width = this.refs.$width.int() + 'px'
            var height = width;

            this.commit(CHANGE_LAYER_SIZE, {id, width, height});
        })

    }

    'input $width' () {
        this.read('/selection/current/layer/id', (id) => {
            
            var width = this.refs.$width.int() + 'px'

            this.commit(CHANGE_LAYER_SIZE, {id, width});
        })        
    }

    'input $height' () {
        this.read('/selection/current/layer/id', (id) => {
            
            var height = this.refs.$height.int() + 'px'

            this.commit(CHANGE_LAYER_SIZE, {id, height});
        })        
    }    


    'input $x' () {
        this.read('/selection/current/layer/id', (id) => {
            var x = this.refs.$x.int() + 'px'
            this.commit(CHANGE_LAYER_POSITION, {id, x});
        })
    }

    'input $y' () {
        this.read('/selection/current/layer', (item) => {
            var y = this.refs.$y.int() + 'px'
            this.commit(CHANGE_LAYER_POSITION, {id: item.id, y});
        })
    }        
}