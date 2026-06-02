from flask import Flask, jsonify, request, render_template
import json

app = Flask(__name__)

TASKS_FILE = "task.json"

# ----------------------------------
# Read JSON Data
# ----------------------------------
def read_data():
    with open(TASKS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

# ----------------------------------
# Write JSON Data
# ----------------------------------
def write_data(data):
    with open(TASKS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ----------------------------------
# Home Page
# ----------------------------------
@app.route("/")
def index():
    return render_template("index.html")

# ----------------------------------
# Dashboard
# ----------------------------------
@app.route("/dashboard")
def dashboard():
    data = read_data()
    return render_template(
        "dashboard.html",
        tasks=data["task"]
    )

# ----------------------------------
# Get All Tasks
# ----------------------------------
@app.route("/task", methods=["GET"])
def get_tasks():
    data = read_data()
    return jsonify(data)

# ----------------------------------
# Add Task
# ----------------------------------
@app.route("/submit", methods=["POST"])
def submit_quiz():

    user_answers = request.get_json()

    questions = read_questions()["questions"]

    score = 0

    for q in questions:

        qid = str(q["id"])

        if qid in user_answers:

            if user_answers[qid] == q["answer"]:
                score += 1

    return jsonify({
        "score": score,
        "total": len(questions)
    })

# ----------------------------------
# Update Task
# ----------------------------------
@app.route("/task/<int:task_id>", methods=["PUT"])
def update_task(task_id):

    data = read_data()
    body = request.get_json()

    allowed_status = [
        "À faire",
        "En cours",
        "Terminé"
    ]

    for task in data["task"]:

        if task["id"] == task_id:

            if "title" in body:
                task["title"] = body["title"]

            if "assigned_to" in body:
                task["assigned_to"] = body["assigned_to"]

            if "status" in body:

                if body["status"] not in allowed_status:
                    return jsonify({
                        "error": "Invalid status"
                    }), 400

                task["status"] = body["status"]

            write_data(data)

            return jsonify(task)

    return jsonify({
        "error": "Task not found"
    }), 404

# ----------------------------------
# Delete Task
# ----------------------------------
@app.route("/task/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    data = read_data()

    original_length = len(data["task"])

    data["task"] = [
        task for task in data["task"]
        if task["id"] != task_id
    ]

    if len(data["task"]) == original_length:
        return jsonify({
            "error": "Task not found"
        }), 404

    write_data(data)

    return jsonify({
        "message": "Task deleted successfully"
    }) 

# ----------------------------------
# Quiz Page (CodeArena)
# ----------------------------------
@app.route("/quiz")
def quiz():
    return render_template("quiz.html")

# ----------------------------------
# Read Quiz Questions

QUESTIONS_FILE = "questions.json"

def read_questions():
    with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


# ----------------------------------
@app.route("/questions", methods=["GET"])
def get_questions():
    return jsonify(read_questions()) 
# ----------------------------------
# Run Server
# ----------------------------------
if __name__ == "__main__":
    app.run(debug=True) 