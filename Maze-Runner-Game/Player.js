/** Represents a player in the game
 */
class Player extends Mesh {

    /** Constructor for a player
     * @param mesh - the player model
     * @param rowIndex - the row in the array 
     * @param colIndex - col in the array
     * @param y - the y (height) of the player
     * @param transform - the transform matrix
     */
    constructor( mesh, rowIndex, colIndex, y, transform, color ) {
        super( mesh, rowIndex, colIndex, y, transform );
        this.collectedTokens = new Set();
        this.lastMiningMove = 0;
        this.totalMoves = 0;
        this.color = color;
        this.setAllMaterial( color );
        this.score = 0;
        this.timeout = false;
        this.timeoutStartTime = 0;
        this.isProtected = false;
    }

    /** Returns the time when the timeout started
     * @returns the time out start time
     */
    getTimeoutStartTime() {
        return this.timeoutStartTime;
    }

    /** Returns true if the player is currently on timeout
     * @return true if the player is currently on timeout
     */
    isOnTimeout() {
        return this.timeout;
    }

    /** Ends the timeout
     */
    endTimeout() {
        this.timeout = false;
        this.timeoutStartTime = 0;
    }

    /** Temporarily prevents the player from making moves
     * @param timeoutStartTime - amount of time of the time out
     */
    startTimeout( timeoutStartTime ) {
        this.timeout = true;
        this.timeoutStartTime = timeoutStartTime;
    }

    /** Increments the total moves of the player
     */
    incrementMoves() {
        this.totalMoves++;
    }

    /** Decreases the players score, score can't be negative
     * @param decreaseAmount - amount to decrease by
     * @returns the net decrease
     */
    decreaseScore( decreaseAmount ) {
        let prevScore = this.score;

        if ( this.score < decreaseAmount ) {
            this.setScore( 0 );
        } else {
            this.setScore( this.score - decreaseAmount );
        }

        return prevScore - this.score;
    }

    /** Sets the score for the player
     * @param score - the new score
     */
    setScore( score ) {
        this.score = score;
        scores.innerHTML = 'Player: ' + hero.getScore()
            + ', Computer: ' + villain.getScore()
    }

    /** increments the player score
     */
    getScore() {
        return this.score;
    }

    /** Drops a mine for the player
     */
    dropMine() {
        // if the tile is not open or if the player just dropped a bomb, return
        if ( map[ this.getRow() ][ this.getCol() ] != OPEN_TILE
            || this.totalMoves <= this.lastMiningMove + 6 ) {
            return;
        }
        this.lastMiningMove = this.totalMoves;

        let mine = new Mine( this.getRow(), this.getCol(), this );
        mine.setAllMaterial( this.color, );
        map[ this.getRow() ][ this.getCol() ] = MINE_TILE;
        models.push( mine );
        models_map.set( [ this.getRow(), this.getCol() ].toString(), mine );
    }

    /** Adds a token to this player and increments score
     * @param token - the token to add 
     */
    addToken( token ) {
        this.collectedTokens.add( token );
        this.score++;
    }

    /** Randomly removes the specified number of tokens from this player
     * @param numTokensToRemove - the number of tokens to remove 
     */
    removeTokens( numTokensToRemove ) {
        let removalIndices = [];
        let tokensRemoved = 0;
        let iteration = 0;
        // if the score is less than the number of tokens to remove
        numTokensToRemove = numTokensToRemove > this.collectedTokens.size ? this.collectedTokens.size : numTokensToRemove;

        while ( removalIndices.length < numTokensToRemove ) {
            let randIndex = randInt() % this.collectedTokens.size;
            if ( !removalIndices.includes( randIndex ) ) {
                removalIndices.push( randIndex );
            }
        }
        removalIndices.sort();      // sorts so that below loop works

        for ( let token of this.collectedTokens.keys() ) {
            if ( iteration++ == removalIndices[ tokensRemoved ] ) {
                tokensRemoved++;
                // removes the token from this player
                this.collectedTokens.delete( token );

                // the below lines will re-add the tokens to the map
                map[ token.getRow() ][ token.getCol() ] = TOKEN_TILE;
                consumed.delete( token );
                models_map.set( [ token.getRow(), token.getCol() ].toString(),
                    token );
            }
        }
    }

