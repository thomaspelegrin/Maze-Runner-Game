/** Represents a player in the game
 */
class MysteryPowerUp extends PowerUp {

    /** Constructor for a player
     * @param rowIndex - the row in the array 
     * @param colIndex - col in the array
     */
    constructor( rowIndex, colIndex ) {
        super( mystery_mesh, rowIndex, colIndex, 1.5,
            scalem( 0.1, 0.1, 0.1 ) );
        this.setAllMaterial( vec4( 1, 1, 1, 1 ) );
        this.texture_flag = true;
    }

}