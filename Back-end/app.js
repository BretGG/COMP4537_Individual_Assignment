const mysql = require('mysql');
const http = require('http');

// Public in git, should be in a env variable but nothing much to hide here
const sqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'bretgetz_admin',
    password: 'S0meth1ng!',
    database: 'bretgetz_individual_assignment'
});

// const sqlConnection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'password',
//     database: 'bretgetz_individual_assignment'
// });


sqlConnection.connect(err => {
    if (err) {
        console.log("Failed to connect", err);
        return;
    }

    console.log("connected to sql");
});

var server = http.createServer(function(req, res) {
    console.log(req.method, req.url);
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Methods", "PUT, DELETE, POST, GET");
        res.end();
    }

    switch (req.method) {
        case 'GET':
            getQuestions(req, res);
            break;
        case 'POST':
            postQuestion(req, res);
            break;
        case 'PUT':
            putQuestion(req, res);
            break;
        case 'DELETE':
            removeQuestion(req, res);
            break;
    }
});

server.listen(5050, () => {
    console.log("listening...");
});

function getQuestions(req, res) {
    let quiz = {
        questions: []
    };

    sqlConnection.query('SELECT q.id, q.question, q.correctAnswer, a.answer FROM quiz u JOIN question q ON q.quizId = u.id JOIN answer a ON a.questionId = q.id WHERE u.id = 1', (err, results, fields) => {
        if (err) {
            console.log("Failed sql query", err);
            return res.status(500).send("Failed sql query");
        }

        let lastQuestionId = -1;
        let nextIndex = 0;
        for (let row of results) {
            // This feels gross and I am ashamed
            if (lastQuestionId != row.id) {
                nextIndex = quiz['questions'].length;
                quiz['questions'][nextIndex] = { questionId: row.id, question: row.question, correctAnswer: row.correctAnswer, answers: [] }
                lastQuestionId = row.id;
            }

            quiz['questions'][nextIndex].answers.push(row.answer);
        }

        res.end(JSON.stringify(quiz));
    })
};

function postQuestion(req, res) {

    getData(req).then(data => {
        sqlConnection.query(`INSERT INTO question (question, quizId, correctAnswer) VALUES ('${data.question}', 1, '${data.correctAnswer}');`);

        sqlConnection.query('SELECT LAST_INSERT_ID();', (err, results, fields) => {
            if (err) {
                console.log("Failed sql query", err);
                return res.status(500).send("Failed sql query");
            }

            data.id = results[0]['LAST_INSERT_ID()'];

            for (let answer of data.answers)
                sqlConnection.query(`INSERT INTO answer (answer, questionId) VALUES ('${answer}', ${data.id});`);

            res.end(JSON.stringify(data));
        });
    })
};

function putQuestion(req, res) {
    getData(req).then(data => {
        questionId = data.id;

        sqlConnection.query(`UPDATE question SET question = '${data.question}', correctAnswer = ${data.correctAnswer} WHERE id = ${questionId};`);
        sqlConnection.query(`DELETE FROM answer WHERE questionId = ${questionId};`);

        let answers = data.answers;
        for (let i = answers.length - 1; i >= 0; i--)
            sqlConnection.query(`INSERT INTO answer (answer, questionId) VALUES ('${answers[i]}', ${questionId});`);

        res.end(JSON.stringify(data));
    })
};

function removeQuestion(req, res) {
    getData(req).then(data => {
        sqlConnection.query(`DELETE FROM question WHERE id = ${data.id};`);
        res.end(JSON.stringify(data));
    });
};

function getData(req) {
    return new Promise((resolve, reject) => {
        const size = parseInt(req.headers['content-length'], 10)
        const buffer = Buffer.allocUnsafe(size)
        var pos = 0

        req
            .on('data', (chunk) => {
                const offset = pos + chunk.length
                if (offset > size) {
                    reject(413, 'Too Large', res)
                    return
                }
                chunk.copy(buffer, pos)
                pos = offset
            })
            .on('end', () => {
                if (pos !== size) {
                    reject(400, 'Bad Request', res)
                    return
                }
                resolve(JSON.parse(buffer.toString()));
            })
    })
}