/** Represents a player in the game
 */
class PowerUp extends Mesh {
    /** Constructor for a player
     * @param mesh - the player modelp
     * @param rowIndex - the row in the array 
     * @param colIndex - col in the array
     * @param y - the y (height) of the player
     * @param transform - the transform matrix
     */
    constructor( mesh, rowIndex, colIndex, y, transform ) {
        super( mesh, rowIndex, colIndex, y, transform );
    }

    /** Performs the scaling animation for the power-ups
     */
    powerUpAnimation() {
        if ( pause ) return;
        let scaleAmt = this.getDirY() < 0 ? -0.01 : 0.01;

        if ( this.getScaleFactor() > 1.125 ) {
            this.setDirY( -1 );
            scaleAmt = -0.0005;
        } else if ( this.getScaleFactor() < 0.5 ) {
            this.setDirY( 1 );
            scaleAmt = 0.0005;
        }
        //gives a bobbing/pulsing animation
        this.setScaleFactor( this.getScaleFactor() + scaleAmt );
        moveToOrigin( this );
        this.applyTransform( mult(
            scalem( scaleAmt + 1, scaleAmt + 1, scaleAmt + 1 ),
            rotateY( 0.075 ) ) );
        moveBack( this );
    }
}