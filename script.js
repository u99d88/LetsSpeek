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

    if (window.matchMedia("only screen and (max-width: 760px)").matches) {
        document.body.requestFullscreen();
    }

    start_amp();
});

var play_stop = function () {
    if (stopped == true) {
        $("#bar_plus_btn").removeClass("bar_disabled_btn");
        $("#bar_minus_btn").removeClass("bar_disabled_btn");
        $("#bar_clean_btn").removeClass("bar_disabled_btn");
        $("#bar_play_stop_btn").text("Stop");
    }
    else {
        $("#bar_plus_btn").addClass("bar_disabled_btn");
        $("#bar_minus_btn").addClass("bar_disabled_btn");
        $("#bar_clean_btn").addClass("bar_disabled_btn");
        $("#bar_play_stop_btn").text("Play");
    }

    stopped = !stopped;
};

$("#bar_play_stop_btn").click(play_stop);
$("#main_canvas").click(play_stop);
document.body.onkeyup = function (e) {
    if (e.keyCode == 32) {
        play_stop();
    }
}

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

var start_amp = function () {
    'use strict';

    var soundAllowed = function (stream) {
        window.persistAudioStream = stream;
        var audioContext = new AudioContext({
            latencyHint: "interactive",
            sampleRate: 60000
        });
        var audioStream = audioContext.createMediaStreamSource(stream);
        var analyser = audioContext.createAnalyser();

        audioStream.connect(analyser);

        analyser.smoothingTimeConstant = 0;
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
                if (128 != frequencyArray[i] && 127 != frequencyArray[i]) {
                    allmute = false;
                    break;
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
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#65b042";

    ctx.moveTo(0, newData[0]);

    var lastPoint = [0, newData[0]];
    var redLine = false;
    var blueLine = false;
    var endOfBlueLine = 0;
    var ClimbeTooFastMaxValue = 0;
    var tmpp = false;

    for (let i = 0; i < newData.length; i++) {
        // Check sample error
        if (normalizedData[i] >= 130 && i + 1 < newData.length && normalizedData[i] == normalizedData[i + 1]) {
            //continue;
        }

        // Check red
        if (false && !redLine && normalizedData[i] < 130 && i + 9 < normalizedData.length) {
            var total = 0;
            for (var j = i; j < i + 10; j++) {
                total += normalizedData[j] - 127;
            }
            var avg = total / 10;
            if (avg > 8) {
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(lastPoint[0], lastPoint[1]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "red";
                redLine = true;
            }
        }

        // Check blue
        if (!blueLine && normalizedData[i] < 130 && i + 9 < normalizedData.length && normalizedData[i + 9] > 130) {
            var endOfMountain = i;
            var maxOfMountain = normalizedData[i];
            var isMountain = false;
            for (var j = i; j < normalizedData.length; j++) {
                if (maxOfMountain < normalizedData[j]) {
                    maxOfMountain = normalizedData[j];
                }

                if (normalizedData[j] > 140) {
                    isMountain = true;
                }

                if (j > i + 9 && normalizedData[j] < 130) {
                    endOfMountain = j;
                    break;
                }
            }

            if (isMountain && endOfBlueLine != i) {
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(lastPoint[0], lastPoint[1]);
                ctx.lineWidth = 2;

                if (tmpp) {
                    ctx.strokeStyle = "blue";
                    tmpp = !tmpp;
                } else {
                    ctx.strokeStyle = "orange";
                    tmpp = !tmpp;
                }

                blueLine = true;
                redLine = false;
                endOfBlueLine = endOfMountain;
                console.log("start mountain at " + i + " until " + endOfBlueLine);
            }
        }

        ctx.lineTo(i + largeInPixel * i, newData[i]);

        //ctx.font = "10px Palatino Linotype Sans MS";
        //ctx.fillStyle = "white";
        //ctx.fillText(i, i + largeInPixel * i, newData[i]);

        lastPoint = [i + largeInPixel * i, newData[i]];

        if (largeInPixel != 0 && (i + 1) < newData.length) {
            var diff = Math.abs(newData[i] - newData[i + 1]);
            var each_diff = diff / largeInPixel;

            for (let j = 0; j < largeInPixel; j++) {
                ctx.lineTo(i + largeInPixel * i + j + 1, newData[i] + (each_diff * j));
                lastPoint = [i + largeInPixel * i + j + 1, newData[i] + (each_diff * j)];
            }
        }

        if (redLine) {
            if (ClimbeTooFastMaxValue < normalizedData[i]) {
                ClimbeTooFastMaxValue = normalizedData[i];
            }

            if (normalizedData[i] > 160 || normalizedData[i] + 5 < ClimbeTooFastMaxValue || normalizedData[i] < 128) {
                redLine = 0;
                ClimbeTooFastMaxValue = 0;

                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(lastPoint[0], lastPoint[1]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#65b042";
            }
        }

        if (blueLine && i == endOfBlueLine) {
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(lastPoint[0], lastPoint[1]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#65b042";

            blueLine = false;
            endOfBlueLine = 0;
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

    // High microphone latency warning
    if (latencyWarningCount > 50) {
        ctx.font = "20px Palatino Linotype Sans MS";
        ctx.fillStyle = "Yellow";
        ctx.globalAlpha = 1;
        ctx.textAlign = "center";
        ctx.fillText("Warning: Your device have high latency", canvas.width / 2, 30);
    }
};