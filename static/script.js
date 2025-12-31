document.addEventListener("DOMContentLoaded", () => {
    const confirmPayBtn = document.getElementById("confirmPayBtn");
    const scanBtn = document.getElementById("scanBtn");
    const payerNameInput = document.getElementById("payerName");
    const fileInput = document.getElementById("skinImage");
    const resultsDiv = document.getElementById("results");

    scanBtn.disabled = true;

    const labels = {
        acne: "Chunusi",
        wrinkles: "Mikunjo",
        hydration: "Unyevu",
        elasticity: "Unyumbufu",
        darkspots: "Madoa Meusi"
    };

    confirmPayBtn.addEventListener("click", async () => {
        const name = payerNameInput.value.trim();
        if(!name){ alert("Ingiza jina"); return; }

        try {
            const res = await fetch("/submit_payment", {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({name})
            });
            if(res.ok){
                alert("✅ Malipo yamerekodiwa. Subiri admin kuidhinisha.");
                scanBtn.disabled = false;
            } else {
                alert(await res.text());
            }
        } catch(err){
            console.error(err);
            alert("❌ Tatizo la mtandao");
        }
    });

    scanBtn.addEventListener("click", async () => {
        const name = payerNameInput.value.trim();
        if(!name){ alert("Ingiza jina"); return; }
        if(!fileInput.files.length){ alert("Chagua picha"); return; }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("image", fileInput.files[0]);

        try {
            const res = await fetch("/scan_skin", { method: "POST", body: formData });
            const data = await res.json();
            console.log("Scan response:", data);

            if(data.pending){
                alert("⏳ " + data.message);
                return;
            }

            const r = data.result;
            const advice = data.advice;
            resultsDiv.innerHTML = `
                <div class="result-box">
                    <strong>${labels.acne}:</strong> ${r.acne}<br>
                    <em>${advice.acne}</em><br><br>

                    <strong>${labels.wrinkles}:</strong> ${r.wrinkles}<br>
                    <em>${advice.wrinkles}</em><br><br>

                    <strong>${labels.hydration}:</strong> ${r.hydration}<br>
                    <em>${advice.hydration}</em><br><br>

                    <strong>${labels.elasticity}:</strong> ${r.elasticity}<br>
                    <em>${advice.elasticity}</em><br><br>

                    <strong>${labels.darkspots}:</strong> ${r.darkspots}<br>
                    <em>${advice.darkspots}</em>
                </div>
            `;
        } catch(err){
            console.error(err);
            alert("❌ Tatizo wakati wa scan");
        }
    });
});
