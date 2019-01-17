import BasePropertyItem from "./BasePropertyItem";
import { 
    CHANGE_LAYER_TRANSFORM, 
    CHANGE_EDITOR, 
    CHANGE_LAYER, 
    CHANGE_SELECTION, 
    CHANGE_LAYER_OPACITY
} from "../../../../types/event";
import { EVENT } from "../../../../../colorpicker/UIElement";
import { INPUT } from "../../../../../util/Event";
import { SELECTION_CURRENT_LAYER_ID, SELECTION_CURRENT_LAYER } from "../../../../types/SelectionTypes";

export default class Opacity extends BasePropertyItem {
    template () {
        return `
            <div class='property-item opacity show'>
                <div class='items'>            
                    <div>
                        <label>Opacity</label>
                        <div>
                            <input type='range' ref="$opacityRange" min="0" max="1" step="0.01">
                            <input type='number' ref="$opacity" min="0" max="1" step="0.01">
                        </div>
                    </div>                                                                           
                </div>
            </div>
        `
    }

    [EVENT(
        CHANGE_LAYER,
        CHANGE_LAYER_OPACITY,
        CHANGE_EDITOR,
        CHANGE_SELECTION
    )] () { this.refresh() }    

    refresh() {
        this.read(SELECTION_CURRENT_LAYER, (item) => {
            this.refs.$opacityRange.val(item.opacity || "1")
            this.refs.$opacity.val(item.opacity || "1")
        })
        
    }

    updateTransform (type) {
        this.read(SELECTION_CURRENT_LAYER_ID, (id) => {

            if (type == 'opacity') {
                this.commit(CHANGE_LAYER_TRANSFORM, {id, opacity: this.refs.$opacity.val()})
                this.refs.$opacityRange.val(this.refs.$opacity.val())
            } else if (type == 'range') {
                this.commit(CHANGE_LAYER_TRANSFORM, {id, opacity: this.refs.$opacityRange.val()})
                this.refs.$opacity.val(this.refs.$opacityRange.val())
            }
            
        })
    }

    [INPUT('$opacityRange')] () { this.updateTransform('range'); }
    [INPUT('$opacity')] () { this.updateTransform('opacity'); }
    
}