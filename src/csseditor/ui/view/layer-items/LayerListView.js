import UIElement, { EVENT } from "../../../../colorpicker/UIElement";
import { LOAD, CLICK, SELF, DRAGSTART, DRAGEND, DRAGOVER, DROP } from "../../../../util/Event";
import { CHANGE_EDITOR, CHANGE_SELECTION } from "../../../types/event";

export default class LayerListView extends UIElement {

    template () { 
        return `
            <div class='layers show-mini-view'>
                <div class="layer-list" ref="$layerList"></div>
            </div>
        `
    }

    makeItemNode (node, index) {
        var item = this.read('item/get', node.id);

        if (item.itemType == 'layer') {
            return this.makeItemNodeLayer(item, index);
        }

    }

   
    makeItemNodeImage (item) {
        var selected = this.read('selection/check', item.id) ? 'selected' : ''; 
        return `
            <div class='tree-item image ${selected}' id="${item.id}" draggable="true" >
                <div class="item-title"> 
                    &lt;${item.type}&gt;
                    <button type="button" class='delete-item' item-id='${item.id}' title="Remove">&times;</button>
                </div>                
                <div class='item-tools'>
                    <button type="button" class='copy-image-item' item-id='${item.id}' title="Copy">+</button>
                </div>            
            </div>
            ` 
    }         
 
    
    makeItemNodeLayer (item, index = 0) {
        var selected = this.read('selection/check', item.id) ? 'selected' : ''; 
        return `
            <div class='tree-item ${selected}' id="${item.id}" item-type='layer' draggable="true">
                <div class="item-title"> 
                    ${index+1}. ${item.name || `Layer `} 
                    <button type="button" class='delete-item' item-id='${item.id}' title="Remove">&times;</button>
                </div>
                <div class='item-tools'>
                    <button type="button" class='copy-item' item-id='${item.id}' title="Copy">+</button>
                </div>                            
            </div>
            <div class="gradient-list-group" >
                <!-- <div class='gradient-collapse-button' item-id="${item.id}"></div> -->
                <div class="tree-item-children">
                    ${this.read('item/map/image/children', item.id, (item) => {
                        return this.makeItemNodeImage(item)
                    }).join('')}
                </div>
            </div>       
            `
    }    

    [LOAD('$layerList')] () {
        var page = this.read('selection/current/page')

        if (!page) {
            return '';
        }

        return this.read('item/map/children', page.id, (item, index) => {
            return this.makeItemNode(item, index); 
        }).reverse();
    }

    refreshSelection() {

    }

    refresh () {
        this.load()
    }

    refreshSelection (id) {
        var $selected = this.$el.$(".selected")

        if ($selected) {
            $selected.removeClass('selected')
        }

        this.$el.$(`[id="${id}"]`).addClass('selected');
    }

    // refreshLayer () {
    //     this.read('selection/current/layer', (items) => {

    //         if (!items.length) {
    //             items = [items]
    //         }
            
    //         items.forEach(item => {
    //             this.$el.$(`[id="${item.id}"] .item-view`).cssText(this.read('layer/toString', item, false))
    //         })
    //     })
    // }    

    // refreshImage() {
    //     this.read('selection/current/image', (item) => {
    //         this.$el.$(`[id="${item.id}"] .item-view`).cssText(this.read('image/toString', item))
    //     })
    // }

    // // indivisual effect 
    // [EVENT(
    //     CHANGE_LAYER,
    //     CHANGE_LAYER_BACKGROUND_COLOR,
    //     CHANGE_LAYER_CLIPPATH,
    //     CHANGE_LAYER_CLIPPATH_POLYGON,
    //     CHANGE_LAYER_CLIPPATH_POLYGON_POSITION,
    //     CHANGE_LAYER_FILTER,
    //     CHANGE_LAYER_POSITION,
    //     CHANGE_LAYER_RADIUS,
    //     CHANGE_LAYER_SIZE,
    //     CHANGE_LAYER_ROTATE,
    //     CHANGE_LAYER_OPACITY,
    //     CHANGE_LAYER_TRANSFORM,
    //     CHANGE_LAYER_TRANSFORM_3D,
            
