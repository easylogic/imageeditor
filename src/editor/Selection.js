import { Length } from "./unit/Length";
import { Item } from "./Item";
import { CHANGE_SELECTION } from "../csseditor/types/event";

export class Selection {
    constructor(editor) {
        this.editor = editor;

        this._mode = ''; 
        this._ids = []
        this._idSet = new Set()
    }

    initialize () {
        this._mode = ''; 
        this._ids = []
        this._idSet.clear()
    }

    /**
     * get id string list for selected items 
     */
    get ids () {
        return this._ids
    }

    /**
     * get item instance 
     */
    get items () {
        return this._ids.map(id => this.editor.get(id))
    }    

    /**
     * get first item instance 
     */
    get current () { return this.editor.get(this.ids[0]) }

    /**
     * get colorstep list
     */
    get colorsteps () { return this.search('colorstep')}

    /**
     * get first colorstep 
     */    
    get colorstep () { return this.colorsteps[0] }
    
    get backgroundImages () { return this.search('background-image'); }    
    get backgroundImage() { return this.backgroundImages[0]; }
    get images () { return this.search('image-resource'); }
    get image () { return this.images[0] }
    get boxShadows () { return this.search('box-shadow'); }    
    get textShadows () { return this.search('text-shadow'); }


    get layers () { return this.search('layer'); }
    get layer() { return this.layers[0] }
    get artboards () { return this.search('artboard'); }
    get artboard () { return this.artboards[0] }
    get projects () { return this.search('project'); }
    get project () { return this.projects[0] }
    get directories () { return this.search('directory') }
    get directory () { return this.directories[0] }

    get currentColorStep () { return this._colorstep }
    get currentImage() { return this._imageResource }
    get currentBackgroundImage () { return this._backgroundImage; }
    get currentDirectory () { return this._directory }
    get currentArtBoard () { return this._artboard }
    get currentProject() { return this._project }
    get currentLayer() { return this._layer }

    get mode () { return this._mode; }
    set mode (mode) { 
        if (this._mode != mode) {
            this._mode = mode; 
        }
    }

    updateColorStep( event, attrs = {}, context = null) {
        var colorstep = this.currentColorStep
        if (colorstep) { colorstep.reset(attrs); }
        (context || this.editor).emit(event, colorstep);
    }

    updateImageResource( event, attrs = {}, context = null) {
        var imageResource = this.currentImage
        if (imageResource) { imageResource.reset(attrs); }
        (context || this.editor).emit(event, imageResource);
    }

    updateLayer(event, attrs = {}, context = null) {
        var layer = this.currentLayer
        if (layer) { layer.reset(attrs); }
        (context || this.editor).emit(event, layer);
    }

    updateArtBoard(event, attrs = {}, context = null) {
        var artboard = this.currentArtBoard
        if (artboard) { artboard.reset(attrs); }
        (context || this.editor).emit(event, artboard);
    }  
    
    updateDirectory(event, attrs = {}, context = null) {
        var directory = this.currentDirectory
        if (directory) { directory.reset(attrs); }
        (context || this.editor).emit(event, directory);
    }      

    updateProject(event, attrs = {}, context = null) {
        var project = this.currentProject
        if (project) { project.reset(attrs); }
        (context || this.editor).emit(event, project);
    }    

    updateBackgroundImage(event, attrs = {}, context = null) {
        var image = this.currentBackgroundImage
        if (image) { image.reset(attrs); }
        (context || this.editor).emit(event, image);
    }        

    check (id) {
        var hasKey = this._idSet.has(id);

        if (!hasKey) {
            var isArtBoard = (this._artboard && this._artboard.id == id)
            if (isArtBoard) { return true; }

            var isProject = (this._project && this._project.id == id); 
            if (isProject) return true; 

            return false; 
        }

        return true; 
    }

    checkOne (id) {
        return this._idSet.has(id);
    }

    isEmpty () {
        return this._ids.length === 0; 
    }

    isNotEmpty() {
        return this._ids.length > 0; 
    }


    unitValues () {
        return this.items.map(item => {

            var x = item.x.value; 
            var y = item.y.value; 
            var width = item.width.value; 
            var height = item.height.value; 
            var id = item.id ;

            return {
                id, x, y, width,height,
                x2: x + width,
                y2: y + height,                
                centerX: x + width/2,
                centerY: y + height/2
            }
        })
    }

    search (itemType) {
        return this.items.filter(item => item.itemType === itemType)
    }

    is (mode) {
        return this._mode === mode; 
    }

    select (...args) {

        var isAll = args.map(id => {
            return this._idSet.has(id);
        }).every(it => it);

        this._ids = args.map(it => {
            if (it instanceof Item) {
                return it.id; 
            }

            return it; 
        }).filter(id => this.editor.has(id)); 
        this._idSet = new Set(this._ids);

        this.generateCache()

        if (!isAll) {
            this.editor.send(CHANGE_SELECTION);
        }

    }

    generateCache () {

        if (this._ids.length) {
            var parents = this.editor.get(this._ids[0]).path()
            this._colorstep = parents.filter(it => it.itemType === 'colorstep')[0]
            this._image = parents.filter(it => it.itemType === 'image-resource')[0]
            this._backgroundImage = parents.filter(it => it.itemType === 'background-image')[0]
            this._layer = parents.filter(it => it.itemType === 'layer')[0]
            this._directory = parents.filter(it => it.itemType === 'directory')[0]
            this._artboard = parents.filter(it => it.itemType === 'artboard')[0]
            this._project = parents.filter(it => it.itemType === 'project')[0]
        } else {
            this._colorstep = null
            this._image = null
            this._backgroundImage = null
            this._layer = null
            this._directory = null
            this._artboard = null;
            this._project = null ;
        }
    }

    focus (item) {
        // this.editor.send('focus', item);
    }

    area (rect) {
        var selectItems = this.editor.layers.filter(layer => {
            return !layer.lock && layer.checkInArea(rect)
        }).map(it => it.id);


        if (selectItems) {
            // FIXME: diff 를 매끄럽게 할 수 있는 방법이 필요하다. 
            var isChanged = JSON.stringify(this._ids) !== JSON.stringify(selectItems);
            if (isChanged && selectItems.length) {
                this.select(...selectItems);
            } else {
                var project = this.currentProject;
                project && project.select();                
            }

            return isChanged;
        } else {
            var project = this.currentProject;
            project && project.select();                

            return true; 
        }

    }

    rect () {
        var minX = Number.MAX_SAFE_INTEGER;
        var minY = Number.MAX_SAFE_INTEGER;
        var maxX = Number.MIN_SAFE_INTEGER;
        var maxY = Number.MIN_SAFE_INTEGER;

        this.items.forEach(item => {
            var x = item.screenX.value; 
            var y = item.screenY.value; 
            var x2 = item.screenX2.value;
            var y2 = item.screenY2.value;

            if (minX > x) minX = x; 
            if (minY > y) minY = y; 
            if (maxX < x2) maxX = x2;  
            if (maxY < y2) maxY = y2; 
        })

        var x = minX
        var y = minY
        var x2 = maxX
        var y2 = maxY

        var width = x2 - x;
        var height = y2 - y; 

        x = Length.px(x)
        y = Length.px(y)
        width = Length.px(width)
        height = Length.px(height)

        return new Item({ x, y, width, height});

    }

}