    /** Changes the character
     * @param the mesh you want to use
     */
    changeMesh( mesh, transform ) {
        if ( this.changed ) return;
        this.changed = true;
        this.coords = mesh.vertices[ 0 ].values;
        this.indices = mesh.connectivity[ 0 ].indices;
        this.normals = mesh.vertices[ 1 ].values;
        this.texCoords = this.coords;
        this.texture_flag = true;
        setUpVertexObject( this );
        moveToOrigin( this );
        this.applyTransform( transform );
        moveBack( this );
    }

    /** Gives an animation to the player to show their protected status
     */
    protectedAnimation() {
        if ( pause ) return;

        if ( this.isProtected ) {
            this.setAllMaterial(
                vec4( randFloat(), randFloat(), randFloat(), 30 ) );
        } else {
            this.setAllMaterial( this.color );
        }
    }


    /** Returns the angle necessary to rotate the player model during a move
     * @param player - the player who is moving
     * @param dir - the direction: up, down, left, or right
     * @returns angle necessary to rotate the player model during a move
     */
    getNewOrientation( dir ) {
        let currentOrient = this.orientation;

        switch ( dir ) {
            case "W": this.orientation = 0; break;
            case "A": this.orientation = 90; break;
            case "S": this.orientation = randInt() % 2 == 0 ? 180 : -180; break;
            case "D": this.orientation = -90; break;
        }
        return this.orientation - currentOrient;
    }

    /** Moves the character
     * @param dir - the direction: up, down, left, or right
     */
    movePlayer( dir ) {
        let row = this.getRow();
        let col = this.getCol();
        let coords;

        if ( this.isOnTimeout() && this.getTimeoutStartTime() + 75 < time_elapsed ) {
            this.endTimeout();
        } else if ( this.isOnTimeout() || game_over ) {
            return;
        }
        switch ( dir ) {
            case "W": row--; break;     // up
            case "A": col--; break;     // left
            case "S": row++; break;     // down
            case "D": col++; break;     // right
        }
        coords = getWorldCoords( row, col );
        if ( row < 1 || row > map.length - 1 || col < 1 || col > map.length - 1
            || map[ row ][ col ] == WALL_TILE ) {
            return;
        } else if ( map[ row ][ col ] > 1 && map[ row ][ col ] < VILLAIN_TILE ) {
            this.consumeTile( map[ row ][ col ], row, col );
        }
        //player mesh movement
        moveToOrigin( this );
        this.applyTransform( rotateY(
            this.getNewOrientation( dir ) ) );
        moveBack( this );
        this.applyTransform( translate(
            coords.x - this.getX(), 0, coords.z - this.getZ() ) );
        this.setRow( row );
        this.setCol( col );

        if ( map[ row ][ col ] > 1 && map[ row ][ col ] < VILLAIN_TILE ) {
            map[ row ][ col ] = OPEN_TILE;
        }
        this.incrementMoves();
    }

    /** Activates the tile so that it provides its function to the player
     * @param tile - the map tile
     */
    consumeTile( tile, row, col ) {
        let removed = models_map.get( [ row, col ].toString() );
        models_map.delete( [ row, col ].toString() );
        consumed.add( removed );  // remove from map

        //picked up tile and effect
        switch ( true ) {
            case tile == TOKEN_TILE: this.addToken( removed );
                scores.innerHTML = 'Player: ' + hero.getScore()
                    + ', Computer: ' + villain.getScore();
                villain.getAvailable(); break;
            case tile == MONEY_POWERUP_TILE: this.setScore( this.score + 5 ); break;
            case tile == SHIELD_POWERUP_TILE: this.isProtected = true; break;
            case tile == SHOE_POWERUP_TILE: difficulty = parseInt( difficulty ) + ( this == hero ? 10 : -10 ); break;
            case tile == MYSTERY_POWERUP_TILE:
                switch ( randInt() % 3 ) {
                    case 0: this.setScore( this.score + 5 ); break;
                    case 1: this.isProtected = true; break;
                    case 2: difficulty = parseInt( difficulty ) + ( 
                        this == hero ? 10 : -10 ); break;
                }
        }
    }
}