/**
 *
 * Created by nh on 16. 9. 20.
 */

"use strict";


const USER_DATA = {
    areaSize: 100,
    boxCount: 6,
    pathWidth: 1,
    relations: [
        [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    boxSize: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    fitnessMax: 987654321,
    startPos: [50, 0],
    endPos: [50, 100],
    startRelations: [1, 0, 0, 0, 0, 0],
    endRelations: [0, 0, 0, 0, 0, 1]
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
    return [
        0, 0,
        10, 10,
        20, 20,
        30, 30,
        40, 40,
        50, 50,
        // 60, 60,
        // 70, 70,
        // 80, 80,
        // 90, 90,
        // 90, 0,
        // 80, 10,
        // 70, 20,
        // 60, 30,
        // 50, 40,
        // 40, 50
    ];
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
    let _this = this;
    let startPosX = this.userData.startPos[0];
    let startPosY = this.userData.startPos[1];
    let endPosX = this.userData.endPos[0];
    let endPosY = this.userData.endPos[1];
    for (let i = 0; i < this.userData.boxCount; ++i) {
        let x1 = entity[2*i];
        let y1 = entity[2*i+1];
        let size1 = this.userData.boxSize[i];

        for (let j = i + 1; j < this.userData.boxCount; ++j) {
            let x2 = entity[2*j];
            let y2 = entity[2*j+1];
            let size2 = this.userData.boxSize[j];


            if (!isValid(i, j, entity)) return this.userData.fitnessMax;

            if (this.userData.relations[i][j]) {
                fitness += getDistance(x1, y1, x2, y2, size1, size2);
            }
        }

        if (this.userData.startRelations[i]) {
            fitness += getDistance(x1, y1, startPosX, startPosY, size1, 0);
        } else if (this.userData.endRelations[i]) {
            fitness += getDistance(x1, y1, endPosX, endPosY, size1, 0);
        }
    }

    return fitness;

    function getDistance (x1, y1, x2, y2, size1, size2) {
        let x1_center = x1 + size1 / 2;
        let y1_center = y1 + size1 / 2;
        let x2_center = x2 + size2 / 2;
        let y2_center = y2 + size2 / 2;

        return Math.abs(x1_center - x2_center) + Math.abs(y1_center - y2_center);
    }

    function isValid ($1_index, $2_index, entity) {
        let $1_xpos = entity[$1_index * 2] + _this.userData.boxSize[$1_index] / 2;
        let $1_ypos = entity[$1_index * 2 + 1] + _this.userData.boxSize[$1_index] / 2;
        let $2_xpos = entity[$2_index * 2] + _this.userData.boxSize[$2_index] / 2;
        let $2_ypos = entity[$2_index * 2 + 1] + _this.userData.boxSize[$2_index] / 2;

        let x_dist = Math.abs($1_xpos - $2_xpos);
        let y_dist = Math.abs($1_ypos - $2_ypos);
        let min_dist = _this.userData.boxSize[$1_index] / 2 +
            _this.userData.boxSize[$2_index] / 2 +
            _this.userData.pathWidth;

        return x_dist > min_dist || y_dist > min_dist;
    }
};

// genetic.generation = function (pop, generation, stats) {
//
// };

genetic.notification = function (pop, generation, stats, isFinished) {
    // console.log(generation);
    // console.log(pop[0].entity);


    const generationElem = document.getElementById('generation');
    const _this = this;
    generationElem.textContent = generation + 1;
    draw(pop[0].entity);

    if (isFinished) {
        console.log(pop[0].entity);
        console.log(stats);
    }



    function draw (gene) {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const areaFactor = canvas.width / _this.userData.areaSize;

        // 먼저 캔버스를 지운다.
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < _this.userData.boxCount; ++i) {
            let size = _this.userData.boxSize[i] * areaFactor;
            let x = gene[2*i] * areaFactor;
            let y = gene[2*i+1] * areaFactor;
            ctx.strokeRect(x, y, size,  size);

            ctx.font = Math.floor(size * 0.7) + "px serif";
            ctx.textBaseline = "top";
            ctx.fillText(i+1, x, y);
        }
    }
};


document.getElementById('run-button').onclick = function () {
    genetic.evolve(CONFIG, USER_DATA);
};