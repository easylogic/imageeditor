
import hexagon from "../clip-path/hexagon";
import { SHAPE_TYPE_POLYGON, CLIP_PATH_TYPE_POLYGON } from "../../../util/css/types";


export default {
    type: SHAPE_TYPE_POLYGON,
    clipPathType: CLIP_PATH_TYPE_POLYGON,
    ...hexagon,
}