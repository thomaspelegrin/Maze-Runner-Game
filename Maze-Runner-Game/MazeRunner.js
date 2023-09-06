let canvas;
let gl;
let program;
let textures = [];
let imagesToLoad = 5;
let numWalls = 0;

let left;
let right;
let ytop;
let bottom;

let near;
let far;
let theta;
let phi;

let eye;
let at;
let modelViewMatrix;
let projectionMatrix;

let up = vec3( 0.0, 1.0, 0.0 );
let uniformModelView, uniformProjection;
let lightDiffuse =
    [ vec4( 1.0, 0.0, 0.0, 1.0 ), vec4( 0.0, 0.0, 1.0, 1.0 ) ];
let lightAmbient =
    [ vec4( 0.3, 0.3, 0.3, 1.0 ), vec4( 0.3, 0.3, 0.3, 1.0 ) ];
let lightSpecular =
    [ vec4( 1.0, 0.5, 0.5, 1.0 ), vec4( 0.5, 0.5, 1.0, 1.0 ) ];
let lightPosition =
    [ vec4( -28.0, 10, -28.0, 0.0 ), vec4( 28.0, 10, 28.0, 0.0 ) ];

let map_generation_factor_1 = 3;
let map_generation_factor_2 = 4;
let order = [ 1, -1 ];

let hero;
let villain;
let models;
let models_map;
let consumed;
let map;
let pause;
let floor;
let game_over;
let difficulty;
let time_elapsed;
let texCount;

let TEXTURE_SIZE = 512;
let CAMERA_ROTATION = 5.0 * Math.PI / 180;      // for HTML buttons
let COIN_BOUNCE_STEP = 0.005;
let OFFSET = 20;
let CAMERA_RADIUS = 1.0;

let OPEN_TILE = 0;
let WALL_TILE = 1;
let TOKEN_TILE = 2;
let MONEY_POWERUP_TILE = 3;
let SHOE_POWERUP_TILE = 4;
let SHIELD_POWERUP_TILE = 5;
let MYSTERY_POWERUP_TILE = 6;
let VILLAIN_TILE = 10;
let HERO_TILE = 11;
let MINE_TILE = 15;

/** Initialization of WebGL
 */
function init() {
    //Get graphics context
    let canvas = document.getElementById( "gl-canvas" );
    let options = {  // no need for alpha channel, but note depth buffer enabling
        alpha: false,
        depth: true  //NOTE THIS
    };
    gl = canvas.getContext( "webgl2", options );
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    //Load shaders
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //set up uniform variables
    uniformModelView = gl.getUniformLocation( program, "u_modelViewMatrix" );
    uniformProjection = gl.getUniformLocation( program, "u_projectionMatrix" );
    document.onkeydown = function ( ev ) { keydown( ev ); };

    texCount = 0;
    loadTextures();

    //set up screen
    gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
    gl.clearColor( 0.2, 0.2, 0.2, 1 );

    //Enable depth testing    
    gl.enable( gl.DEPTH_TEST );
    gl.depthFunc( gl.LEQUAL );
    gl.enable( gl.POLYGON_OFFSET_FILL );
    gl.polygonOffset( 1.0, 2.0 );

    newGame();
    pause = false;
    draw();
    pause = true;
}

/** Starts a new game
 */
function newGame() {
    map = Array( 21 ).fill( WALL_TILE ).map( () => Array( 21 ) );
    models_map = new Map();
    consumed = new Set();
    models = [];
    time_elapsed = 0;

    phi = degToRad( 90 );
    theta = degToRad( 30 );

    near = -28;
    far = 100;
    left = -10;
    right = 10;
    ytop = 10;
    bottom = -10;

    difficulty = document.getElementById( 'difficulty' ).options[
        document.getElementById( 'difficulty' ).selectedIndex ].value;
    console.log( "Game starting..." );
    floor = new Shape(
        createRectangleVertices( 2 ), null, null, 0, mult(
            rotateX( 90 ), scalem( OFFSET - 1, OFFSET - 1, 1 ) ) );
    floor.setAllMaterial( vec4( 0.70, 0.60, 0.65, 1 ) );
    models.push( floor );
    console.log( " - added floor" );
    generateMap();
    console.log( " - map generated" );
    addPlayers();
    console.log( " - added players" );
    addTokens();
    console.log( " - added tokens" );
    addPowerUps();
    console.log( " - added power ups" );
    setupButtons();     // sets up the HTML buttons
    console.log( "Game loaded." );
    printMapPattern();

    game_over = false;
    pause = true;
}

