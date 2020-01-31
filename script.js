var chosen_plan = 1;

$("#plan1").addClass("selected_plan");

$("#plan1").click(function () {
    chosen_plan = 1;

    $("#plan1").addClass("selected_plan");
    $("#plan2").removeClass("selected_plan");
    $("#plan4").removeClass("selected_plan");
    $("#plan_speak").removeClass("selected_plan");
});

$("#plan2").click(function () {
    chosen_plan = 2;

    $("#plan1").removeClass("selected_plan");
    $("#plan2").addClass("selected_plan");
    $("#plan4").removeClass("selected_plan");
    $("#plan_speak").removeClass("selected_plan");
});

$("#plan4").click(function () {
    chosen_plan = 4;

    $("#plan1").removeClass("selected_plan");
    $("#plan2").removeClass("selected_plan");
    $("#plan4").addClass("selected_plan");
    $("#plan_speak").removeClass("selected_plan");
});

$("#plan_speak").click(function () {
    chosen_plan = 0;

    $("#plan1").removeClass("selected_plan");
    $("#plan2").removeClass("selected_plan");
    $("#plan4").removeClass("selected_plan");
    $("#plan_speak").addClass("selected_plan");
});

$("#input_submit").click(function () {
    $("#form_wrapper").hide();
    $("#main_canvas").show();
    $(".bar_btn").show();
    $("#logo").hide();

    start_amp();
});

var play_stop = function () {
    if (stopped == true) {
        stopped = false;
        $("#bar_plus_btn").removeClass("bar_disabled_btn");
        $("#bar_minus_btn").removeClass("bar_disabled_btn");
        $("#bar_clean_btn").removeClass("bar_disabled_btn");
        $("#bar_play_stop_btn").text("Stop");
    }
    else {
        stopped = true;
        $("#bar_plus_btn").addClass("bar_disabled_btn");
        $("#bar_minus_btn").addClass("bar_disabled_btn");
        $("#bar_clean_btn").addClass("bar_disabled_btn");
        $("#bar_play_stop_btn").text("Play");
    }
};

$("#bar_play_stop_btn").click(play_stop);
$("#main_canvas").click(play_stop);

$("#bar_plus_btn").click(function () {
    if (stopped == true) {
        return;
    }

    if (largeInPixel < 4) {
        largeInPixel += 1;
    }
});

$("#bar_minus_btn").click(function () {
    if (stopped == true) {
        return;
    }

    if (largeInPixel > 0) {
        largeInPixel -= 1;
    }
});

$("#bar_clean_btn").click(function () {
    if (stopped == true) {
        return;
    }

    boardArray = new Array();
    totalSamples = 0;
});

var boardArray = new Array();
var totalSamples = 0;
var stopped = false;
var largeInPixel = 1;
var lastSampleSum = 0;
var latencyWarningCount = 0;
var lastLatencyWarningZero = performance.now();
var mutedMicCount = 0;
var lastmutesMicZero = performance.now();

var start_amp = function () {
    'use strict';

    var soundAllowed = function (stream) {
        window.persistAudioStream = stream;
        var audioContext = new AudioContext();
        var audioStream = audioContext.createMediaStreamSource(stream);
        var analyser = audioContext.createAnalyser();

        audioStream.connect(analyser);

        analyser.smoothingTimeConstant = 1;
        analyser.fftSize = 1024;

        var frequencyArray = new Uint8Array(analyser.frequencyBinCount);

        var doDraw = function () {
            requestAnimationFrame(doDraw);
            analyser.getByteTimeDomainData(frequencyArray);

            if (stopped) {
                return;
            }

            // Mute mic warning
            var allmute = true;
            for (var i = 0; i < frequencyArray.length; i++) {
                if (128 != frequencyArray[i]) {
                    allmute = false;
                    break;
                }
            }
            if (allmute) {
                if (performance.now() - lastmutesMicZero > 5000) {
                    mutedMicCount = 1;
                    lastmutesMicZero = performance.now();
                }
                else {
                    mutedMicCount += 1;
                }
            }

            // Latency warning
            var currentSampleSum = frequencyArray.reduce((a, b) => a + b, 0);
            if (!allmute && currentSampleSum == lastSampleSum) {
                if (performance.now() - lastLatencyWarningZero > 5000) {
                    latencyWarningCount = 1;
                    lastLatencyWarningZero = performance.now();
                }
                else {
                    latencyWarningCount += 1;
                }
            }
            lastSampleSum = currentSampleSum;

            // Find max element in sample array
            var max = 0;
            for (var i = 0; i < frequencyArray.length; i++) {
                if (max < frequencyArray[i]) {
                    max = frequencyArray[i];
                }
            }

            boardArray.push(max);

            if (boardArray.length * (largeInPixel + 1) >= document.body.clientWidth * 0.7) {
                var prv_size = boardArray.length;
                boardArray.splice(0, boardArray.length - document.body.clientWidth * 0.7 / (largeInPixel + 1));

                totalSamples += (prv_size - boardArray.length) % 60;
                totalSamples = totalSamples % 60;
            }

            draw(boardArray);
        }
        doDraw();
    }

    var soundNotAllowed = function (error) {
        alert('Please check your microphone connectivity and allow this site to access it');
        console.log(error);
    }

    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.getUserMedia({ audio: true }, soundAllowed, soundNotAllowed);
}