    //     CHANGE_COLOR_STEP,
    //     CHANGE_IMAGE,
    //     CHANGE_IMAGE_ANGLE,
    //     CHANGE_IMAGE_COLOR,
    //     CHANGE_IMAGE_LINEAR_ANGLE,
    //     CHANGE_IMAGE_RADIAL_POSITION,
    //     CHANGE_IMAGE_RADIAL_TYPE
    // )]() {
    //     this.refreshLayer()
    // }



    // all effect 
    [EVENT(
        CHANGE_EDITOR,
        CHANGE_SELECTION
    )] () { this.refresh(); }

    [CLICK('$layerList .tree-item') + SELF] (e) { 
        var id = e.$delegateTarget.attr('id');
        this.dispatch('selection/one', id);        
        this.run('item/focus', id);
        this.refreshSelection(id);
    }

    [DRAGSTART('$layerList .tree-item')] (e) {
        this.draggedLayer = e.$delegateTarget;
        this.draggedLayer.css('opacity', 0.5);
        // e.preventDefault();
    }

    [DRAGEND('$layerList .tree-item')] (e) {

        if (this.draggedLayer) {
            this.draggedLayer.css('opacity', 1);        
        }
    }    

    [DRAGOVER('$layerList .tree-item')] (e) {
        e.preventDefault();        
    }        

    [DROP('$layerList .tree-item') + SELF] (e) {
        e.preventDefault();        

        var destId = e.$delegateTarget.attr('id')
        var sourceId = this.draggedLayer.attr('id')

        var sourceItem = this.read('item/get', sourceId);
        var destItem = this.read('item/get', destId);

        this.draggedLayer = null;         
        if (destItem.itemType == 'layer' && sourceItem.itemType == 'image') {
            if (e.ctrlKey) {
                this.dispatch('item/copy/in/layer', destId, sourceId)
            } else {
                this.dispatch('item/move/in/layer', destId, sourceId)
            }

            this.dispatch('history/push', `Change gradient position `);         
            this.refresh()            
        } else if (destItem.itemType == sourceItem.itemType ) {
            if (e.ctrlKey) {
                this.dispatch('item/copy/in', destId, sourceId)
            } else {
                this.dispatch('item/move/in', destId, sourceId)
            }
            this.dispatch('history/push', `Change item position `);         
            this.refresh()            
        }

    }       
    
    [DROP('$layerList')] (e) {
        e.preventDefault();        

        if (this.draggedLayer) {
            var sourceId = this.draggedLayer.attr('id')

            this.draggedLayer = null; 
            this.dispatch('item/move/last', sourceId)
            this.dispatch('history/push', `Change layer position `);                     
            this.refresh()
        }

    }           

    [CLICK('$layerList .copy-image-item')] (e) {
        this.dispatch('item/addCopy', e.$delegateTarget.attr('item-id'))
        this.dispatch('history/push', `Add a gradient`);                 
        this.refresh()
    }

    [CLICK('$layerList .copy-item')] (e) {
        this.dispatch('item/addCopy', e.$delegateTarget.attr('item-id'))
        this.dispatch('history/push', `Copy a layer`);                         
        this.refresh()
    }

    [CLICK('$layerList .delete-item')] (e) {
        this.dispatch('item/remove', e.$delegateTarget.attr('item-id'))
        this.dispatch('history/push', `Remove item`);                         
        this.refresh()
    } 

    [CLICK('$viewSample')] (e) {
        this.emit('toggleLayerSampleView');
    }

    [CLICK('$layerList .gradient-collapse-button') + SELF] (e) {
        e.$delegateTarget.parent().toggleClass('collapsed')
        var item = this.read('item/get', e.$delegateTarget.attr('item-id'))

        item.gradientCollapsed = e.$delegateTarget.parent().hasClass('collapsed');
        this.run('item/set', item);
    }
}