/** Prints out the game ending message
 */
function gameOver() {
    game_over = true;
    let result = hero.getScore() > villain.getScore() ? "win!" : "lose!";
    console.log( "Game over! You " + result );
}

/** Draws shapes and meshes
 */
function draw() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    let currTexture = 0;
    let activeTexture = -1;
    getView();          // sets up the eye, at, modelView, projection
    gl.uniformMatrix4fv( uniformProjection, false,
        flatten( projectionMatrix ) );

    for ( let i = 0; i < models.length; i++ ) {
        // if token, powerup, or mine has been used, don't do anything
        if ( consumed.has( models[ i ] ) ) continue;

        gl.uniformMatrix4fv( uniformModelView, false,
            flatten( mult( modelViewMatrix, models[ i ].getTransform() ) ) );
        if ( !game_over ) {
            //gets texture for current model and animates model
            currTexture = animate( models[ i ] );
            if ( currTexture != activeTexture ) {
                activeTexture = currTexture;
                gl.uniform1i( gl.getUniformLocation( program, "u_textureMap" ), currTexture );
            }
            drawVertexObject( models[ i ] );
        } else {
            pause = true;
            activeTexture = currTexture;
            gl.uniform1i( gl.getUniformLocation( program, "u_textureMap" ), currTexture );
            drawVertexObject( models[ i ] );
        }
    }

    if ( !pause ) {
        time_elapsed++;
        requestAnimationFrame( draw );
    }
}

/** Performs the animation for a model, if it has one, and returns texture num
 * @param model - the model you are wanting to animate
 * @return the texture number for this model
 */
function animate( model ) {
    switch ( true ) {
        case model == floor: return 0;
        case model instanceof Shape: return 1;
        case model instanceof Token: model.tokenAnimation(); return 3;
        case model instanceof PowerUp: model.powerUpAnimation(); return 5;
        case model instanceof Mine: model.mineAnimation();
            return model.isDetonating() ? 2 : 6;
        // changes texture when detonating
        case model instanceof ComputerPlayer:
            model.protectedAnimation();
            if ( time_elapsed % difficulty == 0 && !pause ) {
                model.move();
            }
            return 3;
        case model instanceof Player && !( model instanceof ComputerPlayer ): model.protectedAnimation(); return 4;
        default: return 0;
    }
}

/*============================================================================*/
/*============================== Game Setup ==================================*/
/*============================================================================*/

/** Adds power up meshes to the map
 */
function addPowerUps() {
    let powerUp;
    let rand;
    let skipRow = 0;

    for ( let i = 1; i < map.length - 1; i++ ) {
        for ( let k = 1; k < map[ i ].length - 1; k++ ) {
            if ( map[ i ][ k ] == OPEN_TILE && randInt() % 20 == 0 ) {
                rand = randInt() % 4;        // 0 1 2 3
                switch ( rand ) {
                    case 0: powerUp = new MoneyBagPowerUp( i, k ); break;
                    case 1: powerUp = new ShoePowerUp( i, k ); break;
                    case 2: powerUp = new ShieldPowerUp( i, k ); break;
                    case 3: powerUp = new MysteryPowerUp( i, k ); break;
                }
                map[ i ][ k ] = rand + MONEY_POWERUP_TILE; // marks a power-up
                models.push( powerUp );
                models_map.set( [ i, k ].toString(), powerUp );
                k += 2;                 // to spread out power ups more
                skipRow++;
            }
        }
        i += skipRow;               // helps to spread out power-ups
    }
}

/** Adds the tokens to the map
 */
