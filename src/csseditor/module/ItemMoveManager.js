import BaseModule from "../../colorpicker/BaseModule";
import { GETTER, ACTION } from "../../util/Store";
import { CHANGE_EDITOR } from "../types/event";
import { ITEM_SET, ITEM_GET, ITEM_SORT } from "../types/ItemTypes";
import { ITEM_MOVE_TO, ITEM_MOVE_NEXT, ITEM_NEXT_INDEX, ITEM_MOVE_LAST, ITEM_MOVE_FIRST, ITEM_MOVE_IN, ITEM_MOVE_IN_LAYER, ITEM_MOVE_PREV, ITEM_PREV_INDEX, ITEM_ADD_INDEX } from "../types/ItemMoveTypes";

const INDEX_DIST = 100 ; 
const COPY_INDEX_DIST = 1; 

export const DEFAULT_FUNCTION = (item) => item; 

export default class ItemMoveManager extends BaseModule {

    afterDispatch() {
        this.$store.emit(CHANGE_EDITOR);
    }

    [ACTION(ITEM_MOVE_TO)] ($store, sourceId, newItemId) {

        var currentItem = $store.read(ITEM_GET, sourceId);

        var newItem = $store.read(ITEM_GET, newItemId);
        newItem.index = currentItem.index + COPY_INDEX_DIST;

        $store.run(ITEM_SET, newItem, true);
        $store.run(ITEM_SORT, newItemId);

    }    

    [ACTION(ITEM_MOVE_NEXT)] ($store, id) {
        var item = $store.read(ITEM_GET, id);
        item.index = $store.read(ITEM_NEXT_INDEX, id);

        $store.run(ITEM_SET, item, item.selected);
        $store.run(ITEM_SORT, id);
    }

    [ACTION(ITEM_MOVE_LAST)] ($store, id) {
        var item = $store.read(ITEM_GET, id);
        item.index = Number.MAX_SAFE_INTEGER;

        $store.run(ITEM_SET, item, item.selected);
        $store.run(ITEM_SORT, id);
    }   
    
    [ACTION(ITEM_MOVE_FIRST)] ($store, id) {
        var item = $store.read(ITEM_GET, id);
        item.index = -1 * COPY_INDEX_DIST;

        $store.run(ITEM_SET, item, item.selected);
        $store.run(ITEM_SORT, id);
    }       

    [ACTION(ITEM_MOVE_IN)] ($store, destId, sourceId) {
        var destItem = $store.read(ITEM_GET, destId);
        var sourceItem = $store.read(ITEM_GET, sourceId);
        sourceItem.parentId = destItem.parentId;
        sourceItem.index = destItem.index - COPY_INDEX_DIST;

        $store.run(ITEM_SET, sourceItem, true);
        $store.run(ITEM_SORT, sourceId);
    }    


    [ACTION(ITEM_MOVE_IN_LAYER)] ($store, destId, sourceId) {
        var destItem = $store.read(ITEM_GET, destId);  /* layer */ 
        var sourceItem = $store.read(ITEM_GET, sourceId);

        sourceItem.parentId = destItem.id; 
        sourceItem.index = Number.MAX_SAFE_INTEGER;

        $store.run(ITEM_SET, sourceItem, true);        
        $store.run(ITEM_SORT, sourceId);
    }        
     

    [ACTION(ITEM_MOVE_PREV)] ($store, id) {
        var item = $store.read(ITEM_GET, id);
        item.index = $store.read(ITEM_PREV_INDEX, id);

        $store.run(ITEM_SET, item, item.selected);
        $store.run(ITEM_SORT, id);
    }


    [GETTER(ITEM_ADD_INDEX)] ($store, id, dist = INDEX_DIST) {
        return $store.items[id].index + dist;
    }

    [GETTER(ITEM_NEXT_INDEX)] ($store, id) {
        return $store.read(ITEM_ADD_INDEX, id, INDEX_DIST + COPY_INDEX_DIST);
    }    

    [GETTER(ITEM_PREV_INDEX)] ($store, id) {
        return $store.read(ITEM_ADD_INDEX, id, -1 * (INDEX_DIST + COPY_INDEX_DIST));
    }       

}