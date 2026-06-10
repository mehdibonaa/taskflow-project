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
def home():
    return render_template("login.html")

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
@app.route("/task", methods=["POST"])
def add_task():
    data = read_data()
    body = request.get_json()

    if not body.get("title"):
        return jsonify({
            "error": "Title required"
        }), 400

    new_id = max(
        [task["id"] for task in data["task"]],
        default=0
    ) + 1

    new_task = {
    "id": new_id,
    "title": body["title"],
    "description": body.get("description", ""),
    "status": "À faire",
    "assigned_to": body.get("assigned_to", "")
}

    data["task"].append(new_task)

    write_data(data)

    return jsonify(new_task), 201
  
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
            if "description" in body:
                 task["description"] = body["description"]

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
    return render_template("quize.html")

# ----------------------------------
# Read Quiz Questions

QUESTIONS_FILE = "questions.json"

def read_questions():
    with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


# ----------------------------------
USERS_FILE = "users.json"

def read_users():
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

# ----------------------------------

# ----------------------------------
@app.route("/login", methods=["POST"])
def login():

    body = request.get_json()

    username = body.get("username")
    password = body.get("password")

    users = read_users()["users"]

    for user in users:
        if (
            user["username"] == username and
            user["password"] == password
        ):
            return jsonify({
                "success": True,
                "message": "Login successful"
            })

    return jsonify({
        "success": False,
        "message": "Invalid username or password"
    }), 401
    
#
@app.route("/forgot-password-page")
def forgot_password_page():
    return render_template("forgot_password.html")

    
#foregt password
@app.route("/forgot-password", methods=["POST"])
def forgot_password():

    body = request.get_json()

    username = body.get("username")
    new_password = body.get("new_password")

    with open("users.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    for user in data["users"]:

        if user["username"] == username:

            user["password"] = new_password

            with open("users.json", "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)

            return jsonify({
                "message": "Password updated successfully"
            })

    return jsonify({
        "error": "User not found"
    }), 404

 
#----------------------------------
# Get Quiz Questions
# ----------------------------------
@app.route("/questions", methods=["GET"])
def get_questions():
    return jsonify(read_questions())

# ----------------------------------
# Submit Quiz & Calculate Score
# ----------------------------------
@app.route("/submit", methods=["POST"])
def submit_quiz():

    user_answers = request.get_json()

    questions_data = read_questions()
    questions = questions_data["questions"]

    score = 0

    for question in questions:

        qid = str(question["id"])

        if qid in user_answers:

            if user_answers[qid] == question["answer"]:
                score += 1

    return jsonify({
        "score": score,
        "total": len(questions)
    })
    
# ----------------------------------
@app.route("/questions/<difficulty>")
def get_questions_by_difficulty(difficulty):

    data = read_questions()

    filtered = [
        q for q in data["questions"]
        if q["difficulty"] == difficulty
    ]

    return jsonify(filtered) 
# ----------------------------------
@app.route("/api")     
def api_status():   
    return jsonify({
        "message": "TaskFlow & CodeArena API Running"
    })  
# ----------------------------------

#----------------------------------
@app.route("/mytasks")
def mytasks():
    data = read_data()
    return render_template(
        "index.html",
        tasks=data["task"]
    )



# stats--  ------------------------------
@app.route("/stats")
def stats():

    data = read_data()

    total = len(data["task"])

    completed = len([
        t for t in data["task"]
        if t["status"] == "Terminé"
    ])

    progress = len([
        t for t in data["task"]
        if t["status"] == "En cours"
    ])

    return jsonify({
        "total": total,
        "completed": completed,
        "progress": progress
    })

#--------------------------------
# Get Members
@app.route("/members")
def get_members():
    with open("users.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    return jsonify(data)
#serch members
@app.route("/search")
def search_task():

    title = request.args.get("title", "")

    data = read_data()

    result = [
        task for task in data["task"]
        if title.lower() in task["title"].lower()
    ]

    return jsonify(result) 


# Run Server
# ----------------------------------
if __name__ == "__main__":
    app.run(debug=True) 