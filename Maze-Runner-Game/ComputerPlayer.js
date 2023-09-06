/** Represents a player in the game
 */
class ComputerPlayer extends Player {

    /** Constructor for a player
     * @param mesh - the player model
     * @param rowIndex - the row in the array 
     * @param colIndex - col in the array
     * @param y - the y (height) of the player
     * @param transform - the transform matrix
     */
    constructor( rowIndex, colIndex ) {
        super( lego_mesh, rowIndex, colIndex, 0.75,
            mult( scalem( 0.40, 0.40, 0.40 ), rotateY( 0 ) ),
            vec4( 1, 0.0, 0.0, 20 ) );
        this.currentPath = [];
        this.currentPathIndex = 0;
    }

    /** Generates a move for the computer player
     */
    move() {
        let dir = this.getNextMove();
        if ( dir == null ) return;       // if no direction found do nothing

        /* 2/3 chance for the computer to drop a mine if the hero is within 4
         tiles of the computer OR 1/50 chance for the computer to drop one 
         for no reason */
        if ( ( Math.abs( hero.getRow() - this.getRow() ) <= 4
            && Math.abs( hero.getCol() - this.getCol() ) <= 4
            && randInt() % 3 <= 1 ) || randInt() % 50 == 0 ) {
            this.dropMine()
        }
        this.movePlayer( dir );
    }

    /** Returns the next move for the computer player 
     */
    getNextMove() {
        let nextTile;
        if ( this.currentPath == null ) return null;

        if ( this.currentPathIndex >= this.currentPath.length ) {
            this.currentPathIndex = 0;
            // gets a new list of closest destinations
            this.nextDestinations = this.getAvailable();
            // sets the next destination to the next available token/powerup
            nextTile = this.nextDestinations.dequeue();

            // when there are no more destinations possible i.e. the game ended 
            if ( nextTile == null ) return null;

            // if the item at this destination has already been taken 
            if ( map[ nextTile.row ][ nextTile.col ] == OPEN_TILE ) {
                for ( let i = 0; i < this.nextDestinations.length; i++ ) {
                    nextTile = this.nextDestinations.dequeue();

                    // breaks when it finds a still valid destination
                    if ( map[ nextTile.row ][ nextTile.col ] != OPEN_TILE ) {
                        break;
                    }
                }
            }
            this.currentPath = this.convertPathToChars(
                this.getPath( nextTile.row, nextTile.col ) );

            if ( this.currentPath == null ) return null;
        }
        return this.currentPath[ this.currentPathIndex++ ];
    }

    /** Returns a PriorityQueue of the closest available tokens/powerups
     * @returns an PriorityQueue containing the nearest tokens/powerups
     */
    getAvailable() {
        let nextDests = new PriorityQueue();
        let distance;
        let tokenCount = 0;

        for ( let i = 0; i < map.length; i++ ) {
            for ( let k = 0; k < map[ i ].length; k++ ) {
                if ( map[ i ][ k ] == HERO_TILE ) {        // hero location
                    this.heroLocation = { row: i, col: k };
                } else if ( map[ i ][ k ] > WALL_TILE
                    && map[ i ][ k ] < VILLAIN_TILE ) {
                    distance = Math.sqrt( Math.pow( i - this.getRow(), 2 )
                        + Math.pow( k - this.getCol(), 2 ) );
                    nextDests.enqueue( distance, { row: i, col: k } );
                }

                if ( map[ i ][ k ] == TOKEN_TILE ) { tokenCount++; }
            }
        }
        if ( tokenCount <= 0 ) gameOver()

        return nextDests;
    }

    /** Converts the path coordinates to letters representing WASD directions
     * @param path the path 
     * @returns an array of W, A, S, or D chars 
     */
    convertPathToChars( path ) {
        if ( path == null ) return null;
        let charQueue = [];
        let prev = { row: this.getRow(), col: this.getCol() };
        let dir = "";

        for ( let i = 1; i < path.length; i++ ) {
            switch ( true ) {
                case ( prev.row - 1 == path[ i ].row ): dir = "W"; break;
                case ( prev.col - 1 == path[ i ].col ): dir = "A"; break;
                case ( prev.row + 1 == path[ i ].row ): dir = "S"; break;
                case ( prev.col + 1 == path[ i ].col ): dir = "D"; break;
            }
            charQueue.push( dir );
            prev = path[ i ];
        }
        return charQueue;
    }

    /** Credit: Modified  dijkstra's algorithm from:
       * https://stackoverflow.com/questions/46393411/find-the-shortest-path-from-the-mazebreadth-first-search
       * @param toRow - the destination row
       * @param toCol - the destination column
       * @returns the shortest path
       */
    getPath( toRow, toCol ) {
        let queue = [];
        // makes a deep copy of the map, so that this getPath doesnt change map
        let mapCopy = Array( 21 ).fill( WALL_TILE ).map( () => Array( 21 ) );

        for ( let i = 1; i < map.length - 1; i++ ) {
            for ( let k = 1; k < map.length - 1; k++ ) {
                mapCopy[ i ][ k ] = map[ i ][ k ];
            }
        }
        queue.push( [ { row: this.getRow(), col: this.getCol() } ] );

        while ( queue.length > 0 ) {
            let path = queue.shift();           //get the path out of the queue
            let pos = path[ path.length - 1 ];  //and then the last position from it
            let dir = [
                [ pos.row + 1, pos.col ],
                [ pos.row, pos.col + 1 ],
                [ pos.row - 1, pos.col ],
                [ pos.row, pos.col - 1 ] ];

            for ( let i = 0; i < dir.length; i++ ) {
                if ( dir[ i ][ 0 ] == toRow && dir[ i ][ 1 ] == toCol ) {
                    // return the path that led to the find
                    return path.concat( { row: toRow, col: toCol } );
                }

                if ( dir[ i ][ 0 ] < 1 || dir[ i ][ 0 ] >= map.length - 1
                    || dir[ i ][ 1 ] < 1 || dir[ i ][ 1 ] >= map.length - 1
                    || mapCopy[ dir[ i ][ 0 ] ][ dir[ i ][ 1 ] ] == WALL_TILE ) {
                    continue;
                }
                mapCopy[ dir[ i ][ 0 ] ][ dir[ i ][ 1 ] ] = WALL_TILE;
                // extend and push the path on the queue
                queue.push( path.concat(
                    { row: dir[ i ][ 0 ], col: dir[ i ][ 1 ] } ) );
            }
        }
    }

    /** Helper function that returns the neighboring open tiles
     * @param row - the row of the wall
     * @param col - of the wall
     * @returns the neighboring walls
     */
    getOpenAdjacentTiles( row, col ) {
        let neighboring = [];

        if ( row < map.length - 1 && map[ row + 1 ][ col ] == OPEN_TILE )
            neighboring.push( [ row + 1, col ].toString() );
        if ( col < map.length - 1 && map[ row ][ col + 1 ] == OPEN_TILE )
            neighboring.push( [ row, col + 1 ].toString() );
        if ( row > 0 && map[ row - 1 ][ col ] == OPEN_TILE )
            neighboring.push( [ row - 1, col ].toString() );
        if ( col > 0 && map[ row ][ col - 1 ] == OPEN_TILE )
            neighboring.push( [ row, col - 1 ].toString() );

        return neighboring;
    }
}