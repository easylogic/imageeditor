import { Length, Position } from "../unit/Length";
import { keyMap } from "../../util/functions/func";
import { Property } from "../Property";
import { Gradient } from "../image-resource/Gradient";

const RepeatList = ['repeat', 'no-repeat', 'repeat-x', 'repeat-y']

export class BackgroundImage extends Property {
 
    addImageResource (imageResource) {
        this.clear('image-resource')
        return this.addItem('image-resource', imageResource)
    }

    addGradient(gradient) {
        return this.addImageResource(gradient);
    }

    getDefaultObject() { 
        return super.getDefaultObject({ 
            itemType: 'background-image',
            blendMode: 'normal',
            size: 'auto',
            repeat: 'repeat',
            width: Length.percent(100),
            height: Length.percent(100),
            x: Position.CENTER,
            y: Position.CENTER
        })
    }

    checkField(key, value) {
        if (key === 'repeat') {
            return RepeatList.includes(value)
        }

        return super.checkField(key, value); 
    }

    get image (){
        return this.one({itemType: 'image-resource'}) || new Gradient()
    }

    //FIXME: why this method is not working 
    set image (imageResource) {
        this.addImageResource(imageResource);
    }

    toBackgroundImageCSS () {
        if (!this.image) return {}
        return {
            'background-image': this.image + ""
        }
    }

    toBackgroundPositionCSS () {
        var json = this.json; 
    
        return {
            'background-position': `${json.x} ${json.y}`
        }
    }      
    
    toBackgroundSizeCSS() {
    
        var json = this.json; 
        var backgroundSize = 'auto' 

        if (json.size == 'contain' || json.size == 'cover') {
            backgroundSize = json.size; 
        } else if (json.width.isPercent() && json.width.isPercent()) {
            // 기본 사이즈가 아닌 것만 표시 (100% 100% 이 아닐 때 )
            if (+json.width !== 100 || +json.height !== 100) {
                backgroundSize = `${json.width} ${json.height}`
            }
            
        } else {
            backgroundSize = `${json.width} ${json.height}`
        }

        return {
            'background-size': backgroundSize
        }
    }
    
    toBackgroundRepeatCSS() {
        var json = this.json; 
        return {
            'background-repeat': json.repeat
        }
    }

    toBackgroundBlendCSS() {
        var json = this.json; 
        return {
            'background-blend-mode': json.blendMode
        }
    }    

    toCSS () {

        var results = {
            ...this.toBackgroundImageCSS(),
            ...this.toBackgroundPositionCSS(),
            ...this.toBackgroundSizeCSS(),
            ...this.toBackgroundRepeatCSS(),
            ...this.toBackgroundBlendCSS()
        }       
        
        return results
    }    

    toString () {
        return keyMap(this.toCSS(), (key, value) => {
            return `${key}: ${value}`
        }).join(';')
    }


}