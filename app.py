from flask import Flask, render_template, request, jsonify, session, redirect
import random

app = Flask(__name__)
app.secret_key = "salama_admin_secret_123"

# Store payments (in-memory for demo)
payments = []  # Each item: {"name": "...", "approved": False}

# -------------------
# Home page
# -------------------
@app.route("/")
def index():
    return render_template("index.html", payments=payments)


# -------------------
# Record payment confirmation
# -------------------
@app.route("/confirm_payment", methods=["POST"])
def confirm_payment():
    name = request.form.get("name")
    if not name:
        return jsonify({"error": "Name required"}), 400

    # Add to payments list
    payments.append({"name": name, "approved": False})
    return jsonify({"success": True})


# -------------------
# Scan API (fake results)
# -------------------
@app.route("/scan_skin", methods=["POST"])
def scan_skin():
    name = request.form.get("name")
    # Check if user is approved
    approved = any(p["name"] == name and p["approved"] for p in payments)
    if not approved:
        return jsonify({"error": "Payment not approved"}), 403

    # Fake AI scan results
    result = {
        "acne": f"{random.randint(5,20)}%",
        "wrinkles": f"{random.randint(3,10)}%",
        "hydration": f"{random.randint(60,90)}%",
        "elasticity": f"{random.randint(60,85)}%",
        "darkspots": f"{random.randint(1,8)}%"
    }

    advice = {
        "acne": "You may have acne-prone skin. Wash gently twice daily, avoid heavy oils.",
        "wrinkles": "Your skin may show early signs of wrinkles. Use moisturizer and sunscreen.",
        "hydration": "Hydration is good. Keep up your routine.",
        "elasticity": "Elasticity is low. Consider gentle massage and skin care routines.",
        "darkspots": "Dark spots are minimal."
    }

    return jsonify({"result": result, "advice": advice})


# -------------------
# Admin panel
# -------------------
@app.route("/admin", methods=["GET", "POST"])
def admin():
    if request.method == "POST":
        password = request.form.get("password")
        if password == "admin123":
            session["admin"] = True
            return redirect("/admin")

    if not session.get("admin"):
        return '''
        <h3>Admin Login</h3>
        <form method="post" action="/admin">
            <input type="password" name="password" placeholder="Admin password" required>
            <button type="submit">Login</button>
        </form>
        '''

    return render_template("admin.html", payments=payments)


# -------------------
# Approve payment
# -------------------
@app.route("/approve_payment", methods=["POST"])
def approve_payment():
    if not session.get("admin"):
        return "Unauthorized", 403
    name = request.form.get("name")
    for p in payments:
        if p["name"] == name:
            p["approved"] = True
            break
    return redirect("/admin")


# -------------------
# Logout
# -------------------
@app.route("/logout")
def logout():
    session.pop("admin", None)
    return redirect("/admin")


if __name__ == "__main__":
    app.run(debug=True)
