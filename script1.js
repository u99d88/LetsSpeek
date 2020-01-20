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
});