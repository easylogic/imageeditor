import BasePropertyItem from "./BasePropertyItem";
import { 
    CHANGE_EDITOR, 
    CHANGE_LAYER, 
    CHANGE_SELECTION, 
    CHANGE_LAYER_BORDER
} from "../../../../types/event";
import { pxUnit, string2unit } from "../../../../../util/css/types";
import { EVENT } from "../../../../../colorpicker/UIElement";
import { defaultValue } from "../../../../../util/functions/func";
import { CLICK, INPUT } from "../../../../../util/Event";
import { SELECTION_CURRENT_LAYER_ID, SELECTION_CURRENT_LAYER } from "../../../../types/SelectionTypes";

export default class BorderFixed extends BasePropertyItem {
    template () {
        return `
            <div class='property-item fixed-border'>
                <div class='items'>            
                    <div>
                        <label > <button type="button" ref="$borderLabel">*</button> Border</label>
                        <div>
                            <input type='range' ref="$borderWidthRange" min="0" max="360">
                            <input type='number' class='middle' ref="$borderWidth" min="0" max="360"> <span>px</span>
                        </div>
                    </div>                                                                           
                </div>
            </div>
        `
    }

    [EVENT(
        CHANGE_LAYER,
        CHANGE_LAYER_BORDER,
        CHANGE_EDITOR,
        CHANGE_SELECTION
    )] () { this.refresh() }    

    refresh() {

        var isShow = this.isShow();

        this.$el.toggleClass('show', isShow);

        if (isShow) {

            this.read(SELECTION_CURRENT_LAYER, (item) => {
                var borderWidth = defaultValue(string2unit(item.borderWidth), pxUnit(0) )
                this.refs.$borderWidthRange.val(borderWidth.value)
                this.refs.$borderWidth.val(borderWidth.value)
            })
        }
    }

    isShow () {
        var layer = this.read(SELECTION_CURRENT_LAYER);

        if (!layer) return false; 

        return true;
    }

    updateTransform (type) {
        this.read(SELECTION_CURRENT_LAYER_ID, (id) => {

            if (type == 'border') {
                this.commit(CHANGE_LAYER_BORDER, {
                    id, 
                    fixedBorderWidth: true, 
                    borderWidth: pxUnit( this.refs.$borderWidth.val() )
                })
                this.refs.$borderWidthRange.val(this.refs.$borderWidth.val())
            } else if (type == 'range') {
                this.commit(CHANGE_LAYER_BORDER, {
                    id, 
                    fixedBorderWidth: true, 
                    borderWidth: pxUnit( this.refs.$borderWidthRange.val() )
                })
                this.refs.$borderWidth.val(this.refs.$borderWidthRange.val())
            }
            
        })
    }

    [INPUT('$borderWidthRange')] () { this.updateTransform('range'); }
    [INPUT('$borderWidth')] () { this.updateTransform('border'); }
    [CLICK('$borderLabel')] () {
        this.emit('toggleBorderWidth');
    }
}