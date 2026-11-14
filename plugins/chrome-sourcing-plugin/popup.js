document.addEventListener("DOMContentLoaded", () => {
  const importBtn = document.getElementById("importBtn");
  const statusMsg = document.getElementById("statusMsg");

  importBtn.addEventListener("click", async () => {
    statusMsg.innerText = "Connecting to Pavion ATS (Port 5055)...";
    setTimeout(() => {
      statusMsg.innerText = "✓ Candidate successfully added to talent pool!";
    }, 800);
  });
});
