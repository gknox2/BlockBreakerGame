import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrBlock, GrBall } from "../for_students/blockobjects.js";
import { createText } from "../libs/CS559-Three/examples/jsm/webxr/Text2D.js";
import { SimpleGroundPlane } from "../libs/CS559-Framework/GroundPlane.js";



let world = new GrWorld({width: 500, height: 640, groundplane: false});


let slidervalue = 0.1;
//slider for changing game speed
let slider = document.getElementById("slider");
slider.addEventListener("input", function() {
    slidervalue = this.value;
});



// Set camera position and look-at target 
world.camera.position.set(-0.5, 5, 15);
world.camera.rotation.set(0, 0, 0); 
world.camera.up.set(0, 1, 0); 
world.camera.lookAt(new T.Vector3(0, 5, 0)); 

//comment this out to be able to use orbit controls
world.camera.matrixAutoUpdate = false;
world.scene.add(world.camera);


let extrudesettings = {
    depth: 1,
    bevelEnabled: false
}

let outerboxpath = new T.Shape();
outerboxpath.moveTo(-4.05,0);
outerboxpath.lineTo(-4.05,10.1);
outerboxpath.lineTo(3.05, 10.1);
outerboxpath.lineTo(3.05,0);
outerboxpath.lineTo(-4.05,0);

let innerboxpath = new T.Path();
innerboxpath.moveTo(-3.95,.1);
innerboxpath.lineTo(-3.95,10);
innerboxpath.lineTo(2.95,10);
innerboxpath.lineTo(2.95,.1);
innerboxpath.lineTo(-3.95,.1);

outerboxpath.holes.push(innerboxpath);

let outerboxshape = new T.ExtrudeGeometry(outerboxpath, extrudesettings);

let outerbox = new T.Mesh(outerboxshape, new T.MeshStandardMaterial({color: "lightblue", roughness: 0.2, metalness: 0.5, side: T.DoubleSide}));

world.scene.add(outerbox);




//skybox
let loader = new T.TextureLoader();
let skybox1 = loader.load("../for_students/skyboxtextures/skybox1.png");
let skybox2 = loader.load("../for_students/skyboxtextures/skybox2.png");
let skybox3 = loader.load("../for_students/skyboxtextures/skybox3.png");
let skybox4 = loader.load("../for_students/skyboxtextures/skybox4.png");
let skybox5 = loader.load("../for_students/skyboxtextures/skybox5.png");
let skybox6 = loader.load("../for_students/skyboxtextures/skybox6.png");



let skyboxmaterials = [
    new T.MeshBasicMaterial({map: skybox4, side: T.DoubleSide}),
    new T.MeshBasicMaterial({map: skybox2, side: T.DoubleSide}),
    new T.MeshBasicMaterial({map: skybox5, side: T.DoubleSide}),
    new T.MeshBasicMaterial({map: skybox6, side: T.DoubleSide}),
    new T.MeshBasicMaterial({map: skybox3, side: T.DoubleSide}),
    new T.MeshBasicMaterial({map: skybox1, side: T.DoubleSide})
]

let skyboxgeometry = new T.BoxGeometry(3000,3000,3000);
let skybox = new T.Mesh(skyboxgeometry, skyboxmaterials);
skybox.rotation.y = Math.PI/2

world.scene.add(skybox);



let gameover = false;

let shooting = false;
let aiming = true;

let roundinprogress = false;
let round = 1;

let usernumballs = 1;
let ballstoshoot = usernumballs;
let ballsonscreen = 0;
let balls = [];
let blocks = [];

let blockhealth;

let health;

let clickx;
let clicky;

let originx = -.5;
let originy = 0;

let aim;
let aimleft;
let aimright;

let gridlist = [];

let ballsGroup = new T.Group();





// updates left and right aiming
document.addEventListener('keydown', function(event) {
    
    if (!roundinprogress && aiming === true) {
        
        if (event.key === 'ArrowLeft') {
            aimleft = true;
            aimright = false;
            updateaim();
        }
        else if (event.key === 'ArrowRight') {
            aimright = true;
            aimleft = false;
            updateaim();
        }
    }

});


//delay between shots
let shootdelay;

