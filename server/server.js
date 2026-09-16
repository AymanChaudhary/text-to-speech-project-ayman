const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const ttsRoutes = require("./routes/ttsRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "client/build")));

// Routes
app.use("/api/tts", ttsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "TTS Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// Download endpoint - Generates MP3 audio from text
app.post("/api/tts/download", async (req, res) => {
  try {
    const { text, language = "en", speed = 1 } = req.body;

    // Validation
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required and cannot be empty",
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Text exceeds maximum length of 5000 characters",
      });
    }

    // Split text into chunks (Google TTS limit is ~200 characters per request)
    const chunks = [];
    let currentChunk = "";
    const words = text.split(" ");

    for (const word of words) {
      if ((currentChunk + " " + word).length > 190) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = word;
      } else {
        currentChunk += " " + word;
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());

    console.log(`Generating audio for ${chunks.length} chunks...`);

    // Fetch audio for each chunk
    const audioBuffers = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const encodedText = encodeURIComponent(chunk);

      // Google Translate TTS URL (free, no API key required)
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${language}&client=tw-ob&ttsspeed=${speed}`;

      const headers = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: "https://translate.google.com/",
        Accept: "audio/mpeg, audio/*; q=0.9",
      };

      try {
        const response = await axios.get(url, {
          headers,
          responseType: "arraybuffer",
          timeout: 10000,
        });

        if (response.status === 200) {
          audioBuffers.push(Buffer.from(response.data));
        }

        // Add delay between requests to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } catch (chunkError) {
        console.error(`Error fetching chunk ${i + 1}:`, chunkError.message);
      }
    }

    if (audioBuffers.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate audio. Please try again.",
      });
    }

    // Concatenate all audio buffers
    const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.length, 0);
    const combinedBuffer = Buffer.concat(audioBuffers, totalLength);

    // Set headers for audio download
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": totalLength,
      "Content-Disposition": `attachment; filename="speech-${Date.now()}.mp3"`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache",
    });

    // Send audio file
    res.send(combinedBuffer);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while generating audio",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Alternative: Simple test endpoint without chunking (for short text)
app.post("/api/tts/download-simple", async (req, res) => {
  try {
    const { text, language = "en" } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    // For short text (< 200 chars)
    if (text.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Use /api/tts/download for longer text",
      });
    }

    const encodedText = encodeURIComponent(text);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${language}&client=tw-ob`;

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Referer: "https://translate.google.com/",
      Accept: "audio/mpeg",
    };

    const response = await axios.get(url, {
      headers,
      responseType: "arraybuffer",
      timeout: 10000,
    });

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": response.data.length,
      "Content-Disposition": `attachment; filename="speech.mp3"`,
    });

    res.send(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate audio",
    });
  }
});

// Serve React app in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Download endpoint: POST /api/tts/download`);
});
