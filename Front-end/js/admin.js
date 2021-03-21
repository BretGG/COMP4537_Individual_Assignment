let arrQuestions = []; // contains all questions
let questionID = -1; // keeps track of question count

const key = "quiz";
const error = "ERROR: can't access localStorage";

// TODO: Getting existing localStorage
function getStorage() {
    let data;

    if (!Storage)
        console.log(error);
    else
        data = localStorage.getItem(key); // returns a JSON string!

    if (data) {
        let questions = JSON.parse(data); // Just question attributes
        arrQuestions = questions.map(obj => new Question(obj.id, obj.body, obj.answers, obj.key)) // Question class objects
    }

    arrQuestions.map(obj => addQuestion(obj.id));
}

// Question class for containing question info
function Question(id, body, answers, key) {
    this.id = id; // contains question #
    this.body = body; // contains question text
    this.answers = answers; // contains array of text areas
    this.key = key; // contains the correct answer's id

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

// Generates DOM elements for each Question, and
// updates localStorage.
function addQuestion(id) {

    let loadQuestion;
    let answerCount;
    if (id != null && id >= 0) {
        loadQuestion = arrQuestions.find(obj => obj.id === id);
        questionID = id;
        answerCount = loadQuestion.answers.length;
    } else {
        questionID++;
        arrQuestions.push(new Question(questionID));
        id = questionID;

        do {
            answerCount = parseInt(window.prompt("Enter number of answers, 2 to 4"))
        } while (isNaN(answerCount) || answerCount > 4 || answerCount < 2);
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
        radio.setAttribute("name", "key" + questionID);
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

// Saves the current info for an individual question into the
// corresponding Question object.
// id = question id
function saveQuestion(id) {
    if (questionID == -1) {
        console.log("ERROR: saveQuestion");
    } else {
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

        arrQuestions[id].assignBody(body);
        arrQuestions[id].assignAnswers(answers);
        arrQuestions[id].assignKey(key);
    }
}

// Save changes for ALL questions into local storage
// NOTE: Question array is saved as a JSON string
function saveAll() {
    // saving all question info into corresponding question object
    for (let i = 0; i <= questionID; i++) {
        saveQuestion(i);
    }

    if (!Storage) {
        console.log(error);
    } else {
        localStorage.setItem(key, JSON.stringify(arrQuestions));
        console.log("Saved questions", arrQuestions);
    }
}

// Deletes the most recent question
function deleteQuestion() {
    // Removes the quiz key from localStorage if there's no questions left.
    if (questionID == -1) {
        console.log("ERROR: No questions to delete!");
        if (typeof Storage == "undefined") {
            console.log(error);
        } else {
            localStorage.removeItem(key);
        }
    } else {
        // Remove question container, update question id and question array
        document.getElementById("question" + questionID).remove();
        questionID--;
        arrQuestions.pop();
        saveAll();
    }
}

function updateDatabase(question) {
    let req = new XMLHttpRequest();
    req.open("PUT", "https://bretgetz-bcit.com/COMP4537/labs/assign/database");
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(JSON.stringify(question));
}

function deleteFromDatabase(question) {

}

function insertIntoDatabase(question) {

}

function getFromDatabase() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(JSON.parse(req.responseText));
            questions = JSON.parse(req.responseText).questions;
            arrQuestions = questions.map(obj => new Question(obj.questionId, obj.question, obj.answers, obj.correctAnswer))
            arrQuestions.map(obj => addQuestion(obj.id));
        }
    }
    req.open("GET", "https://bretgetz-bcit.com/COMP4537/labs/assign/database");
    req.send();
}

getFromDatabase();