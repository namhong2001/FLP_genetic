/**
 *
 * Created by nh on 16. 9. 20.
 */

"use strict";

const Genetic = require('genetic-js');

const USER_DATA = {
    areaSize: 100,
    boxCount: 16,
    relations: [
        [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    boxSize: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    fitnessMax: 987654321
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
        60, 60,
        70, 70,
        80, 80,
        90, 90,
        90, 0,
        80, 10,
        70, 20,
        60, 30,
        50, 40,
        40, 50
    ];
};

genetic.mutate = function (entity) {
    entity = entity.slice();
    let randomIndex = Math.floor(Math.random() * entity.length);
    let change = Math.floor(Math.random() * 2) ? 1 : -1;
    entity[randomIndex] += change;

    if (entity[randomIndex] > this.userData.areaSize) entity[randomIndex] = this.userData.areaSize;
    if (entity[randomIndex] < 0) entity[randomIndex] = 0;

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
    for (let i = 0; i < this.userData.boxCount; ++i) {
        for (let j = i + 1; j < this.userData.boxCount; ++j) {

            if (isOverlap(i, j, entity)) return this.userData.fitnessMax;

            if (this.userData.relations[i][j]) {
                fitness += getDistance(i, j, entity);
            }
        }
    }

    return fitness;

    function getDistance ($1_index, $2_index, entity) {
        let $1_xpos = entity[$1_index * 2] + _this.userData.boxSize[$1_index] / 2;
        let $1_ypos = entity[$1_index * 2 + 1] + _this.userData.boxSize[$1_index] / 2;
        let $2_xpos = entity[$2_index * 2] + _this.userData.boxSize[$2_index] / 2;
        let $2_ypos = entity[$2_index * 2 + 1] + _this.userData.boxSize[$2_index] / 2;

        return Math.abs($1_xpos - $2_xpos) + Math.abs($1_ypos - $2_ypos);
    }

    function isOverlap ($1_index, $2_index, entity) {
        let $1_xpos = entity[$1_index * 2] + _this.userData.boxSize[$1_index] / 2;
        let $1_ypos = entity[$1_index * 2 + 1] + _this.userData.boxSize[$1_index] / 2;
        let $2_xpos = entity[$2_index * 2] + _this.userData.boxSize[$2_index] / 2;
        let $2_ypos = entity[$2_index * 2 + 1] + _this.userData.boxSize[$2_index] / 2;

        let x_dist = Math.abs($1_xpos - $2_xpos);
        let y_dist = Math.abs($1_ypos - $2_ypos);
        let overlap_size = _this.userData.boxSize[$1_index] / 2 + _this.userData.boxSize[$2_index] / 2;

        return x_dist < overlap_size && y_dist < overlap_size;
    }
};

// genetic.generation = function (pop, generation, stats) {
//
// };

genetic.notification = function (pop, generation, stats, isFinished) {
    // console.log(generation);
    // console.log(pop[0].entity);

    if (isFinished) {
        console.log(pop[0].entity);
        console.log(stats);
    }
};




genetic.evolve(CONFIG, USER_DATA);