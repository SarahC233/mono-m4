import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./InsuranceApp.module.css";
import BounceLoader from "react-spinners/BounceLoader";

function InsuranceApp() {
  const [chat, setChat] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const chatEndRef = useRef(null);

  const handleUserInputChange = (e) => setUserInput(e.target.value);

  const handleUserInputSubmit = async () => {
    setLoading(true);
    try {
     const response = await axios.post(
       `${process.env.REACT_APP_API_BASE_URL}/api/insurance`,
       {
         userInput,
         chat,
         questionCount,
       }
     );
      setChat([
        ...chat,
        { user: userInput },
        { tinnie: response.data.content },
      ]);
      setUserInput("");
      setQuestionCount(response.data.questionCount);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]); //useEffect hook scrolls to the bottom of the chat window when a new message is added

  return (
    <div className={styles.App}>
      <header className={styles.AppHeader}>
        <h1>Insurance Recommendation Chat</h1>

        <div className={styles.chat}>
          {chat.map((message, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                message.user ? styles.userMessage : styles.tinnieMessage
              }`}
            >
              {message.user && (
                <>
                  <div className={`${styles.bubble} ${styles.userBubble}`}>
                    {message.user}
                  </div>
                  <img
                    src="/user-img.jpg"
                    alt="User Avatar"
                    className={styles.avatar}
                  />
                </>
              )}
              {message.tinnie && (
                <>
                  <img
                    src="/AI-profile-img.jpg"
                    alt="AI Avatar"
                    className={styles.avatar}
                  />
                  <div className={`${styles.bubble} ${styles.tinnieBubble}`}>
                    {message.tinnie}
                  </div>
                </>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className={styles.inputContainer}>
          {loading && (
            <div className={styles.loaderContainer}>
              <BounceLoader color="#61dafb" />
            </div>
          )}
          <textarea
            className={styles.textArea}
            placeholder="Type your response here..."
            value={userInput}
            onChange={handleUserInputChange}
          />
          <button
            className={styles.submitButton}
            type="button"
            onClick={handleUserInputSubmit}
            disabled={loading}
          >
            Submit
          </button>
        </div>
      </header>
    </div>
  );
}

export default InsuranceApp;
