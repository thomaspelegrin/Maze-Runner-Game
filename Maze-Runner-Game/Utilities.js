/** Helper function to move model to the models origin spot after rotation
 * @param model - the model you want to rotate
 */
function moveBack( model ) {
    model.applyTransform(
        translate( model.getX(), model.getY(), model.getZ() ) );
}

/** Helper function to move model to the origin
 * @param model - the model you want to rotate
 */
function moveToOrigin( model ) {
    model.applyTransform(
        translate( -model.getX(), -model.getY(), -model.getZ() ) );
}

/** Given the array row and col, return the x and z for the screen
 * @param row - the row in the array
 * @param col - the col in the array
 * @returns the X and Z coodinates corresponding to that array position
 */
function getWorldCoords( row, col ) {
    return { x: col * 2 - OFFSET, z: row * 2 - OFFSET };
}

/** Helper method that converts degrees to radians
 * @param deg degrees
 * @returns radians
 */
function degToRad( deg ) {
    return deg * Math.PI / 180;
}

/** Returns a random int value between 1-100 (inclusive)
 * @returns random int value
 */
function randInt() {
    return Math.floor( Math.random() * 100 + 1 );
}

/** Returns a random float value
 * @returns a random float value
 */
function randFloat() {
    return 1.0 / Math.floor( Math.random() * ( 7 - 1 ) + 1 )
}

/** Returns a randomized vec4 for the material properties
 * @returns randomized vec4 for the material
 */
function randVec4() {
    return vec4(
        0.5 * randFloat(),
        0.5 * randFloat(),
        0.5 * randFloat(),
        0.5 * randFloat() );
}

/** For debugging purposes; prints the map pattern out to the console
 */
function printMapPattern() {
    let string = "";
    let buffer = " ";

    for ( let i = 0; i < map.length; i++ ) {
        for ( let k = 0; k < map[ i ].length; k++ ) {
            if ( map[ i ][ k ] == OPEN_TILE ) {
                string += "  ";
            } else if ( map[ i ][ k ] == WALL_TILE ) {
                string += "X ";
            } else if ( map[ i ][ k ] == TOKEN_TILE ) {
                string += "o ";
            } else if ( map[ i ][ k ] > TOKEN_TILE && map[ i ][ k ] < VILLAIN_TILE ) {
                string += "p ";
            } else if ( map[ i ][ k ] == VILLAIN_TILE ) {
                string += "v ";
            } else if ( map[ i ][ k ] == HERO_TILE ) {
                string += "h ";
            } else if ( map[ i ][ k ] == MINE_TILE ) {
                string += "M ";
            } else {
                string += "? ";
            }
        }
        console.log( string + buffer );
        string = "";
        buffer += " ";
    }
}

/** For debugging, to quikcly print out a message to console
 * @param msg - the message to print
 */
function log( msg ) {
    console.log( msg );
}