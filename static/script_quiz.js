const xhttp = new XMLHttpRequest();

let score = 0;
let quizpage = 0;
let vocabulary = "";
let daily_award = "";
let user_solution = [];
let sample_solution = [];
let hint_count = 0 
const question = document.getElementById("question");
const input_form = document.getElementById("answer-form");

get_vocabulary_data();
get_daily_award();

input_form.addEventListener("submit", event => {
    event.preventDefault();
    let infinitive = document.querySelector("#infinitive").value.toLowerCase().trim();
    let simple_past = document.querySelector("#simple_past").value.toLowerCase().trim();
    let past_participle = document.querySelector("#past_participle").value.toLowerCase().trim();
    input_form.reset();
    document.querySelector("#infinitive").focus();
    check_input(infinitive, simple_past, past_participle);
});

document.getElementById("hint-btn").addEventListener("click", event => {
    event.preventDefault();
    document.querySelector("#infinitive").value = vocabulary[quizpage][0];
    hint_count++;
})

function get_vocabulary_data() {
    fetch("/vokabeltrainer", {
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify({"get_voc":""}),
    }).then(function(response) {
            return response.json();
        }).then(function(jsonResponse) {
                vocabulary = jsonResponse;
                load_quiz();
            });
}

function get_daily_award() {
    fetch("/vokabeltrainer", {
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify({"get_award":""}),
    }).then(function(response) {
            return response.json();
        }).then(function(jsonResponse) {
                daily_award = jsonResponse.award;
            });
}

function load_quiz() {
    if (quizpage < 10) {
        question.textContent = vocabulary[quizpage][3];
    } else {
        if (score >= 5) {
            quiz_success();
        } else {
            quiz_failed();
        }
    }
}

function check_input(infinitive, simple_past, past_participle) {
    let result = false;
    let answer_1 = vocabulary[quizpage][0];
    let answer_2 = vocabulary[quizpage][1];
    let answer_3 = vocabulary[quizpage][2];
    user_solution.push({"infinitive":infinitive, "simple_past":simple_past, "past_participle":past_participle, "german":vocabulary[quizpage][3], "mistake":true});
    sample_solution.push({"infinitive":vocabulary[quizpage][0], "simple_past":vocabulary[quizpage][1], "past_participle":vocabulary[quizpage][2], "german":vocabulary[quizpage][3], "used":vocabulary[quizpage][4]});
    if (infinitive == answer_1 && simple_past == answer_2 && past_participle == answer_3){
        result = true;
        score++;
        user_solution[user_solution.length - 1].mistake = false;
    }
    update_progress(result);
    quizpage++;
    load_quiz();
}

function update_progress(result) {
    var progress_indicator = document.querySelector(".progress-indicator#"+ CSS.escape(quizpage));
    if (result) {
        progress_indicator.style.backgroundColor = "var(--green-color)";
    } else {
        progress_indicator.style.backgroundColor = "var(--red-color)";
    }
}

function quiz_success() {
    let data = {
        "quiz_success":true,
        "voc":sample_solution,
        "user_solution":user_solution,
        "score":score,
        "award":daily_award
    };

    xhttp.open("POST", "/vokabeltrainer", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));

    question.remove();   
    input_form.remove();

    document.body.appendChild(
        Object.assign(
            document.createElement("h2"),
            {id:"score", textContent:score + "/10 Points"}
    ));
    document.body.appendChild(
        Object.assign(
            document.createElement("img"),
            {id:"award", src:daily_award, alt:"your daily award"}
    ));
    document.body.appendChild(
        Object.assign(
            document.createElement("button"),
            {id:"show-result-btn", textContent:"show result"}
    ));

    document.getElementById("show-result-btn").addEventListener("click", function(){
        location.reload();
    });
}

function quiz_failed() {
    question.remove();   
    input_form.remove();

    document.body.appendChild(
        Object.assign(
            document.createElement("h2"),
            {id:"score", textContent:score + "/10 Points"}
    ));
    document.body.appendChild(
        Object.assign(
            document.createElement("h3"),
            {id:"not-finished-text", textContent:"Get atleast five correct answers to finish todays quiz. Good Luck!"}
    ));
    document.body.appendChild(
        Object.assign(
            document.createElement("button"),
            {id:"show-result-btn", textContent:"try again"}
    ));

    document.getElementById("show-result-btn").addEventListener("click", function(){
        location.reload();
    });
}