function addTokens() {
    let token;

    for ( let i = 1; i < map.length - 1; i++ ) {
        for ( let k = 1; k < map[ i ].length - 1; k++ ) {
            if ( map[ i ][ k ] == 0 && randInt() % 7 == 0 ) {
                token = new Token( i, k );
                models_map.set( ( [ i, k ] ).toString(), token );
                models.push( token );
                map[ i ][ k ] = TOKEN_TILE; // marks a token in the array
                k++;                        // helps to srpead out coins more
            }
        }
    }
}

/** Adds the players to the map
 */
function addPlayers() {
    let FIRST_ROW = 1;
    let LAST_ROW = 19;
    let isHeroAdded = false;
    let isVillainAdded = false;

    for ( let col = FIRST_ROW;
        col <= 21 && !( isHeroAdded && isVillainAdded ); col++ ) {
        if ( !isVillainAdded && map[ FIRST_ROW ][ col ] == 0 ) {
            villain = new ComputerPlayer( FIRST_ROW, col );
            villain.orientation = 180;
            models.push( villain );
            map[ FIRST_ROW ][ col ] = 10;   // marks the enemy
            isVillainAdded = true;
        }
        if ( !isHeroAdded && map[ LAST_ROW ][ LAST_ROW - col + 1 ] == 0 ) {
            hero = new Player( knight_mesh, LAST_ROW, LAST_ROW - col + 1, 0.75,
                mult( scalem( .5, .5, .5 ), rotateY( 180 ) ),
                vec4( 0, 0.2, 1, 1 ) );
            hero.orientation = 0;
            hero.texture_flag = true;
            models.push( hero );
            map[ LAST_ROW ][ LAST_ROW - col + 1 ] = 11;  // marks hero
            isHeroAdded = true;
        }
    }
    if ( !isHeroAdded && !isVillainAdded ) {
        newGame();
        console.log( "No valid player spots. Reinitializing map..." );
    }
}

/*===========================================================================*/
/*============================= Map generation ==============================*/
/*===========================================================================*/

/** Creates the walls that are need for the map
 */
function generateWalls() {
    let wall;

    for ( let i = 0; i < map.length; i++ ) {
        for ( let k = 0; k < map[ i ].length; k++ ) {
            if ( map[ i ][ k ] == 1 ) {
                wall = new Shape( createCubeVertices( 2 ), i, k, 1, mat4() );
                wall.setAllMaterial( vec4( 0.1, 0.1, 0.1, 5 ) );
                models.push( wall );
                numWalls++;
            }
        }
    }
}

/** Generates the borders surrounding the map and randomly generates the rest
 */
function generateMap() {
    for ( let i = 0; i < map.length; i++ ) {
        for ( let k = 0; k < map[ i ].length; k++ ) {
            map[ i ][ k ] = WALL_TILE;
        }
    }
    // picks a random spot to start generating the map's pattern
    generateMapPattern(
        randInt() % ( map.length - 2 ) + 1,
        randInt() % ( map.length - 2 ) + 1 );
    generateWalls();
}

/** Recursively randomly generate a map pattern 
 * @param row - the row of the 2D array
 * @param col - the column of the 2D array
 */
function generateMapPattern( row, col ) {
    if ( row < 1 || row > map.length - 2
        || col < 1 || col > row > map.length - 2
        || map[ row ][ col ] == OPEN_TILE ) {
        return;
    }
    map[ row ][ col ] = OPEN_TILE;

    /** Helps to add a bit more randomnous to the map
     */
    if ( randInt() % map_generation_factor_1 == 0 ) {
        let rand = randInt() % 2;
        switch ( rand ) {
            case 0: generateMapPattern( row, col - 1 ); break;
            case 1: generateMapPattern( row + 1, col ); break;
        }
    }
    if ( randInt() % map_generation_factor_2 == 0 ) {
        let rand = randInt() % 2;
        switch ( rand ) {
            case 0: generateMapPattern( row + 1, col ); break;
            case 1: generateMapPattern( row, col - 1 ); break;
        }
    }
    /* Adds tiles that do not already have a path connected to them */
    let possiblePathTiles = getNextPossiblePathTile( row, col );

    /* Randomly selects one or two tiles that have yet to have a path built
     */
    if ( possiblePathTiles.length > 0 ) {
        let nextTile1 = randInt() % possiblePathTiles.length;
        nextTile1 = nextTile1 % 2 == 1 ? nextTile1 - 1 : nextTile1;
        generateMapPattern( possiblePathTiles[ nextTile1 ],
            possiblePathTiles[ nextTile1 + 1 ] );

        let nextTile2 = randInt() % possiblePathTiles.length;
        if ( nextTile1 != nextTile2 ) {
            nextTile2 = nextTile2 % 2 == 1 ? nextTile2 - 1 : nextTile2;
            generateMapPattern( possiblePathTiles[ nextTile2 ], possiblePathTiles[ nextTile2 + 1 ] );
        }
    }
}

