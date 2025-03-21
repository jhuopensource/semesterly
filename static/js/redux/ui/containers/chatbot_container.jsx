import { connect } from "react-redux";
import ChatbotWidget from "../chatbot_widget";
import { chatbotActions } from "../../state/slices/chatbotSlice";

const mapStateToProps = (state) => ({
  chatbotOpen: state.chatbot.isOpen,
});

const mapDispatchToProps = {
  toggleChatbot: chatbotActions.toggleChatbot, // Ensure this action exists
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatbotWidget);
