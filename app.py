from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

users = []

# Skin analysis + advice
def analyze_skin(image):
    result = {
        "acne": "10%",
        "wrinkles": "5%",
        "hydration": "80%",
        "elasticity": "75%",
        "darkspots": "3%"
    }
    advice = {
        "acne": "Ngozi yako inaweza kuwa na chunusi. Osha uso kwa upole mara mbili kwa siku, epuka mafuta mazito.",
        "wrinkles": "Mikunjo ni midogo. Tumia moisturizer na sunscreen.",
        "hydration": "Ngozi yako ina unyevu mzuri. Endelea na utunzaji wako.",
        "elasticity": "Ngozi yako ni nyumbufu vizuri.",
        "darkspots": "Madoa meusi ni machache. Tumia cream yenye utunzaji wa madoa."
    }
    return result, advice

ADMIN_PASSWORD = "1234"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/submit_payment", methods=["POST"])
def submit_payment():
    name = request.form.get("name")
    if not name:
        return "Jina linahitajika", 400
    if not any(u["name"]==name for u in users):
        users.append({"name": name, "approved": False})
    return "ok", 200

@app.route("/scan_skin", methods=["POST"])
def scan_skin():
    name = request.form.get("name")
    user = next((u for u in users if u["name"]==name), None)
    if not user or not user["approved"]:
        return jsonify({"pending": True, "message": "Malipo bado hayajaidhinishwa na admin"})
    result, advice = analyze_skin(None)
    return jsonify({"pending": False, "result": result, "advice": advice})

@app.route("/admin", methods=["GET", "POST"])
def admin():
    authorized = False
    if request.method == "POST":
        password = request.form.get("password")
        if password == ADMIN_PASSWORD:
            authorized = True
    return render_template("admin.html", users=users, authorized=authorized)

@app.route("/approve_payment", methods=["POST"])
def approve_payment():
    data = request.get_json()
    name = data.get("name")
    user = next((u for u in users if u["name"]==name), None)
    if user:
        user["approved"] = True
        return jsonify({"status": "approved"})
    return jsonify({"status": "not_found"}), 404

if __name__ == "__main__":
    app.run(debug=True)