/** Returns a list of the next possible tiles
 * @param row - the tile row in the array
 * @param col - the tile col in the array
 * @return a list of the next possible tiles
 */
function getNextPossiblePathTile( row, col ) {
    let threeNeighborTiles = [];

    for ( let i = 0; i < 2; i++ ) {
        if ( adjacentTileCount( row + order[ i ], col ) >= 3 ) {
            generateMapPattern( row + order[ i ], col );
            threeNeighborTiles.push( row + order[ i ] );
            threeNeighborTiles.push( col );
        }
        if ( adjacentTileCount( row, col + order[ i ] ) >= 3 ) {
            generateMapPattern( row, col + order[ i ] );
            threeNeighborTiles.push( row );
            threeNeighborTiles.push( col + order[ i ] );
        }
    }
    return threeNeighborTiles;
}

/** Helper function that returns the number of neighboring walls
 * @param row - the row of the wall
 * @param col - of the wall
 * @returns the number of neighboring walls
 */
function adjacentTileCount( row, col ) {
    let count = 0;
    if ( row < map.length - 1 && map[ row + 1 ][ col ] == 1 ) count++;
    if ( col < map.length - 1 && map[ row ][ col + 1 ] == 1 ) count++;
    if ( row > 0 && map[ row - 1 ][ col ] == 1 ) count++;
    if ( col > 0 && map[ row ][ col - 1 ] == 1 ) count++;
    return count;
}

/*===========================================================================*/
/*============================= Program Setup ===============================*/
/*===========================================================================*/

/** Sets up a texture
 */
function configureTexture( image ) {
    texture = gl.createTexture();
    gl.activeTexture( gl.TEXTURE0 + texCount++ );  // 0 active by default
    gl.bindTexture( gl.TEXTURE_2D, texture );

    //Flip the Y values to match the WebGL coordinates
    gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

    //Specify the image as a texture array: Note different version of function
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, TEXTURE_SIZE, TEXTURE_SIZE, 0, gl.RGB, gl.UNSIGNED_BYTE, image );

    //Set filters and parameters
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    textures.push[ texture ];
}

/** Draws the vertex object model
 * @param model - the model you you want to draw
 */
function drawVertexObject( model ) {
    gl.uniform1f( gl.getUniformLocation( program, "shininess" ),
        model.getMaterialShininess() );

    gl.uniform4fv( gl.getUniformLocation( program, "ambientProduct" ),
        flatten( mult( lightAmbient[ 0 ], model.getMaterialAmbient() ) ) );
    gl.uniform4fv( gl.getUniformLocation( program, "ambientProduct2" ),
        flatten( mult( lightAmbient[ 1 ], model.getMaterialAmbient() ) ) );

    gl.uniform4fv( gl.getUniformLocation( program, "diffuseProduct" ),
        flatten( mult( lightDiffuse[ 0 ], model.getMaterialDiffuse() ) ) );
    gl.uniform4fv( gl.getUniformLocation( program, "diffuseProduct2" ),
        flatten( mult( lightDiffuse[ 1 ], model.getMaterialDiffuse() ) ) );

    gl.uniform4fv( gl.getUniformLocation( program, "specularProduct" ),
        flatten( mult( lightSpecular[ 0 ],
            model.getMaterialSpecular() ) ) );
    gl.uniform4fv( gl.getUniformLocation( program, "specularProduct2" ),
        flatten( mult( lightSpecular[ 1 ],
            model.getMaterialSpecular() ) ) );

    gl.uniform4fv( gl.getUniformLocation( program, "lightPosition" ),
        flatten( lightPosition[ 0 ] ) );
    gl.uniform4fv( gl.getUniformLocation( program, "lightPosition2" ),
        flatten( lightPosition[ 1 ] ) );

    gl.bindVertexArray( model.getVAO() );
    gl.drawElements( gl.TRIANGLES, model.getIndices().length,
        gl.UNSIGNED_SHORT, 0 );
}

