// const fetch = require("node-fetch"); //get rid of if fix doesn't work
// globalThis.fetch = fetch; // Polyfill fetch globally - get rid of if fix doesn't work
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



async function callGoogleGemini(promptContent, retryCount = 0) {
  try {
    const result = await model.generateContent(promptContent);
    const response = await result.response;
    const text = await response.text();
    return cleanResponse(text);
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

function cleanResponse(response) {
  const tinniePrefix = "Tinnie: ";
  if (response.startsWith(tinniePrefix)) {
    return response.slice(tinniePrefix.length).trim();
  }
  return response.trim();
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
  const currentYear = new Date().getFullYear();

  if (questionCount === 0) {
    promptContent = `You are Tinnie, an AI car insurance consultant. Start the interaction by introducing yourself and asking for user consent to ask personal questions.
    Example: "I’m Tinnie. I help you to choose an insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?".
    Here are the insurance products you can recommend:
    1. Mechanical Breakdown Insurance (MBI): This is for vehicles except for trucks and racing cars. Use the information in this link for mechanical breakdown insurance context: https://www.moneyhub.co.nz/mechanical-breakdown-insurance.html
    2. Comprehensive Car Insurance: This is available only for motor vehicles less than 10 years old as of ${currentYear}. Use the information in this link for comprehensive car insurance context: https://www.moneyhub.co.nz/car-insurance.html
    3. Third Party Car Insurance: This provides coverage for damage to other vehicles. Use the information in this link for third party car insurance context: https://www.moneyhub.co.nz/third-party-car-insurance.html`;
  } else {
    promptContent = `You are Tinnie, an AI car insurance consultant. Continue the interaction based on the user's input and ask the next relevant question to gather information for recommending the best insurance policy.
    Do not ask the user for direct answers about the insurance product they want, but instead ask questions that will help you recommend the best insurance policy.
    Consider the user's answers and ensure that your recommendations follow these rules:
    1. Mechanical Breakdown Insurance (MBI) is not available to trucks and racing cars.
    2. Comprehensive Car Insurance is only available to motor vehicles less than 10 years old as of ${currentYear}. Do not recommend comprehensive car insurance for cars more than 10 years old as of ${currentYear}.
    Here are the insurance products you can recommend:
    1. Mechanical Breakdown Insurance (MBI): This is for vehicles except for trucks and racing cars. Use the information in this link for mechanical breakdown insurance context: https://www.moneyhub.co.nz/mechanical-breakdown-insurance.html
    2. Comprehensive Car Insurance: This is available for motor vehicles less than 10 years old as of ${currentYear}. Use this link for information about comprehensive car insurance: https://www.moneyhub.co.nz/car-insurance.html
    3. Third Party Car Insurance: This provides coverage for damage to other vehicles. Use this link for information about third party car insurance: https://www.moneyhub.co.nz/third-party-car-insurance.html
    Ensure you check the vehicle's age against the current year ${currentYear} before recommending Comprehensive Car Insurance. Finally, recommend at least one suitable insurance product based on the user's answers.
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
