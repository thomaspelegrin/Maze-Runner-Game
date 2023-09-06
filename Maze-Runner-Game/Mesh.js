/** Represents a Mesh model
 */
class Mesh extends Model {

    /** Creates a Mesh Model object
     * @param mesh the name of the mesh array in the mesh file
     * @param transform the transform matrix
     */
    constructor( mesh, rowIndex, colIndex, y, transform ) {
        super( mesh, rowIndex, colIndex, y, transform );
        this.coords = mesh.vertices[ 0 ].values;
        this.indices = mesh.connectivity[ 0 ].indices;
        this.normals = mesh.vertices[ 1 ].values;
        this.texCoords = this.coords;
        this.texture_flag = true;
        setUpVertexObject( this );
        /*------------------- used as directional flags ----------------------*/
        this.setDirX( 1 );
        this.setDirY( 1 );
        this.setDirZ( 1 );
        this.setScaleFactor( 1 );
    }

    /** Returns the x direction
     * @returns xDir
     */
    getDirX() {
        return this.xDir;
    }

    /** Sets the x direction
     */
    setDirX( xDir ) {
        this.xDir = xDir;
    }

    /** Returns the x direction
     * @returns xDir
     */
    getDirY() {
        return this.yDir;
    }

    /** Sets the y direction
     */
    setDirY( yDir ) {
        this.yDir = yDir;
    }

    /** Returns the x direction
     * @returns xDir
     */
    getDirZ() {
        return this.zDir;
    }

    /** Sets the z direction
     */
    setDirZ( zDir ) {
        this.zDir = zDir;
    }

    /** Return the TOTAL scale amount
     * @returns the scale amount
     */
    getScaleFactor() {
        return this.scaleFactor;
    }

    /** Sets the TOTAL scale amount
     * @param factor - the scale factor i.e. 1.1 = 10% larger
     */
    setScaleFactor( factor ) {
        this.scaleFactor = factor;
    }
}
