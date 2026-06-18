const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Setup Gemini API 
// We will check if key exists, otherwise fallback to a default mock response to prevent crashing
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

if (apiKey) {
    try {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: "gemini-pro" }); 
    } catch (e) {
        console.error("Failed to initialize Gemini AI:", e);
    }
}

router.post("/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    if (!model) {
        // Advanced rules-based fallback engine (No API Key needed)
        const msg = message.toLowerCase();
        let riskLevel = "Low";
        let suggestedLawyerType = "General Practice";
        let reply = "I understand you are facing a legal issue. Let me point you in the right direction.";

        if (msg.match(/(fir|police|arrest|murder|assault|theft|jail|criminal|rape|kidnap)/i)) {
            riskLevel = "Critical";
            suggestedLawyerType = "Criminal Law";
            reply = "You are describing a serious criminal matter. This issue carries severe legal consequences (such as imprisonment or heavy fines). It is strongly advised that you do not speak to law enforcement without legal representation. You urgently need to consult a Criminal Defense Lawyer to protect your rights.";
        } else if (msg.match(/(divorce|child|custody|wife|husband|marriage|spouse|alimony|domestic)/i)) {
            riskLevel = "High";
            suggestedLawyerType = "Family Law";
            reply = "This involves sensitive family and domestic matters. Legal proceedings regarding marriage, divorce, or child custody can be emotionally and financially draining. A Family Lawyer can help mediate and represent your best interests in court to ensure a fair resolution.";
        } else if (msg.match(/(company|business|corporate|bankruptcy|trademark|startup|sue|contract|breach)/i)) {
            riskLevel = "Moderate";
            suggestedLawyerType = "Corporate Law";
            reply = "Your situation relates to business, contracts, or corporate governance. Any disruption here could lead to financial losses or liability. You should connect with a Corporate Lawyer to review any agreements and formulate a strategy to protect your business assets.";
        } else if (msg.match(/(tax|irs|audit|fbr|evasion)/i)) {
            riskLevel = "High";
            suggestedLawyerType = "Tax Law";
            reply = "Tax-related matters are strictly audited by the government. Irregularities can lead to severe penalties or tax fraud charges. I highly recommend consulting a Tax Expert immediately to guide you through compliance or negotiations with the tax authority.";
        } else if (msg.match(/(landlord|tenant|eviction|house|property|real estate|land|plot| कब्जा )/i)) {
            riskLevel = "Moderate";
            suggestedLawyerType = "Real Estate Law";
            reply = "Property disputes, ranging from tenant evictions to land ownership issues, require thorough documentation checks. A Real Estate Lawyer will evaluate your property deeds, lease agreements, and represent you against unlawful occupation or eviction.";
        } else {
            reply = "Thank you for sharing your situation. While I cannot precisely categorize this based on the details provided, it appears to be a civil or general legal issue. I strongly suggest consulting a general practitioner who can further guide you.";
        }

        return res.json({ 
            reply: reply,
            riskLevel: riskLevel,
            suggestedLawyerType: suggestedLawyerType
        });
    }

    try {
        const prompt = `
        You are an expert Legal AI Assessor for an app called "LegalConnect". 
        A user is asking you for preliminary legal advice. 
        Your job is strictly to:
        1. Evaluate their situation briefly and compassionately.
        2. Identify the possible risk level (Low, Moderate, High, Critical).
        3. Suggest the EXACT type of lawyer they should seek (e.g., Criminal Lawyer, Family Lawyer, Corporate Lawyer, etc.).
        
        Keep your response formatted exactly like this:
        [Response/Advice here - maximum 4-5 sentences]
        
        Risk Level: [Low/Moderate/High/Critical]
        Suggested Lawyer: [Type of Lawyer]
        
        User's situation: "${message}"
        `;

        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        
        // Parse the response to extract risk and lawyer type
        let reply = responseText;
        let riskLevel = "Unknown";
        let suggestedLawyerType = "General Lawyer";

        const riskMatch = responseText.match(/Risk Level:\s*(.+)/i);
        const lawyerMatch = responseText.match(/Suggested Lawyer:\s*(.+)/i);

        if (riskMatch) riskLevel = riskMatch[1].trim();
        if (lawyerMatch) suggestedLawyerType = lawyerMatch[1].trim();

        // Remove the risk and lawyer tags from the display reply
        reply = reply.replace(/Risk Level:.+/ig, "").replace(/Suggested Lawyer:.+/ig, "").trim();

        res.json({ reply, riskLevel, suggestedLawyerType });

    } catch (error) {
        console.error("AI chat error:", error);
        res.status(500).json({ error: "Failed to generate AI response. Please try again." });
    }
});

module.exports = router;
