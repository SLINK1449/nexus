function setDefaultTheme() {
  const defaultTheme = "galaxy";
  document.body.className = defaultTheme;
}


const input = document.getElementById("input");
const output = document.getElementById("output");
const inputLine = document.getElementById("input-line");

let rainbowInterval = null;

// Oculta el input al inicio
inputLine.style.display = "none";

// Neofetch-style startup
function showStartup() {
  const logo = [
    "                 .88888888:.",
    "                88888888.88888.",
    "              .8888888888888888.",
    "              888888888888888888",
    "              88' _`88'_  `88888",
    "              88 88 88 88  88888",
    "              88_88_::_88_:88888",
    "              88:::,::,:::::8888",
    "              88`:::::::::'`8888",
    "             .88  `::::'    8:88.",
    "            8888            `8:888.",
    "          .8888'             `888888.",
    "         .8888:..  .::.  ...:'8888888:.",
    "        .8888.'     :'     `'::`88:88888",
    "       .8888        '         `.888:8888.",
    "      888:8         .           888:88888",
    "    .888:88        .:           888:88888:",
    "    8888888.       ::           88:888888",
    "    `.::.888.      ::          .88888888",
    "   .::::::.888.    ::         :::`8888'.:.",
    "  ::::::::::.888   '         .::::::::::::",
    "  ::::::::::::.8    '      .:8::::::::::::.",
    " .::::::::::::::.        .:888:::::::::::::",
    " :::::::::::::::88:.__..:88888:::::::::::'",
    "  `'.:::::::::::88888888888.88:::::::::'",
    "      `':::_:' -- '' -'-' `':_:::::'`"
  ];

  const info = [
    "OS: Nexus Linux v1.0",
    "Host: WebChat Emulator",
    "Shell: /bin/bash",
    "Resolution: 100x30",
    "Terminal: Nexus Interactive",
    "Theme: galaxy (default)",
    "Dev: Nexus AI Team ceo Slink1449(brian lizardo)",
  ];

  for (let i = 0; i < logo.length; i++) {
    const line = logo[i] + "   " + (info[i] || "");
    appendLine(line);
  }

  setTimeout(() => {
    appendLine("Type your message below:");
    inputLine.style.display = "flex";
    input.focus();
  }, 1000);
}

// Añadir texto al terminal
function appendLine(text) {
  const line = document.createElement("div");
  line.className = "line";
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

// Procesar comandos o enviar a la IA
async function generateResponse(text) {
  const parts = text.split(" ");
  const command = parts[0].toLowerCase();
  const arg = parts[1]?.toLowerCase();

  const validThemes = ["matrix", "dark", "light", "blue", "red", "yellow", "galaxy"];
  const allThemes = [...validThemes];
  const rainbowTheme = "rainbow";

  if (command === "theme") {
    if (arg === rainbowTheme) {
      appendLine("nexus@ai:~$ Activating rainbow mode...");
      clearInterval(rainbowInterval);
      let i = 0;
      rainbowInterval = setInterval(() => {
        document.body.className = allThemes[i];
        i = (i + 1) % allThemes.length;
      }, 1000);
      return;
    } else if (validThemes.includes(arg)) {
      clearInterval(rainbowInterval);
      rainbowInterval = null;
      document.body.className = arg;
      appendLine(`nexus@ai:~$ Theme changed to "${arg}"`);
      return;
    } else {
      appendLine(`nexus@ai:~$ Unknown theme "${arg}". Available: ${[...validThemes, "rainbow"].join(", ")}`);
      return;
    }
  }

  // Mostrar mensaje de "pensando"
  appendLine("nexus@ai:~$ Thinking...");

  try {
    const res = await fetch("http://localhost:3000/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text })
    });

    const data = await res.json();

    if (data.response && data.response.trim() !== "") {
      appendLine(`nexus@ai:~$ ${data.response}`);
    } else {
      appendLine("nexus@ai:~$ (AI responded with empty message)");
    }
  } catch (err) {
    console.error("❌ Fetch error:", err);
    appendLine("nexus@ai:~$ Error: Could not connect to AI server.");
  }
}

// Escuchar tecla Enter
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const userInput = input.value.trim();
    if (userInput !== "") {
      appendLine(`user@ai:~$ ${userInput}`);
      generateResponse(userInput);
      input.value = "";
    }
  }
});

setDefaultTheme();
showStartup();
