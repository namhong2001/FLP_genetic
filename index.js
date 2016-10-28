/**
 *
 * Created by nh on 16. 9. 20.
 */

"use strict";


const USER_DATA = {
    areaSize: 100,
    boxCount: 5,
    pathWidth: 1,
    relations: [
        [0, 1, 1, 0, 1, 1, 0],
        [0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0]
    ],
    boxSize: [10, 10, 10, 10, 10, 0, 0],
    fitnessMax: 987654321,
    startPos: [50, 0],
    endPos: [50, 100],
    startEndWeight: 5
};

const CONFIG = {
    "iterations": 4000
    , "size": 250
    , "crossover": 0.3
    , "mutation": 0.3
    , "skip": 20
};

var genetic = Genetic.create();

genetic.optimize = Genetic.Optimize.Minimize;
genetic.select1 = Genetic.Select1.Tournament2;
genetic.select2 = Genetic.Select2.Tournament2;

genetic.seed = function () {
    let ret = [];
    for (let i=0; i<this.userData.boxCount; ++i) {
        ret.push(Math.floor(Math.random() * this.userData.areaSize));
        ret.push(Math.floor(Math.random() * this.userData.areaSize));
    }
    return ret;
};

genetic.mutate = function (entity) {
    entity = entity.slice();

    for (let i=0; i<this.userData.boxCount / 2; ++i) {
        let randomIndex = Math.floor(Math.random() * entity.length);
        // let change = Math.floor(Math.random() * 2) ? 1 : -1;
        let change = Math.floor(Math.random() * 10) - 5;
        entity[randomIndex] += change;

        if (entity[randomIndex] > this.userData.areaSize) entity[randomIndex] = this.userData.areaSize;
        if (entity[randomIndex] < 0) entity[randomIndex] = 0;
    }

    return entity;
};

genetic.crossover = function (mother, father) {

    // two-point crossover
    var len = mother.length;
    var ca = Math.floor(Math.random()*len);
    var cb = Math.floor(Math.random()*len);
    if (ca > cb) {
        var tmp = cb;
        cb = ca;
        ca = tmp;
    }

    var son = father.slice(0,ca).concat(mother.slice(ca, cb), father.slice(cb));
    var daughter = mother.slice(0,ca).concat(father.slice(ca, cb), mother.slice(cb));

    if (son.length !== len || daughter.length !== len) {
        console.log(son.length);
        console.log(len);
        throw Error(son.length, len);
    }

    return [son, daughter];
};

