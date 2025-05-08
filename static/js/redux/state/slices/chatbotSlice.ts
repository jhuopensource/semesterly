import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  tool_output?: {
    data: {
      title: string;
      code: string;
      section?: string;
    }[];
    [key: string]: any;
  };
}

interface ChatbotSliceState {
  isOpen: boolean;
  messages: ChatMessage[];
  response: string | null; 
  loading: boolean;
  error: string | null;
}

const initialState: ChatbotSliceState = {
  isOpen: false,
  messages: [
    {
      id: "1",
      content: "Hello! I'm your Semesterly assistant. How can I help you today?",
      isBot: true,
    },
  ],
  response: null, 
  loading: false,
  error: null,
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
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setResponse: (state, action: PayloadAction<string>) => {
      state.response = action.payload;
    },
    chatbotQueryStart(state) {
      state.loading = true;
      state.error = null;
    },
    chatbotQuerySuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.response = action.payload;
    },
    chatbotQueryFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const chatbotActions = chatbotSlice.actions;
export default chatbotSlice.reducer;
