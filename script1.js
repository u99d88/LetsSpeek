var chosen_plan = 1;
plan1.style.border = '3px solid #002366';

$("#plan1").click(function () {
    chosen_plan = 1;

    plan1.style.border = '3px solid #002366';
    plan2.style.border = 'none';
    plan4.style.border = 'none';
    plan_speak.style.border = 'none';
});

$("#plan2").click(function () {
    chosen_plan = 2;

    plan1.style.border = 'none';
    plan2.style.border = '3px solid #002366';
    plan4.style.border = 'none';
    plan_speak.style.border = 'none';
});

$("#plan4").click(function () {
    chosen_plan = 4;

    plan1.style.border = 'none';
    plan2.style.border = 'none';
    plan4.style.border = '3px solid #002366';
    plan_speak.style.border = 'none';
});

$("#plan_speak").click(function () {
    chosen_plan = 0;

    plan1.style.border = 'none';
    plan2.style.border = 'none';
    plan4.style.border = 'none';
    plan_speak.style.border = '3px solid #002366';
});

$("#input_submit").click(function () {
    $("#form_wrapper").hide();
    $("#main_canvas").show();
    start_amp();
});

var start_amp = function () {
    'use strict';
    var boardArray = new Array();
    var totalSamples = 0;

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

            totalSamples += 1;
            if (totalSamples == 60)
            {
                totalSamples = 0;
            }

            boardArray.push([max, totalSamples == 0]);
            if (boardArray.length >= document.body.clientWidth - 100) {
                boardArray.shift();
            }

            draw(boardArray);
        }
        doDraw();
    }

    var soundNotAllowed = function (error) {
        alert('Please check your microphone connectivity and allow this site to access it');
        console.log(error);
    }

    navigator.getUserMedia({ audio: true }, soundAllowed, soundNotAllowed);
}

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

const normalizeData = filteredData => {
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    return filteredData.map(n => n * multiplier);
}

const dataToCanvas = filteredData => {
    const newData = [];

    for (let i = 0; i < filteredData.length; i++) {
        newData.push([document.body.clientHeight - (filteredData[i][0] / 255) * document.body.clientHeight, filteredData[i][1]]);
    }

    return newData;
}

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

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#65b042";
    ctx.moveTo(0, newData[0]);
    for (let i = 0; i < newData.length; i++) {
        ctx.lineTo(i, newData[i][0]);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#ffffff";
    for (let i = 0; i < newData.length; i++) {
        if (newData[i][1])
        {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, document.body.clientHeight);

        }
    }
    ctx.stroke();
};