import BaseModule from "../../util/BaseModule";
import { UNIT_PX, UNIT_PERCENT, UNIT_COLOR, stringUnit, WHITE_STRING } from "../../util/css/types";
import { FILTER_DEFAULT_OBJECT, FILTER_DEFAULT_OBJECT_KEYS, ITEM_GET } from "../types/ItemTypes";
import { GETTER } from "../../util/Store";
import { FILTER_GET, FILTER_LIST, FILTER_TO_CSS } from "../types/FilterTypes";
const filterInfo = {
    'filterBlur': { func: 'blur', title: 'Blur', type: 'range', min: 0, max: 100, step: 1, unit: UNIT_PX, defaultValue: 0 },
    'filterGrayscale' : { func: 'grayscale', title: 'Grayscale', type: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: 0 },
    'filterHueRotate' : { func: 'hue-rotate', title: 'Hue', type: 'range', min: 0, max: 360, step: 1, unit: 'deg', defaultValue: 0 },
    'filterInvert' : { func: 'invert', title: 'Invert', type: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: 0 },    
    'filterBrightness': { func: 'brightness', title: 'Brightness', type: 'range', min: 0, max: 200, step: 1, unit: UNIT_PERCENT, defaultValue: 100 },
    'filterContrast': { func: 'contrast', title: 'Contrast', type: 'range', min: 0, max: 200, step: 1, unit: UNIT_PERCENT, defaultValue: 100 },
    'filterDropshadow': { func: 'drop-shadow', type: 'multi', title: 'Drop Shadow'},
    'filterDropshadowOffsetX': { title: 'Offset X', type: 'range', min: -100, max: 100, step: 1, defaultValue: 0, unit: UNIT_PX },
    'filterDropshadowOffsetY': { title: 'Offset Y', type: 'range', min: -100, max: 100, step: 1, defaultValue: 0, unit: UNIT_PX },
    'filterDropshadowBlurRadius': { title: 'Blur Radius', type: 'range', min: 0, max: 100, step: 1, defaultValue: 0, unit: UNIT_PX },
    'filterDropshadowColor': { title: 'Color', type: 'color', defaultValue: 'black', unit: UNIT_COLOR },
    'filterOpacity' : { func: 'opacity', title: 'Opacity', type: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: 100 },
    'filterSaturate' : { func: 'saturate', title: 'Saturate', type: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: 100 },
    'filterSepia' : { func: 'sepia', title: 'Sepia', type: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: 0 },
}

const DROP_SHADOW_LIST = [
    'filterDropshadowOffsetX',
    'filterDropshadowOffsetY',
    'filterDropshadowBlurRadius',
    'filterDropshadowColor',
]

export default class FilterManager extends BaseModule {

    [GETTER(FILTER_GET)] ($store, id) {
        return filterInfo[id];
    }    

    [GETTER(FILTER_LIST)] ($store, layerId) {
        var layer = this.get(layerId);
        var realFilters = {}
        
        FILTER_DEFAULT_OBJECT_KEYS.filter(key => layer[key]).forEach(key => {
            realFilters[key] = layer[key]
        })

        realFilters = {...FILTER_DEFAULT_OBJECT, ...realFilters}

        var filterList = FILTER_DEFAULT_OBJECT_KEYS.map(key => {
            return {key, ...realFilters[key]}
        })

        filterList.sort( (a, b) => {
            return a.index > b.index ? 1 : -1; 
        })

        return filterList.map(it => it.key); 
    }


    [GETTER(FILTER_TO_CSS)] ($store, layer) {       
        var realFilters = {}
        
        FILTER_DEFAULT_OBJECT_KEYS.filter(key => layer[key]).forEach(key => {
            realFilters[key] = layer[key]
        })

        realFilters = {...FILTER_DEFAULT_OBJECT, ...realFilters}

        var filterList = FILTER_DEFAULT_OBJECT_KEYS.map(key => {
            return {key, ...realFilters[key]}
        })

        filterList.sort( (a, b) => {
            return a.index > b.index ? 1 : -1; 
        })

        var filterString = filterList.filter(it => it.checked).map(it => {
            var viewObject = filterInfo[it.key];
            if (it.key == 'filterDropshadow') {

                var values = DROP_SHADOW_LIST.map(key => {
                    return stringUnit(layer[key] || FILTER_DEFAULT_OBJECT[key])
                }).join(WHITE_STRING)

                return `${viewObject.func}(${values})`
            } else {
                var values = stringUnit(it)
                return `${viewObject.func}(${values})`
            }
        }).join(WHITE_STRING); 
       
        return {
            filter: filterString
        }
    }

}