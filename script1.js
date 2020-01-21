var plan1 = document.getElementById("plan1");
var plan2 = document.getElementById("plan2");
var plan4 = document.getElementById("plan4");
var plan_speak = document.getElementById("plan_speak");
var go_btn =  document.getElementById("input_submit");
var start_form = document.getElementById("form_wrapper");
var main_canvas = document.getElementById("main_canvas");

//default
var chosen_plan = plan1;
plan1.style.border = '3px solid #002366';

plan1.addEventListener("click", function () {
    chosen_plan = plan1;

    plan1.style.border = '3px solid #002366';
    plan2.style.border = 'none';
    plan4.style.border = 'none';
    plan_speak.style.border = 'none';
});

plan2.addEventListener("click", function () {
    chosen_plan = plan2;

    plan1.style.border = 'none';
    plan2.style.border = '3px solid #002366';
    plan4.style.border = 'none';
    plan_speak.style.border = 'none';
});

plan4.addEventListener("click", function () {
    chosen_plan = plan4;

    plan1.style.border = 'none';
    plan2.style.border = 'none';
    plan4.style.border = '3px solid #002366';
    plan_speak.style.border = 'none';
});

plan_speak.addEventListener("click", function () {
    chosen_plan = plan_speak;

    plan1.style.border = 'none';
    plan2.style.border = 'none';
    plan4.style.border = 'none';
    plan_speak.style.border = '3px solid #002366';
});

go_btn.addEventListener("click", function () {
    start_form.style.display = 'none';
    main_canvas.style.display = 'block';
    start_amp();
});

var start_amp = function () {
    'use strict';
    var boardArray = new Array();

    var soundAllowed = function (stream) {
        window.persistAudioStream = stream;
        var audioContent = new AudioContext();
        var audioStream = audioContent.createMediaStreamSource(stream);
        var analyser = audioContent.createAnalyser();
        audioStream.connect(analyser);
        analyser.fftSize = 2048;

        var frequencyArray = new Uint8Array(analyser.frequencyBinCount);

        var doDraw = function () {
            requestAnimationFrame(doDraw);
            analyser.getByteTimeDomainData(frequencyArray);

            var max = 0;
            for (var i = 0; i < frequencyArray.length; i++) {
                if (max < frequencyArray[i]) {
                    max = frequencyArray[i];
                }
            }

            boardArray.push(max);
            if (boardArray.length >= document.body.clientWidth - 100) {
                boardArray.shift();
            }

            draw(boardArray);
        }
        doDraw();
    }

    var soundNotAllowed = function (error) {
        alert('You must allow microphone access');
        console.log(error);
    }

    navigator.getUserMedia({ audio: true }, soundAllowed, soundNotAllowed);
}

/**
 * Filters the AudioBuffer retrieved from an external source
 * @param {AudioBuffer} audioBuffer the AudioBuffer from drawAudio()
 * @returns {Array} an array of floating point numbers
 */
const filterData = audioBuffer => {
    const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
    const samples = 70; // Number of samples we want to have in our final data set
    const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
    const filteredData = [];
    for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i; // the location of the first sample in the block
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
            sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
        }
        filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }
    return filteredData;
};

/**
 * Normalizes the audio data to make a cleaner illustration 
 * @param {Array} filteredData the data from filterData()
 * @returns {Array} an normalized array of floating point numbers
 */
const normalizeData = filteredData => {
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    return filteredData.map(n => n * multiplier);
}

const dataToCanvas = filteredData => {
    const newData = [];

    for (let i = 0; i < filteredData.length; i++) {
        newData.push(document.body.clientHeight - (filteredData[i] / 255) * document.body.clientHeight);
    }

    return newData;
}


/**
 * Draws the audio file into a canvas element.
 * @param {Array} normalizedData The filtered array returned from filterData()
 * @returns {Array} a normalized array of data
 */
const draw = normalizedData => {
    // set up the canvas
    const canvas = document.querySelector("canvas");
    const dpr = window.devicePixelRatio || 1;
    const padding = 20;

    canvas.width = document.body.clientWidth - 100;
    canvas.height = document.body.clientHeight;

    const ctx = canvas.getContext("2d");
    //ctx.clearRect(0, 0, canvas.width, canvas.height);

    newData = dataToCanvas(normalizedData);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#65b042";
    ctx.beginPath();
    //ctx.moveTo(0,canvas.height);
    //ctx.lineTo(canvas.width,canvas.height);
    ctx.moveTo(0, newData[0]);
    for (let i = 0; i < newData.length; i++) {
        ctx.lineTo(i, newData[i]);

        if (i%100 == 0) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i,400);
            ctx.moveTo(i, newData[i]);
        }
    }
    ctx.stroke();
};

/**
 * A utility function for drawing our line segments
 * @param {AudioContext} ctx the audio context 
 * @param {number} x  the x coordinate of the beginning of the line segment
 * @param {number} height the desired height of the line segment
 * @param {number} width the desired width of the line segment
 * @param {boolean} isEven whether or not the segmented is even-numbered
 */
const drawLineSegment = (ctx, x, height, width, isEven) => {
    ctx.lineWidth = 1; // how thick the line is
    ctx.strokeStyle = "#444"; // what color our line is
    ctx.beginPath();
    height = isEven ? height : -height;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.arc(x + width / 2, height, width / 2, Math.PI, 0, isEven);
    ctx.lineTo(x + width, 0);
    ctx.stroke();
};