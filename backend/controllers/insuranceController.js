const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function callGoogleGemini(promptContent, retryCount = 0) {
  try {
    const result = await model.generateContent(promptContent);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error("Error communicating with Google Gemini API:", error);
    if (retryCount < 3) {
      console.log(`Retrying... (${retryCount + 1})`);
      await new Promise((r) => setTimeout(r, 5000));
      return callGoogleGemini(promptContent, retryCount + 1);
    } else {
      throw error;
    }
  }
}

exports.getInsuranceRecommendation = async (req, res) => {
  const { userInput, chat, questionCount = 0 } = req.body;

  const conversationHistory = chat
    .map(
      (entry) =>
        `${entry.user ? "User" : "Tinnie"}: ${entry.user || entry.tinnie}`
    )
    .join("\n");

  let promptContent;
  if (questionCount === 0) {
    promptContent = `You are Tinnie, an AI car insurance consultant. Start the interaction by introducing yourself and asking for user consent to ask personal questions.
    Example: "I’m Tinnie. I help you to choose an insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?".`;
  } else {
    promptContent = `You are Tinnie, an AI car insurance consultant. Continue the interaction based on the user's input and ask the next relevant question to gather information for recommending the best insurance policy. 
    Here is the conversation so far:\n${conversationHistory}\nUser: ${userInput}\nTinnie:`;
  }

  try {
    const apiResponse = await callGoogleGemini(promptContent);
    res.json({ content: apiResponse, questionCount: questionCount + 1 });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).send("Error communicating with AI API");
  }
};
