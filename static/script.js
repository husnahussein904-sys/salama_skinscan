document.addEventListener("DOMContentLoaded", () => {
    const scanBtn = document.getElementById("scanBtn");
    const fileInput = document.getElementById("skinImage");
    const confirmPayBtn = document.getElementById("confirmPayBtn");
    const payerNameInput = document.getElementById("payerName");
    const resultsContainer = document.getElementById("results");

    let userApproved = false; // Will remain false until admin approves

    // Lock scan initially
    scanBtn.disabled = true;
    scanBtn.style.opacity = "0.5";

    // When user clicks NIMELIPA
    confirmPayBtn.addEventListener("click", async () => {
        const payerName = payerNameInput.value.trim();
        if (!payerName) {
            alert("Tafadhali ingiza jina lako kama linavyoonekana kwenye Halotel/HaloPesa.");
            return;
        }
        if (!fileInput.files.length) {
            alert("Tafadhali chagua picha kwanza.");
            return;
        }

        // Send name + image to backend
        const formData = new FormData();
        formData.append("name", payerName);
        formData.append("image", fileInput.files[0]);

        try {
            const response = await fetch("/scan_skin", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.pending) {
                alert("Malipo yamechukuliwa, tafadhali subiri uthibitisho wa msimamizi.");
                // Keep scan button locked
                scanBtn.disabled = true;
                scanBtn.style.opacity = "0.5";
            } else {
                userApproved = true;
                alert("Umeidhinishwa! Sasa unaweza kuchambua picha yako.");
                scanBtn.disabled = false;
                scanBtn.style.opacity = "1";
            }
        } catch (err) {
            console.error(err);
            alert("Kuna tatizo. Tafadhali jaribu tena.");
        }
    });
    
    // Scan button click
    scanBtn.addEventListener("click", async () => {
        if (!userApproved) {
            alert("Tafadhali subiri uthibitisho wa msimamizi kwanza.");
            return;
        }
        if (!fileInput.files.length) {
            alert("Tafadhali chagua picha kwanza.");
            return;
        }

        const formData = new FormData();
        formData.append("image", fileInput.files[0]);

        try {
            const response = await fetch("/scan_skin", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("Server error:", errText);
                alert("Tatizo la server. Angalia console.");
                return;
            }

            const data = await response.json();

            // Show results
            document.getElementById("acne").innerText = "Chunusi: " + data.result.acne;
            document.getElementById("wrinkles").innerText = "Mikunjo: " + data.result.wrinkles;
            document.getElementById("hydration").innerText = "Unyevu: " + data.result.hydration;
            document.getElementById("elasticity").innerText = "Unyumbufu: " + data.result.elasticity;
            document.getElementById("darkspots").innerText = "Madoa Meusi: " + data.result.darkspots;

            // Show advice
            document.querySelectorAll(".advice-box").forEach(el => el.remove());
            for (const key in data.advice) {
                const div = document.createElement("div");
                div.className = "advice-box";
                div.innerText = data.advice[key];
                resultsContainer.appendChild(div);
            }

        } catch (err) {
            console.error(err);
            alert("Kuna tatizo. Angalia console.");
        }
    });
});
const confirmPayBtn = document.getElementById("confirmPayBtn");
const scanBtn = document.getElementById("scanBtn");
const payerNameInput = document.getElementById("payerName");

confirmPayBtn.addEventListener("click", async () => {
  const payerName = payerNameInput.value.trim();
  if (!payerName) {
    alert("Tafadhali ingiza jina lako kabla ya kulipa.");
    return;
  }

  // Send name to backend
  try {
    const response = await fetch("/submit_payment", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ name: payerName })
    });

    if (response.ok) {
      alert(`Malipo yamechukuliwa kwa ${payerName}. Subiri uthibitisho wa admin.`);
      scanBtn.disabled = true;  // Keep scan locked until approved
    } else {
      alert("Tatizo limetokea. Jaribu tena.");
    }
  } catch (err) {
    console.error(err);
    alert("Tatizo la mtandao. Angalia console.");
  }
});


    // Send payment submission to server
    await fetch("/submit_payment", {
        method: "POST",
        body: new URLSearchParams({name: name})
    });

    // Disable scan button until admin approval
    scanBtn.disabled = true;
    alert("Tafadhali subiri uthibitisho wa msimamizi");

    // Check periodically if approved
    const interval = setInterval(async () => {
        const res = await fetch("/check_approval", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name: name})
        });
        const data = await res.json();
        if(data.approved){
            clearInterval(interval);
            alert("Umeidhinishwa! Sasa unaweza kuchambua ngozi yako.");
            scanBtn.disabled = false;
        }
    }, 5000); // check every 5 seconds

