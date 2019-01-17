import UIElement from '../../../colorpicker/UIElement';
import ImageListView from './ImageListView';
import { CLICK } from '../../../util/Event';

export default class LayerToolbar extends UIElement {

    template () {  
        return `
            <div class='layer-toolbar'>            
                <div style="display:inline-block;vertical-align:middle;">       
                    <ImageListView></ImageListView>               
                </div>    
            </div>
        `
    }

    components () {
        return { ImageListView }
    } 
}