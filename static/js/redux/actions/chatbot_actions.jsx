import { getChatbotEndpoint } from '../constants/endpoints';
import { chatbotActions } from '../state/slices/chatbotSlice' 

export const queryChatbot = (query) => async (dispatch) => {
  dispatch(chatbotActions.chatbotQueryStart());

  try {
    const response = await fetch(getChatbotEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ query }), 
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chatbot response');
    }

    const data = await response.json();
    const toolOutput = data.tool_output || null;

    dispatch(chatbotActions.setResponse(data.response));

    dispatch(
      chatbotActions.addMessage({
        id: Date.now().toString(),
        content: data.response,
        tool_output: toolOutput,
        isBot: true,
      })
    );
  
    dispatch(chatbotActions.chatbotQuerySuccess(data.response));

  } catch (error) {
    dispatch(chatbotActions.chatbotQueryFailure(error.message));
  }
};
