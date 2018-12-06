import UIElement from "../../../../../colorpicker/UIElement";
import GradientInfo from "../../colorsteps/GradientInfo";
import { EVENT_CHANGE_EDITOR } from "../../../../types/event";

export default class ColorStepsInfo extends UIElement {
    template () {
        return `
            <div class='property-item gradient-steps-info show'>
                <div class='items'>            
                    <GradientInfo></GradientInfo>
                </div>
            </div>
        ` 
    }

    components() {
        return { GradientInfo }
    }
 
    refresh () {
        this.$el.toggle(this.isShow())
    }

    [EVENT_CHANGE_EDITOR] () {
        this.refresh()
    }

    isShow () {
        var item = this.read('/selection/current/image')

        if (!item) return false; 

        return this.read('/image/type/isGradient', item.type)
    }
}