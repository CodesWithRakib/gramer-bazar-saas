import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface ChatState {
  isWidgetOpen: boolean;
  activeConversationId: string | null;
}

const initialState: ChatState = {
  isWidgetOpen: false,
  activeConversationId: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    openChatWidget: (state, action: PayloadAction<string | null>) => {
      state.isWidgetOpen = true;
      if (action.payload) {
        state.activeConversationId = action.payload;
      }
    },
    closeChatWidget: (state) => {
      state.isWidgetOpen = false;
    },
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },
    toggleChatWidget: (state) => {
      state.isWidgetOpen = !state.isWidgetOpen;
    },
  },
});

export const {
  openChatWidget,
  closeChatWidget,
  setActiveConversation,
  toggleChatWidget,
} = chatSlice.actions;

export const selectIsWidgetOpen = (state: RootState) => state.chat.isWidgetOpen;
export const selectActiveConversationId = (state: RootState) => state.chat.activeConversationId;

export default chatSlice.reducer;
