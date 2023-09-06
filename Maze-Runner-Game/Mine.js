/** Represents a Shape model
 */
class Mine extends Mesh {

    /** Creates a new mine object
     * @param shape the shape object made from the shapes class functions
     * @param transform the tranformMatrix
     */
    constructor( rowIndex, colIndex, owner ) {
        super( mine_mesh, rowIndex, colIndex, 1, mult( translate( 0, 0, -0.66 ),
            scalem( 0.02, 0.02, 0.02 ) ) );
        this.setAllMaterial( owner.color );
        this.owner = owner;
        this.detonating = false;
        this.ticks = 0; // used so that the mine can't just instantly explode
        this.hit = false;
    }

    /** Returns the owner of the mine
     * @returns the owner of the mine
     */
    getOwner() {
        return this.owner;
    }

    /** Increments the number of ticks
     */
    incrementTicks() {
        this.ticks++;
    }

    /** If a player walks into the area of the mine it will explode, this
     * method returns whether a player was hit
     * 
     * @returns if a target is hit
     */
    isTargetHit() {
        return this.hit;
    }

    /** When a target is hit, the function will return the
     * villain or hero who was hit.
     * 
     * @returns The player that was hit by the mine
     */
    getTargetPlayer() {
        return this.owner == hero ? villain : hero;
    }

    /** Returns the tick count
     * @returns 
     */
    getTickCount() {
        return this.ticks;
    }

    /** Returns if the mine has reached detonation phase
     * @returns 
     */
    isDetonating() {
        return this.detonating;
    }

    /** Returns true if the enemy player is within proximity of the mine
     * @returns true if the enemy player is within proximity of the mine
     */
    isWithinProximity() {
        // so that the mine can't just blow up right away and also adds
        // a bit of randomness to the mine since it may not blow
        if ( this.ticks < 100 || randInt() % 10 == 1 ) { return false }
        let enemyPlayer = this.owner == hero ? villain : hero;

        // if the player is within 2 tiles, detonate the mine
        if ( Math.abs( this.getRow() - enemyPlayer.getRow() ) <= 2
            && Math.abs( this.getCol() - enemyPlayer.getCol() ) <= 2 ) {
            this.detonating = true;
            this.explode();
            return true;
        }
        return false;
    }

    /** Changes the mesh to the explosion mesh
     */
    explode() {
        if ( this.changed ) return;
        this.changed = true;
        this.coords = mushroom_mesh.vertices[ 0 ].values;
        this.indices = mushroom_mesh.connectivity[ 0 ].indices;
        this.normals = mushroom_mesh.vertices[ 1 ].values;
        this.texCoords = this.coords;
        this.texture_flag = true;
        setUpVertexObject( this );
        this.setX( this.getX() - 1.33 );    // center the explosion
        this.transformMatrix = mult( scalem( 0.5, 0.5, 0.5 ),
            rotateX( -90 ) );
        this.setAllMaterial( vec4( 1, 0.64, 0, 150 ) );
        moveBack( this );
    }

    /** Animates the mine and the explosion
     */
    mineAnimation() {
        if ( pause ) return;
        if ( this.getScaleFactor() >= 3 ) {
            // explosion has reached maximum expansion, so remove it
            consumed.add( this );
            // if there is not a token underneath the mine, then set the space to empty
            if ( map[ this.getRow() ][ this.getCol() ] != TOKEN_TILE ) {
                map[ this.getRow() ][ this.getCol() ] = OPEN_TILE;
            }
        } else if ( this.isDetonating() || this.isWithinProximity()
            && this.getScaleFactor() < 3 ) {

            moveToOrigin( this );
            this.setAllMaterial( vec4( 0.85, 0.5 + randFloat() / 2, 0, 1 ) );
            this.setScaleFactor( this.getScaleFactor() * 1.025 );
            this.applyTransform( scalem( 1.025, 1.025, 1.025 ) );
            moveBack( this );

            if ( !this.isTargetHit() && this.isWithinProximity() ) {
                let targetPlayer = this.getTargetPlayer();
                this.hit = true;
                // puts the player in timeout for getting hit by mine
                if ( targetPlayer.isProtected ) {
                    targetPlayer.isProtected = false;
                } else {
                    targetPlayer.startTimeout( time_elapsed );
                    // removes the tokens and re-places them on the map
                    targetPlayer.removeTokens(
                        targetPlayer.decreaseScore( 5 ) );
                }
            }
        } else {    // controls the flickering of the mine
            let rand = randFloat();
            let red = this.owner.color[ 0 ];
            let green = this.owner.color[ 1 ];
            let blue = this.owner.color[ 2 ];

            if ( red >= 1 )
                blue += rand * 0.25;
            else if ( blue >= 1 )
                red += rand * 0.25;
            green += rand * 0.25;

            this.setAllMaterial(
                vec4( red, green, blue, 75 ) );
            this.incrementTicks();
        }
    }
}