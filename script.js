function setDefaultTheme() {
  const defaultTheme = "galaxy";
  document.body.className = defaultTheme;
}


const input = document.getElementById("input");
const output = document.getElementById("output");
const inputLine = document.getElementById("input-line");

let rainbowInterval = null;
let chatHistory = [];

// --- Funciones del Historial de Chat ---
function loadChatHistory() {
  const savedHistory = localStorage.getItem('nexusChatHistory');
  if (savedHistory) {
    chatHistory = JSON.parse(savedHistory);
    // No renderizar aquí directamente, showStartup se encargará o se llamará después
  }
}

function saveChatHistory() {
  localStorage.setItem('nexusChatHistory', JSON.stringify(chatHistory));
}

function appendMessageToOutput(message) {
  const line = document.createElement("div");
  line.classList.add("line");

  let prefix = "";
  if (message.sender === "user") {
    prefix = "user@ai:~$ ";
    line.classList.add("user-message");
  } else if (message.sender === "ai") {
    prefix = "nexus@ai:~$ ";
    line.classList.add("ai-message");
  } else if (message.sender === "system") {
    prefix = "system:~$ ";
    line.classList.add("system-message");
  }

  line.style.whiteSpace = "pre-wrap";
  line.textContent = prefix + message.text;

  // Timestamp opcional (se podría añadir en una fase posterior si se desea)
  // if (message.timestamp) {
  //   const timestampEl = document.createElement("span");
  //   timestampEl.className = "timestamp";
  //   timestampEl.textContent = new Date(message.timestamp).toLocaleTimeString();
  //   line.appendChild(timestampEl); // Requeriría CSS adicional para posicionar
  // }

  output.appendChild(line);
  output.scrollTop = output.scrollHeight; // Auto-scroll
}
// --- Fin Funciones del Historial de Chat ---

// Oculta el input al inicio
inputLine.style.display = "none";

// Neofetch-style startup
function showStartup() {
  // Primero, renderizar el historial si existe
  if (chatHistory.length > 0) {
    chatHistory.forEach(msg => appendMessageToOutput(msg));
  }

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

  input.disabled = true; // Deshabilitar input
  let thinkingLine = document.createElement("div");
  thinkingLine.className = "line ai-message temp-thinking"; // Clase para identificarlo
  thinkingLine.style.whiteSpace = "pre-wrap";

  let thinkingPrefix = "nexus@ai:~$ ";
  thinkingLine.textContent = thinkingPrefix + "Thinking...";
  output.appendChild(thinkingLine);
  output.scrollTop = output.scrollHeight;

  // Animación simple para "Thinking..."
  let dots = 0;
  const thinkingAnimation = setInterval(() => {
    dots = (dots + 1) % 4;
    thinkingLine.textContent = thinkingPrefix + "Thinking" + ".".repeat(dots);
  }, 500);

  try {
    const res = await fetch("http://localhost:3000/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text })
    });

    const data = await res.json();

    clearInterval(thinkingAnimation); // Detener animación
    if (thinkingLine && thinkingLine.parentNode === output) {
      output.removeChild(thinkingLine); // Eliminar el mensaje "Thinking..."
    }

    const aiResponseText = (data.response && data.response.trim() !== "") ? data.response : "(AI responded with empty message)";
    const aiMessage = {
      id: `msg_${Date.now()}_ai`,
      sender: "ai",
      text: aiResponseText,
      timestamp: new Date().toISOString()
    };
    // Solo añadir la respuesta real al historial persistente
    chatHistory.push(aiMessage);
    saveChatHistory();
    appendMessageToOutput(aiMessage);

  } catch (err) {
    console.error("❌ Fetch error:", err);
    clearInterval(thinkingAnimation); // Detener animación
    if (thinkingLine && thinkingLine.parentNode === output) {
      output.removeChild(thinkingLine); // Eliminar el mensaje "Thinking..."
    }
    const errorMessage = {
      id: `msg_${Date.now()}_system_error`,
      sender: "system",
      text: "Error: Could not connect to AI server.",
      timestamp: new Date().toISOString()
    };
    chatHistory.push(errorMessage);
    saveChatHistory();
    appendMessageToOutput(errorMessage);
  } finally {
    input.disabled = false; // Habilitar input
    input.focus(); // Devolver foco
  }
}

// Escuchar tecla Enter y auto-ajuste de altura para el textarea
const initialRows = 1;
const maxHeightLines = 5; // Máximo 5 líneas antes de scroll
input.rows = initialRows;

input.addEventListener("input", () => {
  // Resetear altura para recalcular correctamente si se borra texto
  input.style.height = "auto";
  // Calcular la altura de una sola línea para determinar el max-height
  // Esto asume que line-height está definido y es consistente.
  const computedStyle = getComputedStyle(input);
  const singleRowHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.4; // fallback si lineHeight es 'normal'

  const maxHeight = singleRowHeight * maxHeightLines;
  let scrollHeight = input.scrollHeight;

  if (scrollHeight > maxHeight) {
    input.style.height = maxHeight + "px";
    input.style.overflowY = "auto";
  } else {
    input.style.height = scrollHeight + "px";
    input.style.overflowY = "hidden";
  }
});

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault(); // Prevenir salto de línea por defecto en textarea
    const userInputText = input.value.trim();
    if (userInputText !== "") {
      const userMessage = {
        id: `msg_${Date.now()}_user`,
        sender: "user",
        text: userInputText,
        timestamp: new Date().toISOString()
      };
      chatHistory.push(userMessage);
      saveChatHistory();
      appendMessageToOutput(userMessage);

      generateResponse(userInputText);
      input.value = "";
      // Resetear altura del textarea
      input.style.height = "auto";
      input.rows = initialRows;
      input.style.overflowY = "hidden";
      input.focus(); // Devolver el foco
    }
  }
  // Shift+Enter o Ctrl+Enter permitirán el comportamiento por defecto del textarea (salto de línea),
  // y el evento "input" se encargará de ajustar la altura.
});

setDefaultTheme();
loadChatHistory(); // Cargar historial antes de mostrar el startup
showStartup();
