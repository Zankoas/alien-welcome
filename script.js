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

function typewriter(text, element, speed = 50, callback = null) {
  let i = 0;
  function typing() {
    if (i < text.length) {
      element.innerHTML = text.substring(0, i + 1) + '<span class="cursor"></span>';
      i++;
      setTimeout(typing, speed);
    } else {
      element.innerHTML = text + '<span class="cursor"></span>';
      if (callback) callback();
    }
  }
  typing();
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const ok = await checkCredentials(username, password);

  if (ok) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("secure-screen").style.display = "block";

    // Play success sounds
    const hum = document.getElementById("ambient-hum");
    const beep = document.getElementById("beep-sound");
    hum.volume = 0.4;
    hum.play();
    beep.play();

    // Typewriter effect
    const message = `Welcome, operative ${username}.
Classified mission data follows...
“Building Better Worlds.”`;

    const typedTextElement = document.getElementById("typed-text");
    typewriter(message, typedTextElement, 40, () => {
      const group = document.getElementById("button-group");
      group.style.display = "flex";
      setTimeout(() => group.classList.add("show"), 100);
    });
  } else {
    document.getElementById("error").textContent = "ACCESS DENIED";

    // Play failure alarm
    const alarm = document.getElementById("alarm-sound");
    alarm.volume = 0.7;
    alarm.play();
  }
});