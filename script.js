async function checkCredentials(username, password) {
  // Fetch users.txt
  const response = await fetch("users.txt");
  const text = await response.text();

  // Each line: user:pass
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

  for (let line of lines) {
    const [user, pass] = line.split(":");
    if (user.toLowerCase() === username.toLowerCase() && pass === password) {
      return true;
    }
  }
  return false;
}

// Typewriter function with append support
function typewriter(text, element, speed = 50, callback = null, append = false) {
  let i = 0;
  const existing = append ? element.innerHTML.replace(/<span class="cursor"><\/span>/, "") : "";

  function typing() {
    if (i < text.length) {
      element.innerHTML = existing + text.substring(0, i + 1) + '<span class="cursor"></span>';
      i++;
      setTimeout(typing, speed);
    } else {
      element.innerHTML = existing + text + '<span class="cursor"></span>';
      if (callback) callback();
    }
  }
  typing();
}

// Load mission text file
async function fetchMissionData() {
  const response = await fetch("mission.txt");
  return await response.text();
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("error");

  const ok = await checkCredentials(username, password);

  if (ok) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("secure-screen").style.display = "block";

    // Play success sounds
    const hum = document.getElementById("ambient-hum");
    const beep = document.getElementById("beep-sound");
    if (hum) {
      hum.volume = 0.4;
      hum.play();
    }
    if (beep) {
      beep.play();
    }

    // Fade in the logo after ACCESS GRANTED appears
    setTimeout(() => {
      const logo = document.querySelector("#secure-screen img.logo");
      if (logo) {
        logo.classList.add("show");
      }
    }, 1200);

    // First typed message
    const message = `Welcome operative ${username}.\nEncrypted message as follows...\n\nDECRYPTING...DECRYPTING...DECRYPTING...\n\nDECRYPTED!\n\n\n`;

    const typedTextElement = document.getElementById("typed-text");

    typewriter(message, typedTextElement, 25, async () => {
      // Fetch mission.txt and append it
      const missionData = await fetchMissionData();
      typewriter("\n" + missionData, typedTextElement, 2.5, () => {
        typewriter(`\n\n> END TRANSMISSION`, typedTextElement, 200, () => {
          // Reveal button group after mission data
          const group = document.getElementById("button-group");
          group.style.display = "flex";
          setTimeout(() => group.classList.add("show"), 1000);
        }, true);
      }, true);
    });
  } else {
    errorEl.textContent = "ACCESS DENIED";
    errorEl.classList.add("flash-error");

    // Play failure alarm
    const alarm = document.getElementById("alarm-sound");
    if (alarm) {
      alarm.volume = 0.7;
      alarm.play();
    }
  }
});

// Remove flashing effect when user starts typing again
document.getElementById("username").addEventListener("input", () => {
  const errorEl = document.getElementById("error");
  errorEl.classList.remove("flash-error");
  errorEl.textContent = "";
});
document.getElementById("password").addEventListener("input", () => {
  const errorEl = document.getElementById("error");
  errorEl.classList.remove("flash-error");
  errorEl.textContent = "";
});

// Beep + delay on link clicks
document.querySelectorAll(".button-group a").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const beep = document.getElementById("beep-sound");
    if (beep) {
      beep.currentTime = 0;
      beep.play();
    }
    setTimeout(() => {
      window.open(link.href, "_blank");
    }, 400);
  });
});