import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrBlock, GrBall } from "../for_students/blockobjects.js";
import { createText } from "../libs/CS559-Three/examples/jsm/webxr/Text2D.js";
import { SimpleGroundPlane } from "../libs/CS559-Framework/GroundPlane.js";



let world = new GrWorld({width: 500, height: 640, groundplane: false});

let slidervalue = 0.1;

let slider = document.getElementById("slider");
slider.addEventListener("input", function() {
    slidervalue = this.value;
});



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

let hoverx;
let hovery;

let clickx;
let clicky;

let originx = -.5;
let originy = 0;

let blockwidth = .67;
let blockheight = .67;

let aim;
let aimleft;
let aimright;

let gridID = {row: "row", column: "column", x: "x", y: "y"};
let gridlist = [];

let row1 = new T.Group();
let row2 = new T.Group();
let row3 = new T.Group();
let row4 = new T.Group();
let row5 = new T.Group();
let row6 = new T.Group();
let row7 = new T.Group();
let row8 = new T.Group();

let ballsGroup = new T.Group();






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

let shootdelay;
//handles shooting


document.addEventListener('keyup', function(event) { 
        
        if (event.key === ' ' && !shooting) {
            
            roundinprogress = true;
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
    let shotspeed = slidervalue;
    let dx = Math.cos(shootangle) * shotspeed;
    let dy = Math.sin(shootangle) * shotspeed;

    if (ballstoshoot > 0) {
        balls.push({x: originx, y: originy, dx: dx, dy: dy, onscreen: true});
        console.log("ball created");
        ballstoshoot--;
        ballsonscreen++;
    }

    if (ballstoshoot <= 0) {
        clearInterval(shootdelay);
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
    if (roundinprogress === false) {
        if (aimleft) {
        x -= 0.2;
        if (point2) {
            point2.setX(x);
            drawaim();
        }
        }
        
        else if (aimright) {
            x += 0.2;
            if (point2) {
                point2.setX(x);
            drawaim();
            }
        }
    }
}

function creategrid() {
    //can access gridlist as gridlist[row][column].x .y .blockhere
    for(let rowi = 0; rowi < 9; rowi++) {
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
let rowgroups = [];
function drawblocks() {
    for(let i = 0; i< 8; i++) {
        if (rowgroups[i]) {
        for (let child of rowgroups[i].children) {
            if (child.geometry) {
                child.geometry.dispose(); // Dispose the geometry
            }
            if (child.material) {
                if (child.material.map) {
                    child.material.map.dispose(); // Dispose the texture
                }
                child.material.dispose(); // Dispose the material
            }
        }
        world.scene.remove(rowgroups[i]);
    }
}
    rowgroups = [];

    for (let i = 0; i < 8; i++) {
        rowgroups[i] = new T.Group();
    }


    gridlist.forEach((row, rowindex) => {
        row.forEach((column, columnindex) => {
            if (gridlist[rowindex][columnindex].blockhere === true) {
                let block = new GrBlock({
                    x: gridlist[rowindex][columnindex].x, 

                    ////////////// why does this work and not using gridlist[rowindex][columnindex]
                    y: 9 - rowindex,


                    health: gridlist[rowindex][columnindex].health
                });
                let text = createText(block.health.toString(),.5);
                text.position.y = 9 - rowindex;
                text.position.z = .51;
                text.position.x = gridlist[rowindex][columnindex].x;


                gridlist[rowindex][columnindex].y = 9 - rowindex;
                rowgroups[rowindex].add(block.whole_ob, text);
            }
        });
    });
    for (let i = 0; i < 8; i++) {
        world.scene.add(rowgroups[i]);
    }
} 


function updateballs() {
    let newballs = [];
    while (ballsGroup.children.length > 0) {
        let child = ballsGroup.children[0];
        if (child.geometry) child.geometry.dispose();  // Dispose of the geometry
        if (child.material) {
            if (child.material.map) child.material.map.dispose(); // Dispose of the material map if it exists
            child.material.dispose(); // Dispose of the material
        }
        ballsGroup.remove(ballsGroup.children[0]);

    }
        balls.forEach((ball, index) => {
    
            ball.x = ball.x + ball.dx;
            ball.y = ball.y + ball.dy;
           
            //store next position of ball for collision purposes
            let nextx = ball.x + ball.dx;
            let nexty = ball.y + ball.dy;
        
            if (ball.x < -3.95 || ball.x > 2.95) {
                ball.dx = -ball.dx;
            }  
            else if (ball.y > 10) {
                ball.dy = - ball.dy;
            }

            
            if (ball.y >= 0) {
                let ballmesh = ballsGroup.getObjectByName('ball' + index);
                if (!ballmesh) {
                    ballmesh = new GrBall({x: ball.x, y: ball.y}).whole_ob;
                    ballmesh.name = 'ball' + index;
                    ballsGroup.add(ballmesh);
                }
                ballmesh.x = ball.x;
                ballmesh.y = ball.y;
                newballs.push(ball);
            }
            else {
                let ballmesh = ballsGroup.getObjectByName('ball' + index);
                if (ballmesh) {
                    ballsGroup.remove(ballmesh);
                }
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
            balls = newballs;

            // this is all collision handling
            gridlist.forEach((row, rowindex) => {
                row.forEach((block, blockindex) => {
                    if(block.blockhere) {
                        // Calculate the boundaries of the block
                        let blockLeft = gridlist[rowindex][blockindex].x - 0.5;
                        let blockRight = gridlist[rowindex][blockindex].x + 0.5;
                        let blockTop = gridlist[rowindex][blockindex].y - 0.5;
                        let blockBottom = gridlist[rowindex][blockindex].y + 0.5;

                        
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
    


function nextround() {
    round++;

    moveblocksdown();
    console.log(round);

    aiming = true;
    shooting = false;
    usernumballs = 1 + round;
    ballstoshoot = usernumballs;
    roundinprogress = false;

}




function moveblocksdown() {
    for (let i = gridlist.length - 1; i > 0; i--) {
        gridlist[i] = gridlist[i - 1].map(block => ({ ...block }));
    }
    for (let i = 0; i < gridlist[0].length; i++) {
        gridlist[0][i].blockhere = false;
        gridlist[0][i].health = 0;
    }
    
    createblocksfirstrow(round);
    drawblocks();
}

function gameovermessage() {
    let gameovertext = createText("GAME OVER -_-", 4);
    world.scene.add(gameovertext);

}

creategrid();
createblocksfirstrow(1);

let starField;

function createstars() {
    let starsGeometry = new T.BufferGeometry();
    let starsMaterial = new T.PointsMaterial({ color: "lightyellow", size:4 });
    let starPositions = [];

    for (let i = 0; i < 1000; i++) {
        //originating place
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
createstars();
function updatestars() {
    let positions = starField.geometry.attributes.position.array;

    for (let i = 0; i < positions.length; i+=3) {
        
        
        //z axis
        positions[i + 2] += 10;

        if (positions[i+2] > 5000) {
            positions[i + 2] -= 10000;
        } 
        starField.geometry.attributes.position.needsUpdate = true;
    }
}


function animate() {
    

    drawaim();

    updateballs();

    drawblocks();
    
    updatestars();


    gridlist.forEach(row => {
        row.forEach(block => {
            if (block.blockhere && block.y < 1.2) {
                let gameover = true;
            } 
        })
    })
    if (gameover === true) {
        //cancelAnimationFrame(animationFrameId);
        cancelAnimationFrame(animate);
        gameovermessage();
    }
    requestAnimationFrame(animate);
}
animate();



world.go();
