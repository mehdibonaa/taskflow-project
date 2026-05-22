# Import Flask w les outils nécessaires
# pyrefly: ignore [missing-import]
from flask import Flask, jsonify, request, render_template
import json


# Créer l'application Flask
app = Flask(__name__) 

# Chemin vers le fichier JSON (base de données locale)
TASKS_FILE = "task.json"

# ─────────────────────────────────────────
# FONCTION : Lire les données du fichier JSON
# ─────────────────────────────────────────
def read_data():
    with open(TASKS_FILE, "r") as f:
        return json.load(f)

# ─────────────────────────────────────────
# FONCTION : Sauvegarder les données dans JSON
# ─────────────────────────────────────────
def write_data(data):
    with open(TASKS_FILE, "w") as f:
        json.dump(data, f, indent=2)

# ─────────────────────────────────────────
# ROUTE : Page principale
# ─────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")

# ─────────────────────────────────────────
# ROUTE : Récupérer toutes les tâches (GET)
# ─────────────────────────────────────────
@app.route("/task", methods=["GET"])
def get_tasks():
    data = read_data()
    return jsonify(data)

# ─────────────────────────────────────────
# ROUTE : Ajouter une tâche (POST)
# ─────────────────────────────────────────
@app.route("/task", methods=["POST"])
def add_task():
    data = read_data()
    body = request.get_json()

    # Créer la nouvelle tâche avec un ID unique
    new_task = {
        "id": len(data["task"]) + 1,
        "title": body["title"],
        "status": "À faire",
        "assigned_to": body.get("assigned_to", "")
    }

    # Ajouter la tâche à la liste
    data["task"].append(new_task)
    write_data(data)

    return jsonify(new_task), 201

# ─────────────────────────────────────────
# ROUTE : Modifier une tâche (PUT)
# ─────────────────────────────────────────
@app.route("/task/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = read_data()
    body = request.get_json()

    # Chercher la tâche par ID
    for task in data["task"]:
        if task["id"] == task_id:
            # Mettre à jour les champs
            task["title"] = body.get("title", task["title"])
            task["status"] = body.get("status", task["status"])
            task["assigned_to"] = body.get("assigned_to", task["assigned_to"])
            write_data(data)
            return jsonify(task)

    return jsonify({"error": "Tâche introuvable"}), 404

# ─────────────────────────────────────────
# ROUTE : Supprimer une tâche (DELETE)
# ─────────────────────────────────────────
@app.route("/task/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    data = read_data()

    # Filtrer — garder toutes les tâches sauf celle à supprimer
    original_length = len(data["task"])
    data["task"] = [t for t in data["task"] if t["id"] != task_id]

    # Vérifier si la tâche existait
    if len(data["task"]) == original_length:
        return jsonify({"error": "Tâche introuvable"}), 404

    write_data(data)
    return jsonify({"message": "Tâche supprimée"})

# ─────────────────────────────────────────
# Lancer le serveur
# ─────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True)    