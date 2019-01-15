import MenuItem from "./MenuItem";
import { EVENT } from "../../../../colorpicker/UIElement";
import { CHANGE_EDITOR, CHANGE_SELECTION } from "../../../types/event";


export default class ShowGrid extends MenuItem {
    constructor(opt = {}, props = {}, parent = null) {
        super(opt, props, parent);

        this.title = props.title || 'Show Grid';
        this.icon = 'show-grid';
        this.checked = this.read('tool/get', 'show.grid');
    }

    clickButton (e) {
        this.read('selection/current/page', (item) => {
            this.checked = !this.checked; 
            this.run('tool/set', 'show.grid', this.checked)
            this.dispatch('tool/set', 'snap.grid', this.checked)
        });

        this.refresh();
    }

    [EVENT(
        CHANGE_EDITOR,
        CHANGE_SELECTION
    )] () {
        this.refresh();
    }

    refresh () {
        this.$el.attr('checked', this.checked ? 'checked' : '');
    }
}