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
    const typedText1 = document.getElementById("typed-text-1");
    const typedText2 = document.getElementById("typed-text-2");

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
      { text: `Welcome operative`, speed: specialUser ? typeSpeed : 50, target: typedText1 },
      { text: ` ${username.toUpperCase()}.`, speed: specialUser ? typeSpeed : 800, target: typedText1 },
      { text: `\nClassified message received...`, speed: specialUser ? typeSpeed : 50, target: typedText1 },
      { text: "__DOC_SELECTOR__", speed: 0 }
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
              // Play beep sound when a mission briefing is selected
              const beep = document.getElementById("beep-sound");
              if (beep) {
                beep.currentTime = 0;
                beep.play();
              }
              // Show #button-box
              document.getElementById("button-box").classList.add("show");
              // Clear any previous mission text
              typedText2.innerHTML = "";
              // Hide action buttons again if they were shown
              const group = document.getElementById("button-group");
              group.style.display = "none";
              group.classList.remove("show");
              // Reveal second text box
              typedText2.style.display = "block";
              // Continue typing into second box
              typewriter(`> DECRYPTING...\n> DECRYPTING...\n> DECRYPTING...`,
                typedText2,
                specialUser ? typeSpeed : 200,
                () => {
                  typewriter(`\n\n> DECRYPTED\n\n`, typedText2, specialUser ? typeSpeed : 50, () => {
                    setTimeout(startMission, specialUser ? waitTime : 1500);
                  }, true);
                },
                true
              );
            });
            selector.appendChild(btn);
          }
        } else {
          typewriter(messages[index].text, messages[index].target, messages[index].speed, () => {
            typeMessages(index + 1);
          }, true);
        }
      }
    }

    async function startMission() {
      const missionData = await (await fetch(selectedDoc)).text();
      typewriter("\n" + missionData, typedText2, specialUser ? typeSpeed : 25, () => {
        // After mission data finishes, type final message
        typewriter(`\n\n> END OF MESSAGE`, typedText2, specialUser ? typeSpeed : 200, async () => {
          // Reveal button group after final message
          const group = document.getElementById("button-group");
          group.innerHTML = ""; 
          group.style.display = "flex";
          // Fetch the per-mission button file
          const buttonFile = selectedDoc.replace(".txt", "_buttons.txt");
          try {
            const resp = await fetch(buttonFile);
            const text = await resp.text();
          
            // Each line format: label:url
            const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
            lines.forEach(line => {
              const [label, url] = line.split(":");
              if (label && url) {
                const a = document.createElement("a");
                a.href = url.trim();
                a.textContent = label.trim();
                a.target = "_blank";
                group.appendChild(a);
              }
            });
          } catch (err) {
            console.error("Could not load button file", buttonFile, err);
          }
          // Fade in each button one after another
          setTimeout(() => {
          const links = Array.from(group.querySelectorAll("a"));
          links.forEach(link => {
            link.style.opacity = "0";
            link.style.transform = "scale(0.9)";
          });
          links.forEach((link, i) => {
            setTimeout(() => {
              link.style.transition = "opacity 1s ease, transform 0.5s ease";
              link.style.opacity = "1";
              link.style.transform = "scale(1)";
            }, (specialUser ? waitTime : i * 1250));
          });
            group.classList.add("show");
            group.scrollIntoView({ behavior: "smooth", block: "center" });
          }, (specialUser ? waitTime : 1250));
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