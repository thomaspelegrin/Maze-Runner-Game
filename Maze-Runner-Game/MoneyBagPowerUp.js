/** Represents a player in the game
 */
 class MoneyBagPowerUp extends PowerUp {

    /** Constructor for a player
     * @param rowIndex - the row in the array 
     * @param colIndex - col in the array
     */
    constructor( rowIndex, colIndex ) {
        super( moneybag_mesh, rowIndex, colIndex, 1.5, mult(
            scalem( 0.05, 0.05, 0.05 ), rotateX( -90 ) ) );
            this.setAllMaterial( vec4( 1, 0.5, 1, 1 ) );
            this.texture_flag = true;

    }
}