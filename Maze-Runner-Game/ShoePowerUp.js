/** Represents a player in the game
 */
class ShoePowerUp extends PowerUp {

    /** Constructor for a player
     * @param rowIndex - the row in the array 
     * @param colIndex - col in the array
     */
    constructor( rowIndex, colIndex ) {
        super( shoe_mesh, rowIndex, colIndex, 1.5,
            scalem( 0.30, 0.30, 0.30 ) );
        this.setAllMaterial( vec4( 0.5, 0.5, 0.5, 1 ) );
        this.texture_flag = true;
    }
}