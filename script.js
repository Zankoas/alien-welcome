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

// Auto-scroll helper
function autoScroll() {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth"
  });
}

// Typewriter function with append support
function typewriter(text, element, speed = 50, callback = null, append = false) {
  let i = 0;
  const existing = append ? element.innerHTML.replace(/<span class="cursor"><\/span>/, "") : "";

  function typing() {
    if (i < text.length) {
      element.innerHTML = existing + text.substring(0, i + 1) + '<span class="cursor"></span>';
      autoScroll();
      i++;
      setTimeout(typing, speed);
    } else {
      element.innerHTML = existing + text + '<span class="cursor"></span>';
      autoScroll();
      if (callback) callback();
    }
  }
  typing();
}

const documents = {
  "> --- USCM CLASSIFIED BRIEFING: OPERATION ICARUS ---": "operation_icarus.txt"
};
let selectedDoc = "mission.txt";

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

  // Detect special username
  const specialUser = (username.toLowerCase() === "shortcake");
  const typeSpeed = specialUser ? 2 : null;
  const waitTime = specialUser ? 10 : null;

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

    // Fade ins
    const accessGranted = document.querySelector("#secure-screen h2.alien-title");
    const logo = document.querySelector("#secure-screen img.logo");
    const typedTextElement = document.getElementById("typed-text");

    // Step 1: fade in logo
    setTimeout(() => {
      if (logo) logo.classList.add("show");
    }, specialUser ? waitTime : 500);

    // Step 2: pause, then fade in ACCESS GRANTED
    setTimeout(() => {
      if (accessGranted) accessGranted.classList.add("show");
    }, specialUser ? waitTime : 3000);

    // Step 3: pause again, then start typing text
    setTimeout(() => {
      // Multi-part intro messages
    const messages = [
      { text: `Welcome operative`, speed: specialUser ? typeSpeed : 50 },
      { text: ` ${username.toUpperCase()}.`, speed: specialUser ? typeSpeed : 800 },
      { text: `\nClassified message received...`, speed: specialUser ? typeSpeed : 50 },
      { text: "__DOC_SELECTOR__", speed: 0 }, // doc selector box
      { text: `\n\n> DECRYPTING...\n> DECRYPTING...\n> DECRYPTING...`, speed: specialUser ? typeSpeed : 200 },
      { text: `\n\n> DECRYPTED\n\n`, speed: specialUser ? typeSpeed : 50 }
    ];

    function typeMessages(index = 0) {
      if (index < messages.length) {
        if (messages[index].text === "__DOC_SELECTOR__") {
          // Show the selector box
          const selector = document.getElementById("doc-selector");
          selector.innerHTML = ""; // clear previous
          selector.style.display = "flex";
        
          // Add one button per doc
          for (const [label, file] of Object.entries(documents)) {
            const btn = document.createElement("button");
            btn.textContent = label;
            btn.addEventListener("click", () => {
              selectedDoc = file;
              selector.style.display = "none";
              // Show #button-box
              document.getElementById("button-box").classList.add("show");
              typeMessages(index + 1); // continue typing
            });
            selector.appendChild(btn);
          }
        } else {
          typewriter(messages[index].text, typedTextElement, messages[index].speed, () => {
            typeMessages(index + 1);
          }, true);
        }
      } else {
        // Pause before mission
        setTimeout(startMission, specialUser ? waitTime : 1500);
      }
    }

    async function startMission() {
      const missionData = await (await fetch(selectedDoc)).text();
      typewriter("\n" + missionData, typedTextElement, specialUser ? typeSpeed : 25, () => {
        // After mission data finishes, type final message
        typewriter(`\n\n> END OF MESSAGE`, typedTextElement, specialUser ? typeSpeed : 200, () => {
          // Reveal button group after final message
          const group = document.getElementById("button-group");
          group.style.display = "flex";
          setTimeout(() => {
            group.classList.add("show");
            // Smooth scroll to ensure buttons are visible
            group.scrollIntoView({ behavior: "smooth", block: "center" });
          }, specialUser ? waitTime : 500);
        }, true);
      }, true);
    }

    // Start multi-part intro typing
    typeMessages();

  }, specialUser ? waitTime : 6500); // start typing after ACCESS GRANTED

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