// handles the user clicking spacebar to shoot 
document.addEventListener('keyup', function(event) { 
        // shoots if the round isnt already in progress, and the key that was pressed was spacebar
        if (event.key === ' ' && !shooting) {
            
            roundinprogress = true;
            shooting = true;
            
            //shoot a ball every 200 ms
            shootdelay = setInterval(() => {
                if (ballstoshoot > 0) {
                    
                    shootBall();

                    console.log("ball created");
                
                }
                else {
                    clearInterval(shootdelay);
                    shooting = false;
                }
            }, 200); 
            
        }
    
});

// handles the initial trajectory of each ball
function shootBall() {
    let shootangle = Math.atan2(clicky - originy, clickx - originx);
    let shotspeed = slidervalue;
    let dx = Math.cos(shootangle) * shotspeed;
    let dy = Math.sin(shootangle) * shotspeed;

    // shoots until the current number o balls is 0
    if (ballstoshoot > 0) {
        //push a new ball instance to balls, which will be used in each frame to iterate through the list and draw each ball
        balls.push({x: originx, y: originy, dx: dx, dy: dy, onscreen: true});
        console.log("ball created");
        //decrement the balls left to be shot
        ballstoshoot--;
        //increment the balls above y=0
        ballsonscreen++;
    }

    if (ballstoshoot <= 0) {
        clearInterval(shootdelay);
    }
}

// this draws the little bar used to aim with. 
// could be expanded on, the line is ugly
let point1 = new T.Vector3(-.5,0,0);
let point2 = new T.Vector3(-.5,4,0);
let line;
function drawaim() {

    if (line) {
        world.scene.remove(line);
    }
    
    let linegeometry = new T.BufferGeometry().setFromPoints([point1,point2]);


    line = new T.Line(linegeometry, new T.MeshBasicMaterial({color: "white"}));

    world.scene.add(line);
    
    clickx = point2.x;
    clicky = point2.y;

}

// function that is called each time that the user clicks a right or left arrow.
let x = 0;
function updateaim() {
    if (roundinprogress === false) {
        if (aimleft) {
        // speed to move the aimer by
        x -= 0.2;
        if (point2) {
            point2.setX(x);
            drawaim();
        }
        }
        
        else if (aimright) {
            // speed to move the aimer by
            x += 0.2;
            if (point2) {
                point2.setX(x);
            drawaim();
            }
        }
    }
}


/* creates initial 8x7 grid for storing locations of blocks
    can be iterated through to find blocks and their positions.
    important for the removal of blocks
*/
function creategrid() {
    //can access gridlist as gridlist[row][column].x .y .blockhere
    for(let rowi = 0; rowi < 9; rowi++) {
        let rowlist = [];
        for (let columni = 0; columni < 7; columni++) {
            let tempx = -3.5 + columni * 1;
            let tempy = 9 - rowi * 1;
            //push an empty position to the grid.
            rowlist.push({x: tempx, y: tempy, blockhere: false});
        }
        gridlist.push(rowlist);
    }
}


/*  
* This handles the creation of blocks in the top row, it has the logic that determines
* whether a new block is placed in each position in the new row and determines the health of the new block,
* which is dependent on the round/difficulty. 
*/
function createblocksfirstrow(round) {
    let difficulty_blockspawn = round / 45;

    //number of blocks to create in new row
    for(let i = 0; i < 7; i++) {
        let chanceofblockspawn = Math.random() - 0.3 + difficulty_blockspawn;
        blockhealth = round + 1 + (Math.random() - 0.5) * (round / 2); 
        blockhealth = Math.floor(blockhealth);
        if (chanceofblockspawn > 0.5) {
            console.log("new block created at");
            gridlist[0][i].blockhere = true;
            gridlist[0][i].health = blockhealth;
        } 
    
    }
}

