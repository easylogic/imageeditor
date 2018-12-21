import items  from './items/index'
import BaseTab from "../../BaseTab";
import { SELECT_TAB_IMAGE } from '../../../types/event';


export default class ImageTabView extends BaseTab {

    template () {
        return `
            <div class="tab horizontal">
                <div class="tab-header" ref="$header">
                    <div class="tab-item selected" data-id="gradient">Gradient</div>
                    <div class="tab-item" data-id="css">CSS</div>
                </div>
                <div class="tab-body" ref="$body">
                    <div class="tab-content selected" data-id="gradient">
                        <BackgroundInfo></BackgroundInfo>
                        <BackgroundBlend></BackgroundBlend>
                        <div class='sub-feature'>
                            <BackgroundSize></BackgroundSize>
                        </div>
                        <ColorPickerPanel></ColorPickerPanel>
                        <ColorStepsInfo></ColorStepsInfo>   
                    </div>
                    <div class="tab-content" data-id="css">
                        <BackgroundCode></BackgroundCode>
                    </div>
                </div>
            </div> 
        `
    }

    onTabShow () {
        this.emit(SELECT_TAB_IMAGE, this.selectedTabId)
    }

    components () {
        return {            
            ...items
        }
    }
}