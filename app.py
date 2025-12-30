from flask import Flask, render_template, request, redirect, url_for, jsonify
from datetime import datetime

app = Flask(__name__)

# Simple in-memory store for pending users
pending_users = []
next_id = 1
ADMIN_PASSWORD = "1234"  # Change this to a strong password

# Dummy function to simulate skin analysis
def analyze_skin(image_file):
    # Replace this with your real AI model if available
    result = {
        "acne": "10%",
        "wrinkles": "5%",
        "hydration": "80%",
        "elasticity": "75%",
        "darkspots": "3%"
    }
    advice = {
        "acne": "Ngozi yako inaweza kuwa yenye chunusi. Osha uso kwa upole mara mbili kwa siku, epuka mafuta mazito.",
        "wrinkles": "Ngozi yako inaweza kuonyesha alama za mwanzo za mikunjo. Tumia moisturizer na sunscreen.",
        "hydration": "Unyevu ni mzuri. Endelea na utunzaji wako.",
        "elasticity": "Unyumbufu ni mzuri.",
        "darkspots": "Madoa meusi ni machache."
    }
    return result, advice

@app.route("/")
def index():
    return render_template("index.html")

# Endpoint for scan
@app.route("/scan_skin", methods=["POST"])
def scan_skin():
    global next_id

    name = request.form.get("name")
    image_file = request.files.get("image")

    if not name or not image_file:
        return jsonify({"error": "Jina na picha lazima zipatikane"}), 400

    # Check if user is already approved
    approved_user = None
    for user in pending_users:
        if user["name"] == name and user.get("approved"):
            approved_user = user
            break

    if approved_user:
        # Perform scan
        result, advice = analyze_skin(image_file)
        return jsonify({"result": result, "advice": advice, "pending": False})
    else:
        # Add to pending list if not exists
        exists = any(u["name"] == name for u in pending_users)
        if not exists:
            pending_users.append({
                "id": next_id,
                "name": name,
                "time": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "approved": False
            })
            next_id += 1
        return jsonify({"pending": True})

# Admin page
@app.route("/admin", methods=["GET", "POST"])
def admin():
    authorized = False
    if request.method == "POST":
        password = request.form.get("password")
        if password == ADMIN_PASSWORD:
            authorized = True
    return render_template("admin.html", authorized=authorized, pending_users=pending_users)

# Approve a user
@app.route("/approve/<int:user_id>", methods=["POST"])
def approve(user_id):
    global pending_users
    for user in pending_users:
        if user["id"] == user_id:
            user["approved"] = True
            break
    return redirect(url_for("admin"))

if __name__ == "__main__":
    app.run(debug=True)