/** Sets up a vertex array object
 * @param model - the model object 
 */
function setUpVertexObject( model ) {
    // creates a vertex array object and links it to the model
    gl.bindVertexArray( model.setVAO( gl.createVertexArray() ) );

    // set up index buffer, if using
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer() );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array( model.getIndices() ), gl.STREAM_DRAW );

    //set up vertices buffer
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
    gl.bufferData( gl.ARRAY_BUFFER,
        flatten( model.getCoords() ), gl.STREAM_DRAW );

    let attributeCoords = gl.getAttribLocation( program, "a_coords" );
    gl.vertexAttribPointer( attributeCoords, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( attributeCoords );

    //set up normals buffer
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
    gl.bufferData( gl.ARRAY_BUFFER,
        flatten( model.getNormals() ), gl.STREAM_DRAW );

    // sets up another 3rd buffer    
    let attributeNormals = gl.getAttribLocation( program, "a_normals" );
    gl.vertexAttribPointer( attributeNormals, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( attributeNormals );

    // sets up the texture buffer if the the model has texturing enabled
    if ( model.isTextureEnabled() ) {
        gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
        gl.bufferData( gl.ARRAY_BUFFER,
            flatten( model.getTexCoords() ), gl.STATIC_DRAW );

        let texCoordLoc = gl.getAttribLocation( program, "a_texCoord" );
        gl.vertexAttribPointer( texCoordLoc, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( texCoordLoc );
    }
    //finalize the vao; not required, but considered good practice
    gl.bindVertexArray( null );
}

/** Changes the camera angle according to the arrow key pressed
 * @param arrowKey key code for the arrow pressed
 */
function cameraAngle( arrowKey ) {
    switch ( arrowKey ) {
        case 37: phi += degToRad( 5 ); phi %= 6.28; break;
        case 38: theta += degToRad( 5 ); theta %= 6.28; break;
        case 39: phi -= degToRad( 5 ); phi %= 6.28; break;
        case 40: theta -= degToRad( 5 ); theta %= 6.28; break;
    }
}

/** Sets up the variables needed to view the map
 */
function getView() {
    let eyeX;
    let eyeY;
    let eyeZ;

    if ( isOverhead() ) {
        eyeX = CAMERA_RADIUS * Math.sin( degToRad( 80 ) )
            * Math.cos( degToRad( 90 ) );
        eyeY = CAMERA_RADIUS * Math.sin( degToRad( 80 ) )
            * Math.sin( degToRad( 90 ) );
        eyeZ = CAMERA_RADIUS * Math.cos( degToRad( 80 ) );
        at = vec3( 0.0, 0.0, 0.0 );
        projectionMatrix = ortho( -21, 21, -21, 21, near, far );
    } else {
        // these two if statements prevent an error where the value 
        // could be so small that it lookAt would return NaN
        if ( Math.abs( theta ) < 0.001 )
            theta = degToRad( 1 );
        if ( Math.abs( phi ) < 0.001 )
            phi = degToRad( 1 );
        eyeX = hero.getX() + 1 * Math.sin( theta ) * Math.cos( phi );
        eyeY = 3.0 + 1 * Math.sin( theta ) * Math.sin( phi );
        eyeZ = hero.getZ() + 1 * Math.sin( theta );
        at = vec3( hero.getX(), 1, hero.getZ() );
        projectionMatrix = ortho( left, right, bottom, ytop, near, far );
    }
    eye = vec3( eyeX, eyeY, eyeZ );
    modelViewMatrix = lookAt( eye, at, up )
}

/** Setsup the key buttons
 * @param event -  the keyevent 
 * @returns the - code 
 */
function keydown( event ) {
    switch ( event.keyCode ) {
        // space bar
        case 32: hero.dropMine(); break;
        // arrow keys
        case 37: case 38: case 39: case 40: cameraAngle( event.keyCode );
            if ( pause ) draw(); break;
        // WASD keys
        case 87: case 65: case 83: case 68: if ( !pause && !game_over )
            hero.movePlayer( String.fromCharCode( event.keyCode ) ); break;
        // P key
        case 80: pause = !pause; if ( !pause && !game_over ) draw(); break;
        case 84:
            hero.changeMesh( mesh, scalem( 4, 4, 4 ) );
            villain.changeMesh( mesh, scalem( 4, 4, 4 ) );
            break;
        // unknown key
        default: console.log( "Not a valid key!" ); // key not valid
    }
}

/** Returns true if the view is overhead
 * @returns true if the view is overhead
 */
function isOverhead() {
    return document.getElementById( "Overhead" ).innerHTML != "Overhead View";
}

/** Links and setup the HTML buttons
 */
function setupButtons() {
    scores.innerHTML = 'Player: ' + hero.getScore() +
        ', Computer: ' + villain.getScore();

    document.getElementById( "Start" ).onclick =
        function () { if ( pause ) { pause = false; draw(); } };
    document.getElementById( "zoomIn" ).onclick =
        function () {
            ytop *= 0.9; bottom *= 0.9;
            left *= 0.9; right *= 0.9; draw();
        };
    document.getElementById( "zoomOut" ).onclick =
        function () {
            ytop *= 1.1; bottom *= 1.1;
            left *= 1.1; right *= 1.1; draw();
        };
    document.getElementById( "cameraLeft" ).onclick =
        function () { left -= 1.0; right -= 1.0; draw(); };
    document.getElementById( "cameraRight" ).onclick =
        function () { left += 1.0; right += 1.0; draw(); };
    document.getElementById( "cameraUp" ).onclick =
        function () { ytop += 1.0; bottom += 1.0; draw(); };
    document.getElementById( "cameraDown" ).onclick =
        function () { ytop -= 1.0; bottom -= 1.0; draw(); };
    document.getElementById( "NewGame" ).onclick =
        function () { newGame(); draw(); };
    document.getElementById( "Overhead" ).onclick =
        function () { document.getElementById( "Overhead" ).innerHTML = isOverhead() ? "Overhead View" : "Back to Player"; draw(); };
}

/** Loads all of the textures
 */
function loadTextures() {
    let floorImage = new Image();    // 0
    floorImage.src = document.getElementById( "floorImage" ).src;
    floorImage.onload = function () { configureTexture( floorImage ); draw(); };

    let wallimage = new Image();    // 1
    wallimage.src = document.getElementById( "wallImage" ).src;
    wallimage.onload = function () { configureTexture( wallimage ); draw(); };

    let fireimage = new Image();    // 2
    fireimage.src = document.getElementById( "fireImage" ).src;
    fireimage.onload = function () { configureTexture( fireimage ); draw(); };

    let tokenImg = new Image();    // 3
    tokenImg.src = document.getElementById( "token" ).src;
    tokenImg.onload = function () { configureTexture( tokenImg ); draw(); };

    let playerImg = new Image();     // 4
    playerImg.src = document.getElementById( "player" ).src;
    playerImg.onload = function () { configureTexture( playerImg ); draw(); };

    let powerupImg = new Image();     // 5
    powerupImg.src = document.getElementById( "powerup" ).src;
    powerupImg.onload = function () { configureTexture( powerupImg ); draw(); };

    let mineImg = new Image();     // 6
    mineImg.src = document.getElementById( "mine" ).src;
    mineImg.onload = function () { configureTexture( mineImg ); draw(); };
}