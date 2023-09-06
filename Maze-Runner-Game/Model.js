/** Represents a model (i.e. a shape or a mesh)
 */
class Model {
    /** Creates a new Mesh object
     * @param model the model object
     * @param transform the transform matrix you want to apply
     * @param rowIndex - row index in an array
     * @param colIndex - col index in an array
     * @param y - the y (height) value of this model
     * @param transform - (optional) transform matrix
     */
    constructor( model, rowIndex, colIndex, y, transform ) {
        this.model = model;
        if ( rowIndex == null || colIndex == null ) {
            // places at origin if not specified
            this.setRow( 10 );
            this.setCol( 10 );
        } else {
            this.setRow( rowIndex );
            this.setCol( colIndex );
        }
        this.setY( y );
        this.transformMatrix = mult(
            translate( this.getX(), this.getY(), this.getZ() ),
            transform != null ? transform : mat4() );

        if ( y != null ) {
            this.setY( y );
        }
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;

        //this.setTexture( null );
    }

    /** Returns the row index of the model (if used)
     * @returns row index of the model
     */
    getRow() {
        return this.row;
    }

    /** Returns the row index of the model (if used)
     * @returns row index of the model
     */
    setRow( row ) {
        this.row = row;
    }

    /** Returns the col index of the model (if used)
     * @returns col index of the model
     */
    getCol() {
        return this.col;
    }

    /** Returns the col index of the model (if used)
     * @returns col index of the model
     */
    setCol( col ) {
        this.col = col;
    }

    /** Returns the x coord
     * @returns the x coord
     */
    getX() {
        if (this.xCoord == null)
            return this.col * 2 - OFFSET;
        return this.xCoord;
    }

    /** Sets the x coord
     */
    setX( x ) {
        this.xCoord = x;
    }

    /** Retunrs the y coord
     * @returns the y coord
     */
    getY() {
        return this.yCoord;
    }

    /** Sets the y coord
     */
    setY( y ) {
        this.yCoord = y;
    }

    /** Returns the z coord
     * @returns the z coord
     */
    getZ() {
        if (this.zCoord == null)
            return this.row * 2 - OFFSET;
        return this.zCoord;
    }

    /** Sets the z coord
     */
    setZ( z ) {
        this.zCoord = z;
    }

    /** Returns the mesh array object at the top of the mesh file
     * @returns the mesh array object from the file
     */
    getModel() {
        return this.model;
    }

    /** Gets the vertex array object
     * @returns the vao object
     */
    getVAO() {
        return this.vao;
    }

    /** Sets the vertex array object
     */
    setVAO( vao ) {
        this.vao = vao;
        return this.vao;
    }

    /** Returns the vertices[ 0 ].values from the mesh file
     * @returns vertices[ 0 ].values
     */
    getCoords() {
        return this.coords;
    }

    /** Returns the indices
     * @returns indices
     */
    getIndices() {
        return this.indices;
    }

    /** Returns the vertices[ 1 ].normals from the mesh file
     * @returns vertices[ 1 ].normals
     */
    getNormals() {
        return this.normals;
    }

    /** Returns the texture coordinates
     * @returns texCoords the texture coordinates
     */
    getTexCoords() {
        return this.texCoords;
    }

    /** Returns the transform matrix
     * @returns transform matrix
     */
    getTransform() {
        return this.transformMatrix;
    }

    /** Sets the transformation matrix
     * @param transform the transformations to apply
     */
    applyTransform( transform ) {
        this.transformMatrix = mult( transform, this.transformMatrix );
    }

    /** Returns the materialDiffuse vec4
     * @returns the materialDiffuse vec4
     */
    getMaterialDiffuse() {
        if ( this.materialDiffuse == null ) {
            this.setMaterialDiffuse( randVec4() );
        }
        return this.materialDiffuse;
    }

    /** Sets the material diffuse
     */
    setMaterialDiffuse( materialDiffuse ) {
        this.materialDiffuse = materialDiffuse;
    }

    /** Returns the materialAmbient vec4
     * @returns the materialAmbient vec4
    */
    getMaterialAmbient() {
        if ( this.materialAmbient == null ) {
            this.setMaterialAmbient( randVec4() );
        }
        return this.materialAmbient;
    }

    /** Sets the material ambient
     */
    setMaterialAmbient( materialAmbient ) {
        this.materialAmbient = materialAmbient;
    }

    /** Returns the materialSpecular vec4
     * @returns the materialSpecular vec4
     */
    getMaterialSpecular() {
        if ( this.materialSpecular == null ) {
            this.setMaterialSpecular( randVec4() );
        }
        return this.materialSpecular;
    }

    /** Sets the material specular
     */
    setMaterialSpecular( materialSpecular ) {
        this.materialSpecular = materialSpecular;
    }

    /** Returns the shininess vec4
     * @returns the shininess vec4
     */
    getMaterialShininess() {
        if ( this.materialSpecular == null || this.materialSpecular < 1
            || this.materialSpecular > 100 ) {
            this.setMaterialShininess( randInt() );
        }
        return this.materialShininess;
    }

    /** Sets the shininess for the mesh
     * @param shininess value (1-100)
     */
    setMaterialShininess( shininess ) {
        this.materialShininess = shininess;
    }

    /** Sets all of the material properties in one call
     * @param material - the vec4 to set all properties to
     * @oaram shininess - the shininess value (1-100)
     */
    setAllMaterial( material) {
        this.setMaterialDiffuse( material );
        this.setMaterialAmbient( material );
        this.setMaterialSpecular( material );
        this.setMaterialShininess( material[ 3 ] );
    }

    /** Turns the texture on for this shape
     */
    toggleTexture() {
        this.texture_flag = !this.texture_flag;
        setUpVertexObject( this );
    }

    /** Returns whether this model has a texture
     * @returns true/false
     */
    isTextureEnabled() {
        return this.texture_flag;
    }

    /** Sets the texture
     */
    getTexture() {
        return this.texture;
    }

    /** Sets the texture
     */
    setTexture( texture ) {
        this.texture = texture;
    }
}