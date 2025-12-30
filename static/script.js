document.addEventListener("DOMContentLoaded", () => {
    const scanBtn = document.getElementById("scanBtn");
    const confirmPayBtn = document.getElementById("confirmPayBtn");
    const payerNameInput = document.getElementById("payerName");
    const fileInput = document.getElementById("skinImage");
    let lastResult = null;

    // Lock scan at start
    scanBtn.disabled = true;
    scanBtn.style.opacity = "0.5";

    // Thibitisha malipo
    confirmPayBtn.addEventListener("click", async () => {
        const payerName = payerNameInput.value.trim();
        if (!payerName) {
            alert("Tafadhali ingiza jina lako kabla ya kuthibitisha malipo.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", payerName);
            const res = await fetch("/confirm_payment", { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) {
                alert(`Malipo yamerekodiwa kwa ${payerName}. Subiri admin kuthibitisha.`);
                scanBtn.disabled = false;
                scanBtn.style.opacity = "1";
            }
        } catch (err) {
            console.error(err);
            alert("Kuna tatizo. Jaribu tena.");
        }
    });

    // Chambua ngozi
    scanBtn.addEventListener("click", async () => {
        const payerName = payerNameInput.value.trim();
        if (!payerName) {
            alert("Weka jina lako ili kuchambua.");
            return;
        }

        if (!fileInput.files.length) {
            alert("Tafadhali piga picha kwanza.");
            return;
        }

        const formData = new FormData();
        formData.append("image", fileInput.files[0]);
        formData.append("name", payerName);

        try {
            const response = await fetch("/scan_skin", { method: "POST", body: formData });
            const data = await response.json();
            if (data.error) {
                alert(data.error);
                return;
            }

            lastResult = data.result;

            document.getElementById("acne").innerText = "Chunusi: " + data.result.acne;
            document.getElementById("wrinkles").innerText = "Mikunjo: " + data.result.wrinkles;
            document.getElementById("hydration").innerText = "Unyevu: " + data.result.hydration;
            document.getElementById("elasticity").innerText = "Unyumbufu: " + data.result.elasticity;
            document.getElementById("darkspots").innerText = "Madoa Meusi: " + data.result.darkspots;

            // Onyesha ushauri
            document.querySelectorAll(".advice-box").forEach(el => el.remove());
            const adviceContainer = document.getElementById("results");
            const adviceTexts = data.advice;
            for (const key in adviceTexts) {
                const div = document.createElement("div");
                div.className = "advice-box";
                // Tafsiri kwa Kiswahili
                const swahiliAdvice = {
                    "You may have acne-prone skin. Wash gently twice daily, avoid heavy oils.":"Ngozi yako inaweza kuwa yenye chunusi. Osha uso kwa upole mara mbili kwa siku, epuka mafuta mazito.",
                    "Your skin may show early signs of wrinkles. Use moisturizer and sunscreen.":"Ngozi yako inaweza kuonyesha alama za mwanzo za mikunjo. Tumia moisturizer na sunscreen.",
                    "Hydration is good. Keep up your routine.":"Unyevu ni mzuri. Endelea na utunzaji wako.",
                    "Elasticity is low. Consider gentle massage and skin care routines.":"Unyumbufu wa ngozi ni mdogo. Fikiria massage ya upole na utunzaji wa ngozi.",
                    "Dark spots are minimal.":"Madoa meusi ni machache."
                };
                div.innerText = swahiliAdvice[adviceTexts[key]] || adviceTexts[key];
                adviceContainer.appendChild(div);
            }

        } catch (err) {
            console.error(err);
            alert("Kuna tatizo. Jaribu tena.");
        }
    });
});
