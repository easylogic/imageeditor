import BaseModule from "../../colorpicker/BaseModule";
import { isFunction, isUndefined, clone } from "../../util/functions/func";
import { GETTER, ACTION } from "../../util/Store";
import { EMPTY_STRING } from "../../util/css/types";
import { CLONE, TOOL_COLOR_SOURCE, TOOL_GET, TOOL_SET_COLOR_SOURCE, TOOL_CHANGE_COLOR, TOOL_SET, TOOL_TOGGLE, TOOL_SAVE_DATA, TOOL_RESTORE_DATA } from "../types/ToolTypes";
import { CHANGE_TOOL, CHANGE_EDITOR } from "../types/event";

export default class ToolManager extends BaseModule {

    initialize () {        
        super.initialize()

        this.$store.tool = {
            color : EMPTY_STRING,
            colorSource : EMPTY_STRING,
            'show.grid': false,
            'snap.grid': false,
            'guide.only': false,            
            'guide.angle': true,
            'guide.position': true
        }

        this.$store.toolStack = []
    } 

    [GETTER(CLONE)] ($store, object) {
        return JSON.parse(JSON.stringify(object))
    }

    [GETTER(TOOL_COLOR_SOURCE)] ($store) {
        return $store.tool.colorSource
    }

    [GETTER(TOOL_GET)] ($store, key, defaultValue) {
        return isUndefined($store.tool[key]) ? defaultValue : $store.tool[key]
    }    

    [ACTION(TOOL_SET_COLOR_SOURCE)] ($store, colorSource) {
        $store.tool.colorSource = colorSource;
    }

    [ACTION(TOOL_CHANGE_COLOR)] ($store, color) {
        $store.tool.color = color 

        $store.emit('changeColor')
    }


    [ACTION(TOOL_SET)] ($store, key, value) {
        $store.tool[key] = value

        $store.emit(CHANGE_TOOL)
    }


    [ACTION(TOOL_TOGGLE)] ($store, key, isForce) {
        if (isFunction(isForce)) {
            $store.tool[key] = !$store.tool[key]
        } else {
            $store.tool[key] = isForce
        }

        $store.emit(CHANGE_TOOL)
    }

    [ACTION(TOOL_SAVE_DATA)] ($store) {
        $store.toolStack.push({
            items: clone($store.items),
            itemKeys: clone($store.itemKeys)
        })
    }

    [ACTION(TOOL_RESTORE_DATA)] ($store) {
        var obj = $store.toolStack.pop();

        $store.items = obj.items; 
        $store.itemKeys = obj.itemKeys;

        $store.emit(CHANGE_EDITOR);
    }

}