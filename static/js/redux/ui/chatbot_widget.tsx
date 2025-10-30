import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { chatbotActions } from "../state/slices/chatbotSlice";
import { queryChatbot } from "../actions/chatbot_actions"; 
import { addOrRemoveCourse } from "../actions";
import SearchResult from "../ui/SearchResult";


const ChatbotWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.chatbot.isOpen);
  const messages = useAppSelector((state) => state.chatbot.messages);
  const botResponse = useAppSelector((state) => state.chatbot.response); 
  const [inputMessage, setInputMessage] = useState<string>("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message to the chat
    dispatch(
      chatbotActions.addMessage({
        id: Date.now().toString(),
        content: inputMessage,
        isBot: false,
      })
    );

    try {
      // Dispatch the queryChatbot action to interact with the backend
      await dispatch(queryChatbot(inputMessage));

    } catch (error) {
      console.error("Error while sending query:", error);

      // Add fallback message in case of error
      dispatch(
        chatbotActions.addMessage({
          id: (Date.now() + 1).toString(),
          content: "Sorry, I couldn't process your request right now.",
          isBot: true,
        })
      );
    }

    setInputMessage(""); // Clear the input field
  };

  return (
    <div className="chatbot-container">
      {!isOpen ? (
        <button
          className="chatbot-button"
          onClick={() => dispatch(chatbotActions.openChatbot())}
        >
          💬 Chat
        </button>
      ) : (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>Chatbot</span>
            <button onClick={() => dispatch(chatbotActions.closeChatbot())}>✖</button>
          </div>
          <div className="chatbot-body">
            <div className="chatbot-messages">
              {messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`chatbot-message ${message.isBot ? "chatbot-message-bot" : ""}`}
                >
                  <div className="chatbot-message-content">
                    {/* Main GPT message */}
                    <p>{message.content}</p>
                    {message.tool_output?.data?.length > 0 && (
                      <div className="chatbot-course-results">
                        {message.tool_output?.data?.length > 0 && (
                        <ul className="chatbot-course-results">
                          {message.tool_output.data.map((course: any, index: number) => (
                            <SearchResult key={course.id} course={course} position={index} />
                          ))}
                        </ul>
                      )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form className="chatbot-input-container" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="chatbot-input"
                placeholder="Type your message here..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button
                type="submit"
                className="chatbot-send-button"
                disabled={!inputMessage.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
