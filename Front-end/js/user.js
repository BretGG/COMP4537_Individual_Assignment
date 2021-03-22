const key = "quiz";
let questions = [];
let questionCount = 0; // contains number of questions
let userAnswers = []; // contains user's answers
let ansKeys = []; // contain

// Question class for containing question info
function Question(id, body, answers, key) {
    this.id = id; // contains question #
    this.body = body; // contains question text
    this.answers = answers; // contains array of text areas
    this.key = key; // contains the correct answer's id

    console.log(id, body, answers, key);

    this.getSaveObject = function() {
        return {
            id: this.id,
            question: this.body,
            answers: this.answers,
            correctAnswer: this.key
        }
    }

    this.assignBody = function(newBody) {
        this.body = newBody;
    };

    this.assignAnswers = function(newAnswers) {
        this.answers = newAnswers;
    };

    this.assignKey = function(newKey) {
        this.key = newKey;
    };
}

// TODO: Rendering DOM from data grabbed from localStorage
function render() {
    console.log('here', questions);
    if (questions.length <= 0) {
        document.getElementById("errorMessage").hidden = false;
        document.getElementById("submitButton").hidden = true;
        return;
    }

    // Iterating through questions array
    for (var questionObject of questions) {
        let body = questionObject.body;
        let answers = questionObject.answers;
        ansKeys.push(questionObject.key);

        let question = document.createElement("div");
        question.id = "question" + questionObject.id;

        // Rendering question title and body
        let label = document.createElement("p");

        let qBody = document.createElement("textarea");
        let qText = document.createTextNode(body);
        qBody.className = "qBody";
        qBody.id = "qBody" + questionObject.id;
        qBody.disabled = true;
        qBody.appendChild(qText);

        question.appendChild(label);
        question.appendChild(qBody);

        // Rendering MC answers
        let ansBody = document.createElement("div");
        ansBody.className = "ansBody";
        ansBody.id = "ansBody" + questionObject.id;

        // Rendering radio buttons/answers
        for (let j = 0; j < answers.length; j++) {
            let answer = document.createElement("div"); //
            answer.className = "answer";
            answer.id = "answer" + j;

            // radio btn for choosing ans key
            let radio = document.createElement("input");
            radio.setAttribute("type", "radio");
            radio.setAttribute("name", "key" + questionObject.id);
            radio.classList.add("radio");
            radio.value = j;
            answer.appendChild(radio);

            // text area for each answer
            let ansTextArea = document.createElement("div");
            ansTextArea.innerHTML = answers[j];
            ansTextArea.className = "ansText";
            ansTextArea.disabled = true;
            answer.appendChild(ansTextArea);

            // appending to main answer div
            ansBody.appendChild(answer);
        }
        question.appendChild(ansBody);
        document.getElementById("main").appendChild(question);

        // Add line between questions
        document.getElementById("main").appendChild(document.createElement("hr"));
    }
}

// Returns the user's answer based on given question ID
function grabAnswer(id) {
    let tempKeys = document
        .getElementById("ansBody" + id)
        .querySelectorAll("input[type=radio]");
    let key = null;
    for (let i = 0; i < tempKeys.length; i++) {
        if (tempKeys[i].checked) {
            key = i;
        }
    }
    return key;
}

function submit() {
    // Total correct answers
    let totalCorrect = 0
    questions.map(question => {
        if (grabAnswer(question.id) === question.key) totalCorrect++;

        // Setting text for correct and wrong answers
        let ansBody = document.getElementById("ansBody" + question.id);
        let questionDivs = ansBody.children;
        let radios = ansBody.getElementsByClassName("radio");

        for (let i = 0; i < radios.length; i++) {
            let tag = document.createElement("span");
            radios[i].disabled = true;
            if (i === question.key) {
                tag.classList.add("green", "answerTag");
                tag.innerText = "\tCorrect";
            } else if (radios[i].checked === true && i !== question.key) {
                tag.classList.add("red", "answerTag");
                tag.innerText = "\tWrong";
            }
            questionDivs[i].appendChild(tag);
        }
    })

    // Set results and hide submit button
    results = document.getElementById("results");
    results.innerHTML = `Correct: ${totalCorrect} Total: ${questions.length} Result: ${(totalCorrect / questions.length) * 100}%`
    results = document.getElementById("submitButton").hidden = true;
}


function getFromDatabase() {
    console.log("GET database");

    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(JSON.parse(req.responseText));
            questions = JSON.parse(req.responseText).questions;
            questions = questions.map(obj => new Question(obj.questionId, obj.question, obj.answers, obj.correctAnswer));
            console.log(questions);
            render();
        }
    }
    req.open("GET", "https://bretgetz-bcit.com/COMP4537/labs/assign/database");
    req.send();
}

getFromDatabase();