const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

// api key
const ai = new GoogleGenAI({
  apiKey: "AIzaSyCm-6KpKi4pD5kqQX8NdtjLoEKarKEg8dE"
});

const app = express();
app.use(cors());
app.use(express.json());

// query for the api
app.post("/api/ask", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    // api estructure
    console.log("Gemini RAW Response:");
    console.dir(result, { depth: null });

    // get the response text
    let responseText = "";
    if (
      result.candidates &&
      result.candidates[0] &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts[0] &&
      result.candidates[0].content.parts[0].text
    ) {
      responseText = result.candidates[0].content.parts[0].text;
    }

    // send the answer
    res.json({
      response: responseText.trim() || "(No response text)"
    });

  } catch (err) {
    console.error("❌ Gemini error:", err);
    res.status(500).json({ error: "Gemini API error" });
  }
});

// init the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