const dataToCanvas = filteredData => {
    const newData = [];

    for (let i = 0; i < filteredData.length; i++) {
        var pre = (filteredData[i] - 127) / 128;

        newData.push(document.body.clientHeight - pre * document.body.clientHeight);
    }

    return newData;
}

const draw = normalizedData => {
    // set up the canvas
    const canvas = document.querySelector("canvas");
    const dpr = window.devicePixelRatio || 1;
    const padding = 20;

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    const ctx = canvas.getContext("2d");

    //normalizedData --> 128 - 255
    newData = dataToCanvas(normalizedData);

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#65b042";

    ctx.moveTo(0, newData[0]);
    var lastPoint = [0, newData[0]];
    var redCount = 0;
    for (let i = 0; i < newData.length; i++) {
        // Check red
        if (normalizedData[i] < 130 && i + 9 < normalizedData.length) {
            var total = 0;
            for (var j = i; j < i + 10; j++) {
                total += normalizedData[j] - 127;
            }
            var avg = total / 10;
            if (avg > 8) {
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(lastPoint[0], lastPoint[1]);
                ctx.lineWidth = 1;
                ctx.strokeStyle = "red";
                redCount = 10;
            }
        }

        ctx.lineTo(i + largeInPixel * i, newData[i]);
        lastPoint = [i + largeInPixel * i, newData[i]];

        if (largeInPixel != 0 && (i + 1) < newData.length) {
            var diff = Math.abs(newData[i] - newData[i + 1]);
            var each_diff = diff / largeInPixel;

            for (let j = 0; j < largeInPixel; j++) {
                ctx.lineTo(i + largeInPixel * i + j + 1, newData[i] + (each_diff * j));
                lastPoint = [i + largeInPixel * i + j + 1, newData[i] + (each_diff * j)];
            }
        }

        if (redCount > 0) {
            redCount -= 1;

            if (redCount <= 0) {
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(lastPoint[0], lastPoint[1]);
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#65b042";
            }
        }
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#ffffff";
    for (let i = 0; i < canvas.width; i++) {
        if ((i + (totalSamples * (largeInPixel + 1))) % (60 * (largeInPixel + 1)) == 0) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, document.body.clientHeight - 5);
        }
    }
    ctx.stroke();

    // Logo
    ctx.font = "20px Palatino Linotype Sans MS";
    ctx.fillStyle = "white";
    ctx.globalAlpha = 0.2;
    ctx.fillText("SpeakApp!", 10, 30);

    // Microphone muted warning
    if (mutedMicCount > 50) {
        ctx.font = "20px Palatino Linotype Sans MS";
        ctx.fillStyle = "Yellow";
        ctx.globalAlpha = 0.5;
        ctx.textAlign = "center";
        ctx.fillText("Warning: Microphone muted", canvas.width / 2, 30);
    }
    else {
        // High microphone latency warning
        if (latencyWarningCount > 50) {
            ctx.font = "20px Palatino Linotype Sans MS";
            ctx.fillStyle = "Yellow";
            ctx.globalAlpha = 0.5;
            ctx.textAlign = "center";
            ctx.fillText("Warning: Your device have high latency", canvas.width / 2, 30);
        }
    }
};