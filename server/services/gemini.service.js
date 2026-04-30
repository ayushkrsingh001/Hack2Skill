/**
 * Gemini AI Service — Google Generative AI integration for smart chat.
 * Provides context-aware election guidance using Gemini Pro model.
 * @module services/gemini
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getCache, setCache } = require('../utils/cache');

/** @type {import('@google/generative-ai').GenerativeModel|null} */
let model = null;

/** Election-focused system instruction for Gemini */
const SYSTEM_INSTRUCTION = `You are VoteSathi, an expert AI assistant for Indian elections and voting.

Your role:
- Help Indian citizens understand the election process
- Guide users through voter registration (Form 6 on voters.eci.gov.in)
- Explain required documents (Voter ID/EPIC, Aadhaar, etc.)
- Provide election timeline information
- Help locate polling booths
- Answer questions about EVM, VVPAT, NOTA
- Explain eligibility criteria (18+ Indian citizen)

Rules:
- Always be accurate based on Election Commission of India (ECI) guidelines
- Give personalized advice based on user's age, state, and voter status
- Be concise but thorough — use bullet points and numbered lists
- If the user is a first-time voter, provide extra encouragement and detailed steps
- If the user is under 18, explain pre-registration options
- Always mention official sources: voters.eci.gov.in, Voter Helpline App
- Respond in the same language the user writes in (English or Hindi)
- Never discuss political parties, candidates, or who to vote for
- If asked something outside elections, politely redirect to election topics`;

/**
 * Initialize the Gemini model. Called once on first request.
 * @returns {import('@google/generative-ai').GenerativeModel|null}
 */
function getModel() {
  if (model) return model;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_INSTRUCTION
    });
    return model;
  } catch (_e) {
    return null;
  }
}

/**
 * Generate a chat response using Gemini AI.
 * Falls back to a static response if Gemini is unavailable.
 *
 * @param {string} message - User's message.
 * @param {object} [userContext={}] - User profile for personalized responses.
 * @returns {Promise<{reply: string, source: string}>} AI response with source indicator.
 */
async function generateResponse(message, userContext = {}) {
  const geminiModel = getModel();

  if (!geminiModel) {
    return {
      reply: getFallbackResponse(message),
      source: 'fallback'
    };
  }

  const cacheKey = `gemini:${JSON.stringify(userContext)}:${message}`;
  const cachedResponse = getCache(cacheKey);
  if (cachedResponse) {
    return { reply: cachedResponse, source: 'gemini (cached)' };
  }

  try {
    // Build context-aware prompt
    let contextPrompt = '';
    if (userContext.name || userContext.age || userContext.state) {
      contextPrompt = `\n[User Profile: `;
      if (userContext.name) contextPrompt += `Name: ${userContext.name}, `;
      if (userContext.age) contextPrompt += `Age: ${userContext.age}, `;
      if (userContext.state) contextPrompt += `State: ${userContext.state}, `;
      if (userContext.firstTimeVoter) contextPrompt += `First-time voter: Yes, `;
      if (userContext.language) contextPrompt += `Language: ${userContext.language}`;
      contextPrompt += `]\n`;
    }

    const fullPrompt = contextPrompt + message;

    const result = await geminiModel.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    const reply = text || getFallbackResponse(message);

    setCache(cacheKey, reply, 3600); // Cache for 1 hour

    return {
      reply,
      source: 'gemini'
    };
  } catch (_e) {
    return {
      reply: getFallbackResponse(message),
      source: 'fallback'
    };
  }
}

/**
 * Provides a keyword-based fallback response when Gemini is unavailable.
 * @param {string} message - The user's message.
 * @returns {string} A relevant static response.
 */
