/** Represents a player in the game
 */
class Token extends Mesh {
    /** Constructor for a player
     * @param mesh - the player model
     * @param rowIndex - the row in the array 
     * @param colIndex - col in the array
     * @param y - the y (height) of the player
     * @param transform - the transform matrix
     */
    constructor( rowIndex, colIndex ) {
        super( coin_mesh, rowIndex, colIndex, 0.75,
            mult( scalem( 0.6, 0.6, 0.6 ), rotateY( 90 ) ) );
        this.setAllMaterial( vec4( 1, 1, 1, 300 ) );
    }

    /** Peforms the animation for the tokens bouncing and rotating
     */
    tokenAnimation() {
        if ( pause ) return;
        let bounceStep = this.getDirY() > 0 ? COIN_BOUNCE_STEP : -COIN_BOUNCE_STEP;
        // changes the bounce direction if bounce has reached it's max height
        if ( this.getY() + bounceStep > 1.0 ) {
            this.setDirY( -1 );
            bounceStep = COIN_BOUNCE_STEP * 2 * -1;
        } else if ( this.getY() - bounceStep < 0.0 ) {
            this.setDirY( 1 );
            bounceStep = COIN_BOUNCE_STEP * 2;
        }
        this.setY( this.getY() + bounceStep );
        moveToOrigin( this );
        this.applyTransform(
            mult( translate( 0, bounceStep, 0 ), rotateY( 1 ) ) );
        moveBack( this );
    }
}