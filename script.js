var chosen_plan = 1;
var lang = "he";

function lang_choosePlan() {
    if (lang == "he") {
        return "בחר תוכנית";
    }
    else {
        return "Please choose a plan";
    }
}

function lang_start() {
    if (lang == "he") {
        return "התחל";
    }
    else {
        return "Start";
    }
}

function lang_info() {
    if (lang == "he") {
        return '<h1>SpeakApp! is part of an online free stuttering treatment course.</h1><br>\
        The course videos channel: <a href="https://www.youtube.com/channel/UCIc2DJ_mozieycLCaNSGn4A">https://www.youtube.com/channel/UCIc2DJ_mozieycLCaNSGn4A</a><br>\
        Contact: <a mailto="SpeakAppCourse@gmail.com">SpeakAppCourse@gmail.com</a>';
    }
    else {
        return '<h1>SpeakApp! is part of an online free stuttering treatment course.</h1><br>\
        The course videos channel: <a href="https://www.youtube.com/channel/UCIc2DJ_mozieycLCaNSGn4A">https://www.youtube.com/channel/UCIc2DJ_mozieycLCaNSGn4A</a><br>\
        Contact: <a mailto="SpeakAppCourse@gmail.com">SpeakAppCourse@gmail.com</a>';
    }
}

function lang_tooFastRise() {
    if (lang == "he") {
        return "עליה מהירה מידי";
    }
    else {
        return "Rise too fast";
    }
}

function lang_startBtn_continue() {
    if (lang == "he") {
        return "המשך";
    }
    else {
        return "Continue";
    }
}

function lang_startBtn_pause() {
    if (lang == "he") {
        return "השהה";
    }
    else {
        return "Pause";
    }
}

function lang_cleanBtn() {
    if (lang == "he") {
        return "נקה";
    }
    else {
        return "Clean";
    }
}

function lang_homeBtn() {
    if (lang == "he") {
        return "מסך ראשי";
    }
    else {
        return "Home";
    }
}


function updateLang() {
    $("#choose_plan_txt").text(lang_choosePlan());
    $("#input_submit").prop('value', lang_start());
    $("#about").html(lang_info());
    $("#bar_play_stop_btn").text(lang_startBtn_pause());
    $("#bar_play_stop_btn").text(lang_startBtn_pause());
    $("#bar_clean_btn").text(lang_cleanBtn());
    $("#bar_home_btn").text(lang_homeBtn());
}

$("#plan1").addClass("selected_plan");

$("#he_lang").click(function () {
    lang = "he";
    updateLang();
});

$("#en_lang").click(function () {
    lang = "en";
    updateLang()
});

var infoShows = false;
$("#info").click(function () {
    if (infoShows) {
        $("#form_wrapper").show();
        $("#about").hide();
        infoShows = false;
    }
    else {
        $("#form_wrapper").hide();
        $("#about").show();
        infoShows = true;
    }
});

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
    $("#langs").hide();
    $("#info").hide();

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
        $("#bar_play_stop_btn").text(lang_startBtn_pause());
    }
    else {
        $("#bar_plus_btn").addClass("bar_disabled_btn");
        $("#bar_minus_btn").addClass("bar_disabled_btn");
        $("#bar_clean_btn").addClass("bar_disabled_btn");
        $("#bar_play_stop_btn").text(lang_startBtn_continue());
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

$("#bar_home_btn").click(function() {
    location.reload();
});

var boardArray = new Array();
var boardArray2 = new Array();
var boardArray3 = new Array();
var boardArray4 = new Array();
var totalSamples = 0;
var stopped = false;
var largeInPixel = 1;

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
        //2
        var audioContext2 = new AudioContext({
            latencyHint: "interactive",
            sampleRate: 60000
        });
        var audioStream2 = audioContext2.createMediaStreamSource(stream);
        var analyser2 = audioContext2.createAnalyser();

        audioStream2.connect(analyser2);

        analyser2.smoothingTimeConstant = 0;
        analyser2.fftSize = 1024;
        //3
        var audioContext3 = new AudioContext({
            latencyHint: "interactive",
            sampleRate: 60000
        });
        var audioStream3 = audioContext3.createMediaStreamSource(stream);
        var analyser3 = audioContext3.createAnalyser();

        audioStream3.connect(analyser3);

        analyser3.smoothingTimeConstant = 0;
        analyser3.fftSize = 1024;
        //4
        var audioContext4 = new AudioContext({
            latencyHint: "interactive",
            sampleRate: 60000
        });
        var audioStream4 = audioContext4.createMediaStreamSource(stream);
        var analyser4 = audioContext4.createAnalyser();

        audioStream4.connect(analyser4);

        analyser4.smoothingTimeConstant = 0;
        analyser4.fftSize = 1024;

        var frequencyArray = new Uint8Array(analyser.frequencyBinCount);
        var frequencyArray2 = new Uint8Array(analyser2.frequencyBinCount);
        var frequencyArray3 = new Uint8Array(analyser3.frequencyBinCount);
        var frequencyArray4 = new Uint8Array(analyser4.frequencyBinCount);

        var doDraw = function () {
            requestAnimationFrame(doDraw);
            analyser.getByteTimeDomainData(frequencyArray);
            analyser2.getByteTimeDomainData(frequencyArray2);
            analyser3.getByteTimeDomainData(frequencyArray3);
            analyser4.getByteTimeDomainData(frequencyArray4);

            if (stopped) {
                return;
            }

            // Find max element in sample array
            var max = 0;
            for (var i = 0; i < frequencyArray.length; i++) {
                if (max < frequencyArray[i]) {
                    max = frequencyArray[i];
                }
            }

            var max2 = 0;
            for (var i = 0; i < frequencyArray2.length; i++) {
                if (max2 < frequencyArray2[i]) {
                    max2 = frequencyArray2[i];
                }
            }

            var max3 = 0;
            for (var i = 0; i < frequencyArray3.length; i++) {
                if (max3 < frequencyArray3[i]) {
                    max3 = frequencyArray3[i];
                }
            }

            var max4 = 0;
            for (var i = 0; i < frequencyArray4.length; i++) {
                if (max4 < frequencyArray4[i]) {
                    max4 = frequencyArray4[i];
                }
            }

            boardArray.push((max + max2 + max3 + max4) / 4);

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
    var lastComment = -1;
    for (let i = 0; i < newData.length; i++) {
        // Check red
        if (normalizedData[i] < 130 && i + 9 < normalizedData.length) {
            var total = 0;
            for (var j = i; j < i + 10; j++) {
                total += normalizedData[j] - 127;
            }
            var avg = total / 10;
            if (avg > 8) {
                if (lastComment == -1 || i - lastComment > 50) {
                    ctx.font = "15px Palatino Linotype Sans MS";
                    ctx.fillStyle = "white";
                    ctx.fillText(lang_tooFastRise(), lastPoint[0], canvas.height / 3);
                    lastComment = i;
                }
            }
        }

        // Check blue
        if (false && normalizedData[i] < 130 && i + 9 < normalizedData.length && normalizedData[i + 9] > 130) {
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
                ctx.strokeStyle = "blue";
                blueLine = true;
                redLine = false;
                endOfBlueLine = endOfMountain;
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

        if (false) {
            if (i == endOfBlueLine) {
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(lastPoint[0], lastPoint[1]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#65b042";

                blueLine = false;
                endOfBlueLine = 0;
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
};