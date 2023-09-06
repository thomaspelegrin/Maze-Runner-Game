/** Represents a player in the game
 */
class ShieldPowerUp extends PowerUp {

    /** Constructor for a player
     * @param rowIndex - the row in the array 
     * @param colIndex - col in the array
     */
    constructor( rowIndex, colIndex ) {
        super( shield_mesh, rowIndex, colIndex, 1.5, mult(
            scalem( 0.012, 0.012, 0.012 ), rotateX( -90 ) ) );
        this.setAllMaterial( vec4( 0.9, 0.9, 0.9, 85 ) );
        this.texture_flag = true;

    }
}