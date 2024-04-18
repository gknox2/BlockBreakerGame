import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrBlock, GrBall } from "../for_students/blockobjects.js";




let world = new GrWorld({width: 500, height: 640});




// Set camera position and look-at target
world.camera.position.set(-0.5, 5, 15);
world.camera.rotation.set(0, 0, 0); // Reset rotation
world.camera.up.set(0, 1, 0); // Set the up vector to be (0, 1, 0)
world.camera.lookAt(new T.Vector3(0, 5, 0)); // Look at the specified target point


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




let shooting = false;
let aiming = true;

let usernumballs = 5;
let ballstoshoot = usernumballs;
let ballsonscreen = 0;
let balls = [];
let blocks = [];

let blockhealth;
let round;

let hoverx;
let hovery;

let clickx;
let clicky;

let originx = -.5;
let originy = 0;

let blockwidth = 1;
let blockheight = 1;

let aim;
let aimleft;
let aimright;

let gridlist = [];
let blockhere = false;
let ballsGroup = new T.Group();
world.scene.add(ballsGroup);

let row1 = new T.Group();






document.addEventListener('keydown', function(event) {
    
    if (aiming === true) {
        
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

let shootdelay;
//handles shooting


document.addEventListener('keyup', function(event) { 
        
        if (event.key === ' ' && !shooting) {
        
            shooting = true;
            
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

function shootBall() {
    let shootangle = Math.atan2(clicky - originy, clickx - originx);
    let shotspeed = 0.05;
    let dx = Math.cos(shootangle) * shotspeed;
    let dy = Math.sin(shootangle) * shotspeed;

    if (ballstoshoot > 0) {
        balls.push({x: originx, y: originy, dx: dx, dy: dy});
        console.log("ball created");
        ballstoshoot--;
        ballsonscreen++;
    }

    if (ballstoshoot <= 0) {
        clearInterval(shootdelay);
        aiming = true;
    }
}


let point1 = new T.Vector3(-.5,0,0);
let point2 = new T.Vector3(-.5,4,0);
let line;
function drawaim() {

    if (line) {
        world.scene.remove(line);
    }
    
    let linegeometry = new T.BufferGeometry().setFromPoints([point1,point2]);


    line = new T.Line(linegeometry, new T.MeshStandardMaterial({color: "white"}));

    world.scene.add(line);
    
    clickx = point2.x;
    clicky = point2.y;

}

let x = 0;
function updateaim() {
    if (aimleft) {
       x -= 0.05;
       if (point2) {
        point2.setX(x);
        drawaim();
       }
    }
    
    else if (aimright) {
        x += 0.05;
        if (point2) {
            point2.setX(x);
           drawaim();
        }
    }
}

function creategrid() {
    //can access gridlist as gridlist[row][column].x .y .blockhere
    for(let rowi = 0; rowi < 8; rowi++) {
        let rowlist = [];
        for (let columni = 0; columni < 7; columni++) {
            let tempx = -3.5 + columni * 1;
            let tempy = 9 - rowi * 1;
            rowlist.push({x: tempx, y: tempy, blockhere: false});
        }
        gridlist.push(rowlist);
    }
}


//spawn blocks
function createblocksfirstrow(round) {
    let difficulty_blockspawn = round / 10;

    //number of blocks to create in new row
    for(let i = 0; i < 7; i++) {
        let chanceofblockspawn = Math.random() + difficulty_blockspawn;
        blockhealth = round + 1 + (Math.random() - 0.5) * (round / 5); 
        if (chanceofblockspawn > 0.5) {
            console.log("new block created at");
            gridlist[0][i].blockhere = true;
            gridlist[0][i].health = blockhealth;
        } 
    }
}

function drawblocks() {
    gridlist.forEach(row => {
        row.forEach(column => {
            if (gridlist[row][column].blockhere === true) {
                let block = new GrBlock({x: gridlist[row][column].x, y: gridlist[row][column].y, health: gridlist[row][column].health});
                row1.add(block);

            }
            
        });
    });
} 


function removeblock(row, column) {

} 

function updateBalls() {
    balls.forEach((ball, index) => {
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Boundary collisions
        if (ball.x < -4 || ball.x > 4 || ball.y < 0 || ball.y > 10) {
            ball.dy = -ball.dy; // Basic reaction, reverse y direction
            ball.dx = -ball.dx; // Reverse x direction if it hits side walls
        }

        // Collision with blocks
        gridlist.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                if (cell.block && Math.abs(ball.x - cell.x) < 0.45 && Math.abs(ball.y - cell.y) < 0.45) {
                    // Assuming block size for simple collision detection
                    removeblock(rowIndex, columnIndex); // Remove block on hit
                    ball.dy = -ball.dy; // Reflect the ball
                }
            });
        });

        // Update visual position
        let ballMesh = ballsGroup.children[index];
        if (ballMesh) {
            ballMesh.position.set(ball.x, ball.y, 0);
        } else {
            let newBall = new GrBall({x: ball.x, y: ball.y});
            ballsGroup.add(newBall.whole_ob);
        }
    });

    // Remove balls that are out of bounds
    balls = balls.filter(ball => ball.y > 0 && ball.y < 10);
}


creategrid();
createblocksfirstrow(1);  // Starting with round 1
drawblocks(); // Draw initial blocks


function animate() {
    updateBalls(); // Move and draw balls, handle collisions
    drawblocks();
    requestAnimationFrame(animate);
}
animate();



world.go();
