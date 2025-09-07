async function checkCredentials(username, password) {
  // Fetch users.txt
  const response = await fetch("users.txt");
  const text = await response.text();

  // Each line: user:pass
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

  for (let line of lines) {
    const [user, pass] = line.split(":");
    if (user === username && pass === password) {
      return true;
    }
  }
  return false;
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const ok = await checkCredentials(username, password);

  if (ok) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("secure-screen").style.display = "block";
  } else {
    document.getElementById("error").textContent = "ACCESS DENIED";
  }
});