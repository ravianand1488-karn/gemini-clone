import { createContext, useState } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  // Typing animation
  const delayPara = (index, nextWord) => {
    setTimeout(() => {
      setResultData((prev) => prev + nextWord);
    }, 50 * index);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
    setResultData("");
    setInput("");
  };

  // Send message handler
  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);

    let response;

    if (prompt !== undefined) {
      response = await runChat(prompt);
      setRecentPrompt(prompt);
    } else {
      setPrevPrompts((prev) => [...prev, input]);
      setRecentPrompt(input);
      response = await runChat(input);
    }

    // ✅ Clean unwanted starting phrases like "Of course!" or "Sure!"
    response = response
      .replace(/^Of course[,!]*\s*/i, "")
      .replace(/^Sure[,!]*\s*/i, "")
      .replace(/^Here'?s.*?:\s*/i, "")
      .replace(/^Okay[,!]*\s*/i, "")
      .trim();

    // ✅ Format markdown-like bold text
    let responseArray = response.split("**");
    let newResponse = "";
    for (let i = 0; i < responseArray.length; i++) {
      if (i % 2 === 1) {
        newResponse += "<b>" + responseArray[i] + "</b>";
      } else {
        newResponse += responseArray[i];
      }
    }

    // ✅ Replace line breaks & single * with <br>
    let formattedResponse = newResponse
      .replace(/\*/g, "<br>")
      .replace(/\n/g, "<br>");

    // ✅ Animate word by word typing
    const words = formattedResponse.split(" ");
    words.forEach((word, index) => {
      delayPara(index, word + " ");
    });

    setLoading(false);
    setInput("");
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    newChat,
  };

  return (
    <Context.Provider value={contextValue}>
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;