/*
* This function does a few important things. First it deletes old block meshes, which stops the browser
* from crashing. Then it iterates through each position in the grid, if the "blockhere" parameter at any
* position is true, then it will create a new block there.
*/
let rowgroups = [];
function drawblocks() {

    // I had the help of chatgpt to fix the issue of my browser crashing from all of the old meshes.
    // It just iterates through and deletes the children(geometries and materials) of the rowgroups that are left over from the last pass of this function.
    for(let i = 0; i< 8; i++) {
        if (rowgroups[i]) {
        for (let child of rowgroups[i].children) {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (child.material.map) {
                    child.material.map.dispose();
                }
                child.material.dispose();
                }
            }
            world.scene.remove(rowgroups[i]);
        }
    }
    rowgroups = [];


    // create a Three.js group for each row
    for (let i = 0; i < 8; i++) {
        rowgroups[i] = new T.Group();
    }

    // This double loop iterates through the grid and creates new blocks at each position
    gridlist.forEach((row, rowindex) => {
        row.forEach((column, columnindex) => {
            if (gridlist[rowindex][columnindex].blockhere === true) {
                let block = new GrBlock({
                    x: gridlist[rowindex][columnindex].x, 

                    ////////////// why does this work and not using gridlist[rowindex][columnindex].y
                    y: 9 - rowindex,


                    health: gridlist[rowindex][columnindex].health
                });
                //create the text that displays the health on each block 
                let text = createText(block.health.toString(),.5);
                text.position.y = 9 - rowindex;
                text.position.z = .51;
                text.position.x = gridlist[rowindex][columnindex].x;

                // don't remember what this line does, seems redundant but I'll leave it
                gridlist[rowindex][columnindex].y = 9 - rowindex;


                //add the new block and the text to the correct rowgroup
                rowgroups[rowindex].add(block.whole_ob, text);
            }
        });
    });
    for (let i = 0; i < 8; i++) {
        world.scene.add(rowgroups[i]);
    }
} 

/*
* This function is called in each frame to move to move each ball. 
* It also handles collisions and removal of old ball meshes.
*/
function updateballs() {
    let newballs = [];

    // same as the removal of the old blocks
    while (ballsGroup.children.length > 0) {
        let child = ballsGroup.children[0];
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
        }
        ballsGroup.remove(ballsGroup.children[0]);

    }
        // Update the position of each ball
        balls.forEach((ball, index) => {
    
            ball.x = ball.x + ball.dx;
            ball.y = ball.y + ball.dy;
           
            //store next position of ball for collision purposes
            let nextx = ball.x + ball.dx;
            let nexty = ball.y + ball.dy;
        
            // makes the ball bounce off the left, right, and top boundaries
            if (ball.x < -3.95 || ball.x > 2.95) {
                ball.dx = -ball.dx;
            }  
            else if (ball.y > 10) {
                ball.dy = - ball.dy;
            }

            
            /* On each frame, this pushes each ball that is still above y = 0 to the 
            *  list of balls that will be used on the next frame.
            */
            if (ball.y >= 0) {


                // accesses each ball based off it's name. 
                // this is necessary because it is hard to locate the current ball.
                let ballmesh = ballsGroup.getObjectByName('ball' + index);
                // if the current ball in balls[] doesnt already have a mesh, create one and add it to the
                // T.group ballsGroup;
                if (!ballmesh) {
                    ballmesh = new GrBall({x: ball.x, y: ball.y}).whole_ob;
                    ballmesh.name = 'ball' + index; //give the ball so that it can be accessed for removal
                    ballsGroup.add(ballmesh);
                }
                ballmesh.x = ball.x;
                ballmesh.y = ball.y;
                newballs.push(ball);
            }
            
            // if the ball isnt above y = 0, then it is below
            // remove the ball
            else {
                let ballmesh = ballsGroup.getObjectByName('ball' + index);
                
                if (ballmesh) {
                    ballsGroup.remove(ballmesh);
                }
                // decrease the number of balls on screen so that we know when the round is over.
                if (ball.onscreen) {
                    ball.onscreen = false;
                    ballsonscreen--;
                    console.log(ballsonscreen);
                    if (ballsonscreen === 0) {
                        nextround();
                    }
                }
                
                
            }
            
            world.scene.add(ballsGroup);

            // the list of balls for the next frame
            balls = newballs;

            // this is all collision handling
            gridlist.forEach((row, rowindex) => {
                row.forEach((block, blockindex) => {
                    if(block.blockhere) {
                        // calculate the boundaries of the block
                        let blockLeft = gridlist[rowindex][blockindex].x - 0.5;
                        let blockRight = gridlist[rowindex][blockindex].x + 0.5;
                        let blockTop = gridlist[rowindex][blockindex].y - 0.5;
                        let blockBottom = gridlist[rowindex][blockindex].y + 0.5;

                        // flip the direction of the ball depending on which side of the block it will hit
                        // decreasing the 0.1 value can stop balls from having irregular bounces, but also allows balls to slip between two blocks
                        if (nextx + 0.1 >= blockLeft && nextx - 0.1 <= blockRight && nexty + 0.1 >= blockTop && nexty - 0.1 <= blockBottom) {
                            if (nextx < blockLeft || nextx > blockRight) {
                                ball.dx = -ball.dx;
                            } 
                            if (nexty < blockTop || nexty > blockBottom) {
                                ball.dy = -ball.dy;
                            }
                            // decrease block health
                            gridlist[rowindex][blockindex].health -= 1;

                            if (gridlist[rowindex][blockindex].health <= 0) {
                                gridlist[rowindex][blockindex].blockhere = false;
                                drawblocks();
                            }
                        
                        }   
                    }
                }); 
        
            });

        



        });

        



    }
    