function getFallbackResponse(message) {
  const msg = message.toLowerCase();

  const responses = [
    { keywords: ['register', 'registration', 'form 6', 'enroll', 'पंजीकरण'], response: '📝 **Voter Registration:**\n\n1. Visit [voters.eci.gov.in](https://voters.eci.gov.in)\n2. Click "New Voter Registration"\n3. Fill Form 6 with your details\n4. Upload: passport photo, age proof, address proof\n5. Submit and save your reference number\n6. A BLO will verify your details (2-4 weeks)\n\n📱 You can also register via the **Voter Helpline App**.' },
    { keywords: ['document', 'id proof', 'aadhaar', 'documents', 'दस्तावेज'], response: '📄 **Documents Required:**\n\n**For Registration (Form 6):**\n- Passport-size photo\n- Age proof: Birth certificate / Class 10 marksheet / Aadhaar\n- Address proof: Aadhaar / Utility bill / Bank passbook\n\n**At the Polling Booth (any one):**\n- Voter ID Card (EPIC) — preferred\n- Aadhaar Card\n- Passport / Driving License / PAN Card\n- MNREGA Job Card\n\n💡 Any of 12 approved photo IDs are accepted.' },
    { keywords: ['eligible', 'age', 'who can vote', 'criteria', 'पात्रता'], response: '✅ **Voter Eligibility:**\n\n- Must be an **Indian citizen**\n- Must be **18 years or older** (as of Jan 1 of qualifying year)\n- Must be a **resident** of the constituency\n- Must not be disqualified under any law\n\n💡 You can register before turning 18 — it activates on the qualifying date.' },
    { keywords: ['vote', 'how to vote', 'voting', 'evm', 'vvpat', 'वोट'], response: '🗳️ **Voting Day Guide:**\n\n1. Arrive at your polling booth (7 AM - 6 PM)\n2. Stand in the correct queue\n3. Show your Voter ID or approved photo ID\n4. Get indelible ink on your left index finger\n5. Press the button next to your candidate on the EVM\n6. Verify your choice on VVPAT (7 seconds)\n7. Exit quietly — do not photograph your vote\n\n🎉 Congratulations, you\'ve exercised your democratic right!' },
    { keywords: ['booth', 'polling station', 'where', 'location', 'बूथ'], response: '📍 **Find Your Polling Booth:**\n\n1. Visit [voters.eci.gov.in](https://voters.eci.gov.in)\n2. Click "Search in Electoral Roll"\n3. Enter your name or EPIC number\n4. Your booth details will be displayed\n\n📱 Download the **Voter Helpline App** for on-the-go booth location.\n\n💡 Use our **Booth Finder** tab to see polling stations on the map!' },
    { keywords: ['timeline', 'schedule', 'when', 'date', 'समयरेखा'], response: '📅 **Election Process Timeline:**\n\n1. 📢 Election Announcement & Model Code of Conduct\n2. 📝 Nominations Filed\n3. 🔍 Scrutiny of Nominations\n4. 🚫 Withdrawal of Candidatures\n5. 📣 Campaign Period (stops 48 hrs before polling)\n6. 🗳️ Polling Day\n7. 📦 EVMs Sealed & Secured\n8. 📊 Vote Counting\n9. 🏆 Results Declared\n10. 🏛️ Government Formation' },
    { keywords: ['nota', 'none of the above'], response: '🚫 **NOTA (None Of The Above):**\n\nNOTA is the last option on every EVM. If you don\'t want to vote for any candidate, you can press NOTA. Your vote is still counted and recorded, but it doesn\'t go to any candidate.' },
    { keywords: ['hello', 'hi', 'hey', 'help', 'नमस्ते', 'मदद'], response: '🙏 **Namaste! Welcome to VoteSathi!**\n\nI can help you with:\n- 📝 Voter registration process\n- 📄 Required documents\n- ✅ Eligibility criteria\n- 🗳️ How to vote on election day\n- 📍 Finding your polling booth\n- 📅 Election timeline\n\nWhat would you like to know?' }
  ];

  for (const r of responses) {
    if (r.keywords.some(k => msg.includes(k))) {
      return r.response;
    }
  }

  return '🤔 I can help you with voter registration, eligibility, required documents, finding your polling booth, and the voting process. What would you like to know about Indian elections?';
}

module.exports = { generateResponse, getFallbackResponse };
