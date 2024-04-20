
import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";

// function for getting the color of the block based off of it's health
function getcolor(health) {
    //normalize health so that the RGB values can't go out of their normal ranges
    let healthnormal = Math.min(Math.max(health / 30, 0), 1)

    //dynamic coloring
    let red = Math.round(255 * healthnormal);
    let green = Math.round(255 * (1 - healthnormal));
    let blue = 128 + Math.round(127 * Math.sin(Math.PI * healthnormal)); 


    return `rgb(${red},${green},${blue})`;

    //rigid coloring
    /*
    if (health <= 3) {
        return 'green';
    }
    if (health > 3 && health <= 7) {
        return 'yellow';
    }
    if (health > 7 && health <= 15) {
        return 'orange';
    }
    if (health > 15 && health <= 20) {
        return 'red';
    }
    if (health > 20 && health <= 30) {
        return 'purple';
    }
    if (health > 30) {
        return 'pink';
    }
    */

}


// basic GrObject class for the block
export class GrBlock extends GrObject {
    constructor(params = {}) {
        
        let blockgeometry = new T.BoxGeometry(0.9,0.9,0.9);
        let color = getcolor(params.health);
        let blockmesh = new T.Mesh(blockgeometry, new T.MeshStandardMaterial({color: color}));


        super("Block", blockmesh);
        this.whole_ob = blockmesh;
        this.whole_ob.position.x = params.x ? Number(params.x) : 0;
        this.whole_ob.position.y = params.y ? Number(params.y) : 0;
        this.whole_ob.position.z = params.z ? Number(params.z) : 0;
        this.health = params.health ? Number(params.health) : 0;
        let scale = params.size ? Number(params.size) : 1;
        this.active = true;
        this.updateColor = function(health) {
            this.whole_ob.material.color.set(getcolor(health));
        }
    }

}

// basic GrObject class for GrBall
export class GrBall extends GrObject {
    constructor(params = {}) {
        let ball = new T.Group();
        let ballgeometry = new T.SphereGeometry(0.1,16,16);

        let ballmesh = new T.Mesh(ballgeometry, new T.MeshStandardMaterial({color: "pink"}));


        ball.add(ballmesh);

        super("Ball", ball);
        this.whole_ob = ball;
        this.whole_ob.position.x = params.x ? Number(params.x) : 0;
        this.whole_ob.position.y = params.y ? Number(params.y) : 0;
        this.whole_ob.position.z = params.z ? Number(params.z) : 0;
        let scale = params.size ? Number(params.size) : 1;

    }

}

