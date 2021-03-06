import UIElement, { EVENT } from '../../../util/UIElement';
import { 
    CHANGE_EDITOR, 
    CHANGE_IMAGE, 
    CHANGE_IMAGE_ANGLE, 
    CHANGE_IMAGE_COLOR, 
    CHANGE_IMAGE_RADIAL_POSITION, 
    CHANGE_IMAGE_RADIAL_TYPE, 
    CHANGE_IMAGE_LINEAR_ANGLE, 
    CHANGE_COLOR_STEP, 
    CHANGE_SELECTION 
} from '../../types/event';
import { CLICK, DRAGSTART, DRAGEND, DRAGOVER, DROP, SELF, LOAD } from '../../../util/Event';
import { SELECTION_CURRENT_LAYER_ID, SELECTION_CHECK, SELECTION_ONE } from '../../types/SelectionTypes';
import { IMAGE_TO_STRING } from '../../types/ImageTypes';
import { EMPTY_STRING } from '../../../util/css/types';
import { ITEM_MOVE_IN, ITEM_MOVE_LAST } from '../../types/ItemMoveTypes';
import { ITEM_MAP_IMAGE_CHILDREN } from '../../types/ItemSearchTypes';

export default class ImageListView extends UIElement {

    templateClass () {  
        return 'image-list'
    }

    makeItemNodeImage (item) {
        var selected = this.read(SELECTION_CHECK, item.id) ? 'selected' : EMPTY_STRING
        return `
            <div class='tree-item ${selected}' data-id="${item.id}" draggable="true" title="${item.type}" >
                <div class="item-view-container">
                    <div class="item-view"  style='${this.read(IMAGE_TO_STRING, item)}'></div>
                </div>
            </div>
            ` 
    }       

    [LOAD()] () {
        var id = this.read(SELECTION_CURRENT_LAYER_ID);

        if (!id) {
            return EMPTY_STRING;
        }

        return this.read(ITEM_MAP_IMAGE_CHILDREN, id, (item) => {
            return this.makeItemNodeImage(item)
        })
    }

    refresh () {
        this.load()
    }

    // individual effect
    [EVENT(
        CHANGE_IMAGE,
        CHANGE_IMAGE_ANGLE,
        CHANGE_IMAGE_COLOR,
        CHANGE_IMAGE_LINEAR_ANGLE,
        CHANGE_IMAGE_RADIAL_POSITION,
        CHANGE_IMAGE_RADIAL_TYPE,
        CHANGE_COLOR_STEP,
        CHANGE_EDITOR,
        CHANGE_SELECTION
    )] (newValue) { this.refresh() }

    [CLICK('$el .tree-item') + SELF] (e) { 
        var id = e.$delegateTarget.attr('data-id')

        if (id) {
            this.dispatch(SELECTION_ONE, id);
            this.refresh();
        }

    }
 

    [DRAGSTART('$el .tree-item')] (e) {
        this.draggedImage = e.$delegateTarget;
        this.draggedImage.css('opacity', 0.5);
        // e.preventDefault();
    }

    [DRAGEND('$el .tree-item')] (e) {

        if (this.draggedImage) {
            this.draggedImage.css('opacity', 1);        
        }
    }    

    [DRAGOVER('$el .tree-item')] (e) {
        e.preventDefault();        
    }        

    [DROP('$el .tree-item') + SELF] (e) {
        e.preventDefault();        

        var destId = e.$delegateTarget.attr('data-id')
        var sourceId = this.draggedImage.attr('data-id')

        this.draggedImage = null; 
        this.dispatch(ITEM_MOVE_IN, destId, sourceId)
        this.refresh()
    }       
    
    [DROP()] (e) {
        e.preventDefault();        

        if (this.draggedImage) {
            var sourceId = this.draggedImage.attr('data-id')

            this.draggedImage = null; 
            this.dispatch(ITEM_MOVE_LAST, sourceId)
            this.refresh()
        }

    }           


}