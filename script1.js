var chosen_plan = 1;
var totalSamples = 0;
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
    start_amp();
});

var boardArray = new Array();
var stopped = false;
var largeInPixel = 1;

var start_amp = function () {
    'use strict';

    $("#logo_place").click(function() {
        if (stopped == true) {
            stopped = false;
        }
        else {
            stopped = true;
        }
    });
    var soundAllowed = function (stream) {
        window.persistAudioStream = stream;
        var audioContent = new AudioContext();
        var audioStream = audioContent.createMediaStreamSource(stream);
        //var gainNode = audioContent.createGain();
        var analyser = audioContent.createAnalyser();
      
        audioStream.connect(analyser);
        //gainNode.connect(analyser);
        //gainNode.gain.value = 0.5;
      
        analyser.smoothingTimeConstant = 0;
        analyser.fftSize = 1024;

        var frequencyArray = new Uint8Array(analyser.frequencyBinCount);
      
        var doDraw = function () {
            requestAnimationFrame(doDraw);
            analyser.getByteTimeDomainData(frequencyArray);

            if (stopped) {
                return;
            }

            var max = 0;
            for (var i = 0; i < frequencyArray.length; i++) {

                if (i <= 28 || i >= 32) {
                    //continue;
                }
                if (max < frequencyArray[i]) {
                    max = frequencyArray[i];
                }
            }

            if (largeInPixel != 0) {
                var last_val = boardArray[boardArray.length - 1];
                var diff = Math.abs(max - last_val);
                var each_diff = diff / largeInPixel;

                for (let i = 0; i < largeInPixel; i++) {
                    boardArray.push(last_val + (each_diff * i));
                }
            }

            boardArray.push(max);
            
            if (boardArray.length >= document.body.clientWidth * 0.7) {
                boardArray.splice(0, 1 + largeInPixel);
                totalSamples += (1 + largeInPixel);
                if (totalSamples == (60 * (1 + largeInPixel))) {
                    totalSamples = 0;
                }
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

const dataToCanvas = filteredData => {
    const newData = [];

    for (let i = 0; i < filteredData.length; i++) {
        //newData.push(document.body.clientHeight - (filteredData[i] / 255) * document.body.clientHeight);
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
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    newData = dataToCanvas(normalizedData);

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#65b042";

    ctx.moveTo(0, newData[0]);
    for (let i = 0; i < newData.length; i++) {
        ctx.lineTo(i, newData[i]);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#ffffff";
    for (let i = 0; i < canvas.width; i++) {
        if ((i + totalSamples) % (60 * (1 + largeInPixel)) == 0)
        {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, document.body.clientHeight);

        }
    }
    ctx.stroke();
};