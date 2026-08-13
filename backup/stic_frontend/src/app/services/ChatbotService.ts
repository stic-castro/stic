// src/services/chatbotService.ts
import axios from 'axios';

export type ChatbotMessage = {
  recipient_id: string;
  text: string;
};

const CHATBOT_API_URL = '/api/chatbot';

export const sendMessageToChatbot = async (
  sender: string,
  message: string
): Promise<ChatbotMessage[]> => {
  try {
    const payload = { sender, message };
    const response = await axios.post<ChatbotMessage[]>(CHATBOT_API_URL, payload);

    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Formato de respuesta inválido del chatbot');
      return [];
    }
  } catch (error: any) {
    console.error('Error al enviar mensaje al chatbot:', error.message || error);
    return [];
  }
};
