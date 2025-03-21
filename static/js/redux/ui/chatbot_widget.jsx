/*
Copyright (C) 2017 Semester.ly Technologies, LLC

Semester.ly is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Semester.ly is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
*/

import React from "react";
import { useAppSelector, useAppDispatch } from "../hooks";
import { chatbotActions } from "../state/slices/chatbotSlice";

/**
 * ChatbotWidget: Floating course assistant chatbot in the bottom right.
 */
const ChatbotWidget = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.chatbot.isOpen);

  const chatbotState = useAppSelector((state) => state.chatbot);
  console.log("Chatbot State:", chatbotState);

  return (
    <div className="chatbot-container">
      {!isOpen ? (
        <button className="chatbot-button" onClick={() => dispatch(chatbotActions.openChatbot())}>
          💬 Chat
        </button>
      ) : (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>Chatbot</span>
            <button onClick={() => dispatch(chatbotActions.closeChatbot())}>✖</button>
          </div>
          <div className="chatbot-body">
            <p>Chatbot is open</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
