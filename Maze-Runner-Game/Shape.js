/** Represents a Shape model
 */
class Shape extends Model {

    /** Creates a new Shape object
     * @param shape the shape object made from the shapes class functions
     * @param transform the tranformMatrix
     */
    constructor( shape, rowIndex, colIndex, y, transform ) {
        super( shape, rowIndex, colIndex, y, transform );
        this.coords = shape.positions;
        this.indices = shape.indices;
        this.normals = shape.normals;
        this.texCoords = shape.texcoord;
        this.texture_flag = true;
        setUpVertexObject( this );
    }
}
