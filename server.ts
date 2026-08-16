import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // AI Chat Route
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { provider, model, messages, customApiKey, systemInstruction, image, images, fileAttachments } = req.body;

      // Consolidate all image inputs
      const allImages: Array<{ data: string; mimeType: string; name?: string }> = [];
      if (image && image.data && image.mimeType) {
        allImages.push(image);
      }
      if (Array.isArray(images)) {
        images.forEach((img: any) => {
          if (img && img.data && img.mimeType) {
            allImages.push(img);
          }
        });
      }

      // Format file attachments into text context
      let fileContext = "";
      if (Array.isArray(fileAttachments) && fileAttachments.length > 0) {
        fileContext = "\n\n=== ATTACHED FILES & ARTIFACTS ===\n" + 
          fileAttachments.map((f: any) => `--- File: ${f.name} ---\n${f.content || ""}\n--- End of ${f.name} ---`).join("\n\n") + 
          "\n=== END OF ATTACHED FILES ===\n\n";
      }

      if (provider === "deepseek") {
        const apiKey = customApiKey || process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
          return res.status(400).json({
            error: "DeepSeek API key is required. Please set it in Settings.",
          });
        }

        const formattedMessages = (messages || []).map((m: any) => ({
          role: m.role === "model" ? "assistant" : m.role,
          content: m.text || m.content || "",
        }));

        if (fileContext && formattedMessages.length > 0) {
          // Append file context to last user message
          const lastIndex = formattedMessages.length - 1;
          formattedMessages[lastIndex].content = fileContext + formattedMessages[lastIndex].content;
        }

        if (systemInstruction) {
          formattedMessages.unshift({
            role: "system",
            content: systemInstruction,
          });
        }

        const response = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model || "deepseek-chat",
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 4096,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          return res.status(response.status).json({ error: `DeepSeek API Error: ${errText}` });
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "No response received.";
        return res.json({ reply, model: model || "deepseek-chat" });
      }

      // Default: Google Gemini
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "Gemini API key is not configured. Please set your API key in Settings or environment.",
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const geminiModel = model || "gemini-2.5-flash";

      // Build conversation parts with multimodal images and text
      const promptParts: any[] = [];
      
      // Push all images as inlineData
      for (const img of allImages) {
        promptParts.push({
          inlineData: {
            data: img.data,
            mimeType: img.mimeType,
          },
        });
      }

      const lastUserMsg = (messages && messages.length > 0 ? messages[messages.length - 1].text : "") + fileContext;
      promptParts.push({ text: lastUserMsg });

      // Add prior context if multiple messages
      if (messages && messages.length > 1) {
        const historyText = messages.slice(0, -1).map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n\n');
        promptParts.unshift({ text: `Prior Conversation Context:\n${historyText}\n\n` });
      }

      const response = await ai.models.generateContent({
        model: geminiModel,
        contents: promptParts,
        config: systemInstruction ? { systemInstruction } : undefined,
      });

      const reply = response.text || "No response generated.";
      return res.json({ reply, model: geminiModel });
    } catch (err: any) {
      console.error("AI Error:", err);
      return res.status(500).json({
        error: err.message || "Failed to process AI request.",
      });
    }
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "APKForge AI" });
  });

  // Vite middleware in dev, Static in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`APKForge AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
