const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── ResQNav Chat Engine — Domain-Restricted System Prompt ─── //
const SYSTEM_PROMPT = `You are the **ResQNav Chat Engine**, the AI verification core of ResQNav — a smart-city emergency routing platform.

**Your domain is STRICTLY limited to:**
- Road accidents, collisions, and vehicle incidents
- Potholes, road damage, and infrastructure hazards
- Road closures, diversions, and construction zones
- Traffic congestion, signal failures, and gridlock
- Emergency vehicle routing and priority corridors
- Weather conditions affecting road safety
- Road safety news and traffic advisories

**Response behavior:**
1. When the user sends an IMAGE: Analyze it carefully. Determine if it shows a valid road incident (accident, pothole, road closure, traffic jam, etc.). Respond with:
   - A verification status (Verified / Unverified / Inconclusive)
   - A confidence percentage (e.g. 94.3%)
   - A brief description of what you see
   - Recommended action (e.g. "Rerouting advised", "Emergency dispatch recommended")

2. When the user sends a TEXT query about roads/traffic/accidents: Respond helpfully with relevant information about the topic.

3. When the user asks about ANYTHING outside your domain (e.g. cooking, coding, general knowledge, personal questions): Politely decline and say:
   "I'm the ResQNav Chat Engine — I only handle road incidents, traffic data, and emergency routing. Please ask me about accidents, road conditions, or traffic updates."

**Formatting:**
- Be concise and professional
- Use bullet points for structured data
- Always sign off critical alerts with "— ResQNav Chat Engine"`;

/**
 * POST /api/chat
 * Body: { message: string }
 * File: optional image (multipart/form-data field "image")
 */
async function handleChat(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const userMessage = req.body.message || '';
    const imageFile = req.file; // multer file buffer

    // Build content parts
    const parts = [];

    // Always include the system instruction + user text
    parts.push({ text: SYSTEM_PROMPT + '\n\nUser message: ' + userMessage });

    // If an image was uploaded, convert to inline data
    if (imageFile) {
      parts.push({
        inlineData: {
          mimeType: imageFile.mimetype,
          data: imageFile.buffer.toString('base64'),
        },
      });
    }

    const result = await model.generateContent(parts);
    const response = result.response;
    const text = response.text();

    return res.json({
      reply: text,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return res.status(500).json({
      error: 'Failed to get response from ResQNav Chat Engine.',
      details: err.message,
    });
  }
}

module.exports = { handleChat };
