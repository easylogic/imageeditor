import UIElement, { EVENT } from "../../../../colorpicker/UIElement";
import PageSampleList from "../../control/panel/PageSampleList";
import { LOAD, CLICK, SELF } from "../../../../util/Event";
import { CHANGE_PAGE, CHANGE_EDITOR } from "../../../types/event";

export default class PageListView extends UIElement {

    components () {
        return { PageSampleList }
    }

    template () { 
        return `
            <div class='pages'>         
                <div class="page-list" ref="$pageList">
                
                </div>
                <PageSampleList></PageSampleList>
            </div>
        `
    }

    makeItemNode (node, index) {
        var item = this.read('item/get', node.id);

        var page = this.read('selection/current/page')

        var selectedId = '' 

        if (page) selectedId = page.id; 

        if (item.itemType == 'page') {
            return this.makeItemNodePage(item, index, selectedId);
        }

    }

    makeItemNodePage (item, index, selectedId) {
        var selected = item.id == selectedId ? 'selected' : ''; 
        return `
            <div class='tree-item ${selected}' id="${item.id}" type='page'>
                <div class="item-preview"></div>
                <div class="item-title">
                    ${item.name || `Project ${index+1}`}
                </div>   
            </div>
            `
    }

    [LOAD('$pageList')] () {
        var str = this.read('item/map/page', (item, index) => {
            return this.makeItemNode(item, index); 
        }).join('');

        str += `<button type="button" class='add-page' title="Add a page"></button>`

        return str; 
    }

    refresh () { 
        this.load()
    }


    [EVENT(CHANGE_PAGE)] () {
        this.refresh()
        this.emit(CHANGE_EDITOR)
    }

    [CLICK('$pageList .add-page')] (e) {
        this.dispatch('item/add/page', true);
        this.refresh();
    }

    [CLICK('$pageList .tree-item') + SELF] (e) { 

        this.run('selection/one', e.$delegateTarget.attr('id')); 
        this.emit(CHANGE_EDITOR);      
        this.refresh();
    }

    [CLICK('$saveButton')] (e) {
        this.run('storage/save');
    }

    [CLICK('$viewSample')] (e) {
        this.emit('togglePageSampleView');
    }    

    [CLICK('$exportButton')] (e) {
        this.emit('showExport')
    }

} 