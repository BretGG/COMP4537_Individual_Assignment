let arrQuestions = []; // contains all questions
let questionID = -1; // keeps track of question count

const key = "quiz";

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

function addQuestion(id) {
    let loadQuestion;
    let answerCount;

    if (id != null && id >= 0) {
        loadQuestion = arrQuestions.find(obj => obj.id === id);
        questionID = id;
        answerCount = loadQuestion.answers.length;
    } else {
        do {
            answerCount = window.prompt("Enter number of answers, 2 to 4");

            if (answerCount === null)
                return;

            answerCount = parseInt(answerCount);
        } while (isNaN(answerCount) || answerCount > 4 || answerCount < 2);

        let question = new Question(-1, 'None', [], 0)
        arrQuestions.push(question);

        for (let i = 0; i < answerCount; i++)
            question.answers.push('');

        insertIntoDatabase(question);
        id = question.id;
    }

    let question = document.createElement("div");
    question.id = "question" + id;

    // Question title and body
    let label = document.createElement("p");

    let qBody = document.createElement("textarea");
    if (loadQuestion) qBody.textContent = loadQuestion.body;
    qBody.className = "qBody";
    qBody.id = "qBody" + id;

    question.appendChild(label);
    question.appendChild(qBody);

    let ansBody = document.createElement("div");
    ansBody.className = "ansBody";
    ansBody.id = "ansBody" + id;


    // generating each answer input area
    for (let i = 0; i < answerCount; i++) {
        // div contains each answer input radio/textarea
        let answer = document.createElement("div"); //
        answer.className = "answer";
        answer.id = "answer" + i;

        // radio btn for choosing ans key
        let radio = document.createElement("input");
        radio.setAttribute("type", "radio");
        radio.setAttribute("name", "key" + id);
        radio.classList.add("radio");
        radio.value = i;
        if (i === 0) radio.checked = true // Set first question as default checked
        if (loadQuestion && loadQuestion.key == i) radio.checked = true; // Set saved answer
        answer.appendChild(radio);

        // text area for each answer
        let ansText = document.createElement("textarea");
        ansText.className = "ansText";
        ansText.classList.add("fillWidth");
        if (loadQuestion) ansText.textContent = loadQuestion.answers[i];
        // ansText.id = "ansText" + i;
        answer.appendChild(ansText);

        // appending to main answer div
        ansBody.appendChild(answer);
    }

    question.appendChild(ansBody);
    document.getElementById("main").appendChild(question);
}

function updateQuestion(id) {
    console.log("qBody" + id);
    let body = document.getElementById("qBody" + id).value;

    // getting the text for each answer
    let tempAns = document
        .getElementById("ansBody" + id)
        .querySelectorAll("textarea.ansText");
    let answers = [];
    for (let i = 0; i < tempAns.length; i++) {
        answers.push(tempAns[i].value);
    }

    // checking which answer is marked
    let tempKeys = document
        .getElementById("ansBody" + id)
        .querySelectorAll("input[type=radio]");
    let key = null;
    for (let i = 0; i < tempKeys.length; i++) {
        if (tempKeys[i].checked) {
            key = i;
        }
    }

    for (let question of arrQuestions) {
        if (question.id === id) {
            question.assignBody(body);
            question.assignAnswers(answers);
            question.assignKey(key);
        }

    }

}

function saveAll() {
    for (let question of arrQuestions) {
        updateQuestion(question.id);
        updateDatabase(question)
    }

    console.log("Saved questions", arrQuestions);
}

function deleteQuestion() {
    // Remove question container, update question id and question array
    question = arrQuestions.pop();
    document.getElementById("question" + question.id).remove();
    deleteFromDatabase(question);
}

function updateDatabase(question) {
    console.log("Update database", question.getSaveObject());

    let req = new XMLHttpRequest();
    req.open("PUT", "https://bretgetz-bcit.com/COMP4537/labs/assign/database");
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(JSON.stringify(question.getSaveObject()));
}

function deleteFromDatabase(question) {
    console.log("Delete database", question.getSaveObject());

    let req = new XMLHttpRequest();
    req.open("DELETE", "https://bretgetz-bcit.com/COMP4537/labs/assign/database");
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(JSON.stringify(question.getSaveObject()));

}

function insertIntoDatabase(question) {
    console.log("Insert database", question.getSaveObject());

    let req = new XMLHttpRequest();

    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            question.id = JSON.parse(req.responseText).id;
        }
    }

    req.open("POST", "https://bretgetz-bcit.com/COMP4537/labs/assign/database", false);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(JSON.stringify(question.getSaveObject()));
}

function getFromDatabase() {
    console.log("GET database");

    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(JSON.parse(req.responseText));
            questions = JSON.parse(req.responseText).questions;
            arrQuestions = questions.map(obj => new Question(obj.questionId, obj.question, obj.answers, obj.correctAnswer));
            arrQuestions.map(obj => addQuestion(obj.id));
            console.log(arrQuestions);
        }
    }
    req.open("GET", "https://bretgetz-bcit.com/COMP4537/labs/assign/database");
    req.send();
}

getFromDatabase();