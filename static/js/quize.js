let questions = [];
let timeLeft = 30;
let timerInterval = null;
let submitted = false;

async function loadQuiz() {
    const response = await fetch("/questions");
    const data = await response.json();
    questions = data.questions;
    const quizDiv = document.getElementById("quiz");
    quizDiv.innerHTML = "";
    questions.forEach(q => {
        let html = `<div class="quiz-question"><h3>${q.question}</h3>`;
        q.options.forEach(option => {
            html += `<label class="quiz-option"><input type="radio" name="${q.id}" value="${option}"> ${option}</label>`;
        });
        html += `</div>`;
        quizDiv.innerHTML += html;
    });
}

function startQuiz() {
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("quiz").style.display = "block";
    document.getElementById("submitBtn").style.display = "block";
    document.getElementById("timer").innerText = `Time Left: ${timeLeft}s`;
    startTimer();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = `Time Left: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }
    }, 1000);
}

async function submitQuiz() {
    if (submitted) return;
    submitted = true;
    clearInterval(timerInterval);
    let answers = {};
    questions.forEach(q => {
        const selected = document.querySelector(`input[name="${q.id}"]:checked`);
        if (selected) answers[q.id] = selected.value;
    });
    const response = await fetch("/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers)
    });
    const result = await response.json();
    document.getElementById("quiz").style.display = "none";
    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("timer").innerText = "";
    const resultEl = document.getElementById("result");
    resultEl.style.display = "block";
    if (result.score >= 3) {
        localStorage.removeItem("failTime");
        resultEl.innerHTML = `
            <p>🎉 Congratulations! You passed!</p>
            <p>Your Score: ${result.score}/${result.total}</p>
            <br>
            <button onclick="restartQuiz()">Play Again</button>`;
    } else {
        localStorage.setItem("failTime", Date.now());
        let countdown = 60;
        resultEl.innerHTML = `
            <p>❌ You didn't pass!</p>
            <p>Your Score: ${result.score}/${result.total}</p>
            <p>You need at least 3/5 to pass.</p>
            <br>
            <span id="cooldown">Try again in: 0:60</span>`;
        const cooldownInterval = setInterval(() => {
            countdown--;
            const pad = countdown < 10 ? "0" : "";
            document.getElementById("cooldown").innerText = `Try again in: 0:${pad}${countdown}`;
            if (countdown <= 0) {
                clearInterval(cooldownInterval);
                localStorage.removeItem("failTime");
                resultEl.innerHTML = `
                    <p>❌ You didn't pass!</p>
                    <p>Your Score: ${result.score}/${result.total}</p>
                    <br>
                    <button onclick="restartQuiz()">Try Again</button>`;
            }
        }, 1000);
    }
}

async function restartQuiz() {
    questions = [];
    timeLeft = 30;
    submitted = false;
    document.getElementById("result").style.display = "none";
    document.getElementById("timer").innerText = "";
    document.getElementById("quiz").style.display = "none";
    document.getElementById("submitBtn").style.display = "none";
    await loadQuiz();
    startQuiz();
}

function checkCooldown() {
    const failTime = localStorage.getItem("failTime");
    if (!failTime) return false;
    const elapsed = (Date.now() - parseInt(failTime)) / 1000;
    if (elapsed < 60) return Math.ceil(60 - elapsed);
    localStorage.removeItem("failTime");
    return false;
}

function showCooldownScreen(seconds) {
    const resultEl = document.getElementById("result");
    resultEl.style.display = "block";
    document.getElementById("startBtn").style.display = "none";
    let countdown = seconds;
    const pad = countdown < 10 ? "0" : "";
    resultEl.innerHTML = `
        <p>❌ You didn't pass last time!</p>
        <p>You need at least 3/5 to pass.</p>
        <br>
        <span id="cooldown">Try again in: 0:${pad}${countdown}</span>`;
    const cooldownInterval = setInterval(() => {
        countdown--;
        const pad = countdown < 10 ? "0" : "";
        document.getElementById("cooldown").innerText = `Try again in: 0:${pad}${countdown}`;
        if (countdown <= 0) {
            clearInterval(cooldownInterval);
            localStorage.removeItem("failTime");
            resultEl.style.display = "none";
            document.getElementById("startBtn").style.display = "block";
        }
    }, 1000);
}

async function init() {
    await loadQuiz();
    const remaining = checkCooldown();
    if (remaining) {
        showCooldownScreen(remaining);
    }
}

init();