// when there are no more balls on the screen this is called.
function nextround() {
    //inrement the round
    round++;


    moveblocksdown();
    console.log(round);


    //reset states
    aiming = true;
    shooting = false;
    usernumballs = 1 + round;
    ballstoshoot = usernumballs;
    roundinprogress = false;

}

// after each round, the blocks are moved down one row
function moveblocksdown() {
    /* This was difficult because you need to copy each row into the prior one, starting from the lowest row.
    * The problem was that the way the blocks are accessed is through pointers which I guess makes copying or cloning
    * one array list into another sort of complicated. I don't have a good understanding of the way this works but I didn't want
    * to use another library to handle this.
    */
    for (let i = gridlist.length - 1; i > 0; i--) {
        gridlist[i] = gridlist[i - 1].map(block => ({ ...block }));
    }
    // reset the health and block properties in the first row
    for (let i = 0; i < gridlist[0].length; i++) {
        gridlist[0][i].blockhere = false;
        gridlist[0][i].health = 0;
    }
    // create a new set of blocks in the first row
    createblocksfirstrow(round);
    drawblocks();
}

// haven't managed to get this to work
function gameovermessage() {
    let gameovertext = createText("GAME OVER -_-", 4);
    world.scene.add(gameovertext);

}



let starField;


/*
* This creates the stars that fly past you as you play 
*/
function createstars() {
    let starsGeometry = new T.BufferGeometry();
    let starsMaterial = new T.PointsMaterial({ color: "lightyellow", size:4 });
    let starPositions = [];

    // creates 1000 stars
    for (let i = 0; i < 1000; i++) {
        // random origin location
        let x = T.MathUtils.randFloatSpread(2000);
        let y = T.MathUtils.randFloatSpread(2000);
        let z = T.MathUtils.randFloatSpread(10000);
        starPositions.push(x, y, z);

    }


    starsGeometry.setAttribute('position', new T.Float32BufferAttribute(starPositions, 3));
    starField = new T.Points(starsGeometry, starsMaterial);

    world.scene.add(starField);
    return starField;
}
//create initial stars 
createstars();

//update stars in each frame
function updatestars() {
    let positions = starField.geometry.attributes.position.array;

    for (let i = 0; i < positions.length; i+=3) {
        
        
        //move the z position forward 10 
        positions[i + 2] += 10;

        // if the z position is greater than 10, move it back to -9990
        // this is a better approach as it uses less memory
        if (positions[i+2] > 10) {
            positions[i + 2] -= 10000;
        } 
        starField.geometry.attributes.position.needsUpdate = true;
    }
}

creategrid();
createblocksfirstrow(1);

//main animation loop
function animate() {
    
    if (gameover === false) {

    drawaim();

    updateballs();

    drawblocks();
    
    updatestars();

    }

    gridlist.forEach(row => {
        row.forEach(block => {
            if (block.blockhere && block.y < 1.2) {
                gameover = true;
            } 
        })
    })


    if (gameover === true) {
        
        gameovermessage();
    }
    requestAnimationFrame(animate);
}
animate();



world.go();
