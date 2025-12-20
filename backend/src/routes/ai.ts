import express, { Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { z } from "zod";

const router = express.Router();

// Validate that user is a VIEWER
const viewerOnly = (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== "VIEWER") {
    return res.status(403).json({
      success: false,
      message: "Only viewers can access Ask AI",
    });
  }
  next();
};

// Request validation schema
const askAISchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
});

// System prompt for Gemini - constrains AI to entrepreneurship/learning topics
const SYSTEM_PROMPT = `You are an AI assistant specialized in entrepreneurship and learning. Your role is to help users with questions related to:
- Business and entrepreneurship concepts
- Startup strategies and growth
- Business models and revenue streams
- Marketing and sales strategies
- Leadership and management
- Financial literacy and business finance
- Career development and professional growth
- Educational topics and learning strategies
- Industry insights and trends
- Problem-solving for business challenges

IMPORTANT RULES:
1. Only answer questions related to entrepreneurship, business, learning, and professional development
2. If a question is NOT related to these topics, politely decline and redirect the user
3. Be helpful, concise, and practical in your responses
4. Provide actionable advice when possible
5. If you're unsure about something, be honest about it
6. Format your response clearly with proper line breaks
7. Use simple, easy-to-read formatting without excessive markdown
8. Keep responses concise and to the point
9. Use line breaks between paragraphs for readability

Example of declining: "I appreciate the question, but that's outside my area of expertise. I'm specifically designed to help with entrepreneurship and learning-related topics. Is there anything business or learning-related I can help you with?"`;

// POST /api/ai/ask - Ask AI a question
router.post("/ask", authenticateToken, viewerOnly, async (req: Request, res: Response) => {
  try {
    const { message } = askAISchema.parse(req.body);

    // Check if GEMINI_API_KEY is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "AI service is not configured",
      });
    }

    // Call Gemini API
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: {
            text: SYSTEM_PROMPT,
          },
        },
        contents: {
          parts: {
            text: message,
          },
        },
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Gemini API error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get response from AI",
      });
    }

    const data = await response.json() as any;
    let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";

    // Clean up markdown formatting for better display
    // Convert **text** to text (remove bold markers)
    aiResponse = aiResponse.replace(/\*\*(.*?)\*\*/g, "$1");
    
    // Convert *text* to text (remove italic markers)
    aiResponse = aiResponse.replace(/\*(.*?)\*/g, "$1");
    
    // Convert bullet points: * text → • text
    aiResponse = aiResponse.replace(/^\s*\*\s+/gm, "• ");
    
    // Clean up extra whitespace
    aiResponse = aiResponse.trim();

    res.json({
      success: true,
      data: {
        message: aiResponse,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
        errors: error.errors,
      });
    }

    console.error("Ask AI error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process your question",
    });
  }
});

export default router;
