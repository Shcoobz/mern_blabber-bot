import { Box, Avatar, Typography, Button, IconButton } from '@mui/material';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdSend } from 'react-icons/io';
import toast from 'react-hot-toast';

import { useAuth } from '../context/useAuth';
import ChatItem from '../components/chat/ChatItem';
import { NAVIGATION } from '../constants/navigation';
import {
  chatSideBarMsgs,
  chatWindowMsgs,
  chatToastMsgs,
} from '../constants/chatPageMsgs';
import {
  deleteUserChats,
  getUserChats,
  sendChatRequest,
} from '../helpers/api-communicator';

import '../css/pages/Chat.css';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

function Chat() {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  const navigate = useNavigate();
  const auth = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function getInitials(name: string) {
    if (!name) return '';

    const parts = name.split(' ');
    const initials =
      parts.length === 1 ? parts[0][0] : `${parts[0][0]}${parts[parts.length - 1][0]}`;
    return initials.toUpperCase();
  }

  function renderChatItems(chatMessages: Message[]) {
    return (
      <>
        {chatMessages.map((chat, index) => (
          <ChatItem content={chat.content} role={chat.role} key={index} />
        ))}
      </>
    );
  }

  async function handleSubmit() {
    const content = inputRef.current?.value as string;

    if (inputRef && inputRef.current) {
      inputRef.current.value = '';
    }

    const newMessage: Message = { role: 'user', content };
    setChatMessages((prev) => [...prev, newMessage]);

    const chatData = await sendChatRequest(content);
    setChatMessages([...chatData.chats]);
  }

  async function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }

  async function handleDeleteChats() {
    try {
      toast.loading(chatToastMsgs.deletingChats, { id: chatToastMsgs.deletingId });
      await deleteUserChats();
      setChatMessages([]);
      toast.success(chatToastMsgs.deleteChatsSuccess, { id: chatToastMsgs.deletingId });
    } catch (error) {
      console.log(error);
      toast.error(chatToastMsgs.deleteChatsError, { id: chatToastMsgs.deletingId });
    }
  }

  useLayoutEffect(() => {
    if (auth?.isLoggedIn && auth.user) {
      toast.loading(chatToastMsgs.loadingChats, { id: chatToastMsgs.loadingId });
      getUserChats()
        .then((data) => {
          setChatMessages([...data.chats]);
          toast.success(chatToastMsgs.loadChatsSuccess, { id: chatToastMsgs.loadingId });
        })
        .catch((err) => {
          console.log(err);
          toast.error(chatToastMsgs.loadChatsError, { id: chatToastMsgs.loadingId });
        });
    }
  }, [auth]);

  useEffect(() => {
    if (!auth?.isLoggedIn || !auth.user) {
      return navigate(NAVIGATION.LOGIN);
    }
  }, [auth, navigate]);

  useEffect(() => {
    const scrollableArea = messagesEndRef.current;

    if (scrollableArea) {
      scrollableArea.scrollTop = scrollableArea.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <Box className='chatContainer'>
      <Box className='sideBar'>
        <Box className='chatDetails'>
          <Avatar className='userAvatar'>{getInitials(auth!.user!.name)}</Avatar>
          <Typography className='paragraphOne'>{chatSideBarMsgs.title}</Typography>
          <Typography className='paragraphTwo'>{chatSideBarMsgs.description}</Typography>
          <Button className='clearConversationButton' onClick={handleDeleteChats}>
            {chatSideBarMsgs.clearConversationButton}
          </Button>
        </Box>
      </Box>

      <Box className='flexibleMainContent'>
        <Typography className='modelTitle'>{chatWindowMsgs.modelVersion}</Typography>
        <Box className='scrollableContentArea' ref={messagesEndRef}>
          {renderChatItems(chatMessages)}
        </Box>
        <div className='chatInputContainer'>
          <input
            ref={inputRef}
            type='text'
            className='chatInput'
            onKeyDown={handleKeyPress}
            placeholder={chatWindowMsgs.inputPlaceholder}
          />
          <IconButton onClick={handleSubmit} className='sendButton'>
            <IoMdSend />
          </IconButton>
        </div>
      </Box>
    </Box>
  );
}

export default Chat;