genetic.fitness = function (entity) {
    let fitness = 0;
    let boxCount = this.userData.boxCount;
    let nodeNum = this.userData.boxCount + 2;

    entity = entity.slice(0);
    entity[2*boxCount] = this.userData.startPos[0];
    entity[2*boxCount + 1] = this.userData.startPos[1];
    entity[2*(boxCount+1)] = this.userData.endPos[0];
    entity[2*(boxCount+1) + 1] = this.userData.endPos[1];

    for (let i = 0; i < nodeNum; ++i) {
        for (let j = i + 1; j < nodeNum; ++j) {
            if (!isValid.call(this, i, j, entity)) return this.userData.fitnessMax;

            if (this.userData.relations[i][j]) {
                fitness += calDistance.call(this, i, j, entity);
            }
        }
    }

    return fitness;

    function calDistance (index1, index2, entity) {

        let ret;
        let boxSize = this.userData.boxSize;
        let boxCount = this.userData.boxCount;

        let x1_center = entity[2*index1] + boxSize[index1] / 2;
        let y1_center = entity[2*index1 + 1] + boxSize[index1] / 2;
        let x2_center = entity[2*index2] + boxSize[index2] / 2;
        let y2_center = entity[2*index2 + 1] + boxSize[index2]  / 2;
        let x_distance = Math.abs(x1_center - x2_center);
        let y_distance = Math.abs(y1_center - y2_center);


        ret = x_distance + y_distance;
        if (index1 === boxCount || index2 === boxCount || index1 === boxCount + 1 || index2 === boxCount + 1) {
            ret *= this.userData.startEndWeight;
        }

        // eliminate box size
        ret -= boxSize[index1] / 2 + boxSize[index2] / 2;

        // cal detour
        let xMin = Math.min(x1_center, x2_center);
        let xMax = Math.max(x1_center, x2_center);

        let yMin = Math.min(y1_center, y2_center);
        let yMax = Math.max(y1_center, y2_center);

        let detourX = 0;
        let detourY = 0;

        for (let i=0; i < boxCount; ++i) {
            if (i === index1 || i === index2) continue;

            let targetBoxSize = boxSize[i];
            let tXMin = entity[2*i];
            let tYMin = entity[2*i + 1];
            let tXMax = tXMin + targetBoxSize;
            let tYMax = tYMin + targetBoxSize;

            if (xMin > tXMin && xMax < tXMax) {
                let tempXDetour = Math.max(xMin - tXMin, tXMax - xMax) * 2;
                if (tempXDetour > detourX) detourX = tempXDetour;
            }
            if (yMin > tYMin && yMax < tYMax) {
                let tempYDetour = Math.max(yMin - tYMin, tYMax - yMax) * 2;
                if (tempYDetour > detourY) detourY = tempYDetour;
            }
        }

        ret += detourX + detourY;
        return ret;
    }

    function isValid ($1_index, $2_index, entity) {
        let areaSize = this.userData.areaSize;
        let $1_size = this.userData.boxSize[$1_index];
        let $2_size = this.userData.boxSize[$2_index];
        let $1_xpos = entity[$1_index * 2] + $1_size / 2;
        let $1_ypos = entity[$1_index * 2 + 1] + $1_size / 2;
        let $2_xpos = entity[$2_index * 2] + $2_size / 2;
        let $2_ypos = entity[$2_index * 2 + 1] + $2_size / 2;
        let $1_xpos_max = $1_xpos + $1_size;
        let $1_ypos_max = $1_ypos + $1_size;
        let $2_xpos_max = $2_xpos + $2_size;
        let $2_ypos_max = $2_ypos + $2_size;


        let x_dist = Math.abs($1_xpos - $2_xpos);
        let y_dist = Math.abs($1_ypos - $2_ypos);
        let min_dist = $1_size / 2 + $2_size / 2 + this.userData.pathWidth;

        return (x_dist > min_dist || y_dist > min_dist) &&
            $1_xpos_max <= areaSize && $1_ypos_max <= areaSize &&
            $2_xpos_max <= areaSize && $2_ypos_max <= areaSize;
    }

};

// genetic.generation = function (pop, generation, stats) {
//
// };


genetic.notification = function (pop, generation, stats, isFinished) {
    const generationElem = document.getElementById('generation');
    const initialFitnessElem = document.getElementById('initial-fitness');
    const solutionFitnessElem = document.getElementById('solution-fitness');
    generationElem.textContent = generation + 1;
    draw.call(this, pop[0].entity);

    if (generation === 0) {
        initialFitnessElem.textContent = stats.maximum;
    }

    if (isFinished) {
        solutionFitnessElem.textContent = stats.maximum;
    }
};

function draw (gene) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const areaFactor = canvas.width / this.userData.areaSize;
    const startPosX = this.userData.startPos[0]*areaFactor;
    const startPosY = this.userData.startPos[1]*areaFactor;
    const endPosX = this.userData.endPos[0]*areaFactor;
    const endPosY = this.userData.endPos[1]*areaFactor;
    const startEndSize = 5*areaFactor;

    // 먼저 캔버스를 지운다.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < this.userData.boxCount; ++i) {
        let size = this.userData.boxSize[i] * areaFactor;
        let x = gene[2*i] * areaFactor;
        let y = gene[2*i+1] * areaFactor;
        ctx.strokeRect(x, y, size,  size);

        ctx.font = Math.floor(size * 0.7) + "px serif";
        ctx.textBaseline = "top";
        ctx.fillText(i + 1, x, y);
    }
}


document.getElementById('run-button').onclick = function () {
    genetic.evolve(CONFIG, USER_DATA);
};