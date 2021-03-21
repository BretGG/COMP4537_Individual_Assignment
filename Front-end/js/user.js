const key = "quiz";
const error = "ERROR: can't access localStorage";
let questions = [];
let questionCount = 0; // contains number of questions
let userAnswers = []; // contains user's answers
let ansKeys = []; // contains answer keys

// TODO: Getting existing localStorage
function getStorage() {
    let data;
    if (!Storage) {
        console.log(error);
    } else {
        data = localStorage.getItem(key); // returns a JSON string!
    }
    if (data) {
        questions = JSON.parse(data);
        questionCount = questions.length;
    }
    console.log("Loaded questions", questions); // parsing back to JSON object
}

// TODO: Rendering DOM from data grabbed from localStorage
function render() {
    if (questionCount <= 0) {
        document.getElementById("errorMessage").hidden = false;
        document.getElementById("submitButton").hidden = true;
        return;
    }

    // Iterating through questions array
    for (let i = 0; i < questionCount; i++) {
        let body = questions[i].body;
        let answers = questions[i].answers;
        ansKeys.push(questions[i].key);

        let question = document.createElement("div");
        question.id = "question" + i;

        // Rendering question title and body
        let label = document.createElement("p");
        let text = document.createTextNode("Question " + (i + 1));
        label.appendChild(text);

        let qBody = document.createElement("textarea");
        let qText = document.createTextNode(body);
        qBody.className = "qBody";
        qBody.id = "qBody" + i;
        qBody.disabled = true;
        qBody.appendChild(qText);

        question.appendChild(label);
        question.appendChild(qBody);

        // Rendering MC answers
        let ansBody = document.createElement("div");
        ansBody.className = "ansBody";
        ansBody.id = "ansBody" + i;

        // Rendering radio buttons/answers
        for (let j = 0; j < answers.length; j++) {
            let answer = document.createElement("div"); //
            answer.className = "answer";
            answer.id = "answer" + j;

            // radio btn for choosing ans key
            let radio = document.createElement("input");
            radio.setAttribute("type", "radio");
            radio.setAttribute("name", "key" + i);
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
        if (i != questionCount - 1)
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
    results.innerHTML = `Correct: ${totalCorrect} Total: ${questions.length} Result: ${totalCorrect / questions.length}%`
    results = document.getElementById("submitButton").hidden = true;
}

getStorage();
render();