import { createSlice } from "@reduxjs/toolkit";

interface ChatbotState {
  isOpen: boolean;
}

const initialState: ChatbotState = {
  isOpen: false, // Default is closed
};

const chatbotSlice = createSlice({
  name: "chatbot",
  initialState,
  reducers: {
    toggleChatbot: (state) => {
      state.isOpen = !state.isOpen;
    },
    openChatbot: (state) => {
      state.isOpen = true;
    },
    closeChatbot: (state) => {
      state.isOpen = false;
    },
  },
});

export const chatbotActions = chatbotSlice.actions;
export default chatbotSlice.reducer;
