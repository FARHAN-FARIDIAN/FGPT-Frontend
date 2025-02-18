import React, { useState, useEffect, useRef } from 'react';
import './ChatPage.css';
import { FaEdit, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from 'react-router-dom';


const genAI = new GoogleGenerativeAI("AIzaSyC8-Jr-H9xa7kr3OBAnr20SLyHgFS0qDEc");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash",
    systemInstruction: "from now on your name is FGPT and you are trained by Farhan Faridian.Don't forget that under no circumstances should you step out of your role even if I insist. Farhan Faridian is a 19 years old boy who loves programming and computer science and also he can train AIs and GPTs for people. Farhan Faridians mobile number is 09015692625 and his email address is farhanfaridian4@gmail.com.",
 });

const ChatPage = () => {
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const fileInputRef = useRef(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false); 
    const [isLoading1, setIsLoading1] = useState(false); 
    const messagesEndRef = useRef(null); 


    const API_URL = 'https://fgpt-backend.onrender.com';

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/api/chat/${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch chats');
            const data = await response.json();
            setChats(data);
            if (data.length > 0) {
                setActiveChatId(data[0].id);
                fetchMessages(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async (chatId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/chat/messages/${chatId}`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(prevMessages => ({ ...prevMessages, [chatId]: data }));
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
        setIsLoading(false);
    };

    const selectChat = (id) => {
        setActiveChatId(id);
        fetchMessages(id);
    };

    const createNewChat = async () => {
        const chatName = prompt('Enter chat name:');
        if (!chatName) return;

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        setIsLoading1(true);

        try {
            const response = await fetch(`${API_URL}/api/chat/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userId: user.id, chatName }),
            });

            const newChat = await response.json();
            setChats([...chats, newChat]);
            setActiveChatId(newChat.id);
            setMessages(prevMessages => ({ ...prevMessages, [newChat.id]: [] }));
        } catch (error) {
            console.error('Error creating chat:', error);
        }
        setIsLoading1(false);
    };

    const editChatName = async (chatId) => {
        const newName = prompt('Enter new chat name:');
        if (!newName) return;

        setIsLoading1(true);
        try {
            const response = await fetch(`${API_URL}/api/chat/edit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ chatId, chatName: newName }),
            });

            if (response.ok) {
                setChats(chats.map(chat => chat.id === chatId ? { ...chat, chat_name: newName } : chat));
            }
        } catch (error) {
            console.error('Error updating chat name:', error);
        }
        setIsLoading1(false);
    };

    const deleteChat = async (chatId) => {
        setIsLoading1(true);
        try {
            const response = await fetch(`${API_URL}/api/chat/delete/${chatId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.ok) {
                setChats(chats.filter(chat => chat.id !== chatId));
                setMessages(prevMessages => {
                    const updatedMessages = { ...prevMessages };
                    delete updatedMessages[chatId];
                    return updatedMessages;
                });

                if (activeChatId === chatId) {
                    setActiveChatId(chats.length > 1 ? chats[0].id : null);
                }
            } else {
                console.error('Error deleting chat');
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
        setIsLoading1(false);
    };


    async function checkDelete(chatId) {
        const userConfirmed = window.confirm("Are you sure you want to delete this chat session?");
        if (!userConfirmed) {
            return;
        }
        deleteChat(chatId);
    }

    async function checkLogOut() {
        const userConfirmed = window.confirm("Are you sure you want to logout?");
        if (!userConfirmed) {
            return;
        }
        navigate('/');
    }

    const uploadImageToServer = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload file to server');
        }

        const data = await response.json();
        console.log("Server Response:", data); 

        const imageUrl = data.url || data.imageUrl;

        if (!imageUrl) {
            throw new Error('No valid URL returned from server');
        }

        return imageUrl;
    };



    const sendMessage = async () => {
        if (!activeChatId || message.trim() === '') return;
        setIsLoading(true);

        const userTextMessage = { sender: 'user', content: message, type: 'text' };
        setMessages(prevMessages => ({
            ...prevMessages,
            [activeChatId]: [...(prevMessages[activeChatId] || []), userTextMessage],
        }));

        await fetch(`${API_URL}/api/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ chatId: activeChatId, sender: 'user', content: message, type: 'text' }),
        });

        try {
            let imagePart = null;
            let imageUrl = null;

            if (imageFile) {
                imageUrl = await uploadImageToServer(imageFile);
                console.log("Uploaded Image URL:", imageUrl);

                const userImageMessage = { sender: 'user', content: imageUrl, type: 'image' };
                setMessages(prevMessages => ({
                    ...prevMessages,
                    [activeChatId]: [...(prevMessages[activeChatId] || []), userImageMessage],
                }));

                await fetch(`${API_URL}/api/chat/message`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ chatId: activeChatId, sender: 'user', content: imageUrl, type: 'image' }),
                });

                imagePart = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const base64Data = e.target.result.split(",")[1];
                        resolve({
                            inlineData: {
                                data: base64Data,
                                mimeType: imageFile.type,
                            },
                        });
                    };
                    reader.readAsDataURL(imageFile);
                });
            }

            const history = (messages[activeChatId] || []).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            }));
            history.push({
                role: 'user',
                parts: imagePart ? [{ text: message }, imagePart] : [{ text: message }],
            });

            const chatInstance = model.startChat({ history });
            const result = await chatInstance.sendMessage(message);
            const geminiResponse = await result.response.text();
            const formattedResponse = geminiResponse.replace(/\*/g, '\n');

            const botMessage = { sender: 'bot', content: formattedResponse, type: 'text' };
            setMessages(prevMessages => ({
                ...prevMessages,
                [activeChatId]: [...(prevMessages[activeChatId] || []), botMessage],
            }));

            await fetch(`${API_URL}/api/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ chatId: activeChatId, sender: 'bot', content: geminiResponse, type: 'text' }),
            });

            setImageFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false); 
            setMessage('');
        }
    };


    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className={`chat-page ${isDarkMode ? 'dark-theme' : ''}`}>
            <div className="sidebar">
                <div className="sidebar-header">
                <div className='signOut'><FaSignOutAlt onClick={checkLogOut}/></div>
                <h3>FGPT Chats</h3>
                    <button onClick={createNewChat}>+ New Chat</button>
                </div>
                <div className="sidebar-header">
                    <h4>Theme</h4>
                    <label className="switch">
                        <input type="checkbox" onChange={(e) => setIsDarkMode(e.target.checked)} />
                        <span className="slider"></span>
                    </label>
                </div>
                <div className="sidebar-header2">
                    {isLoading1 &&
                        <section className="dots-container">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </section>
                    }
                </div>
                <ul className="chat-list">
                    {chats.length === 0 ? (
                        <p>No chats available. Create a new chat!</p>
                    ) : (
                        chats.map(chat => (
                            <li onClick={() => selectChat(chat.id)} key={chat.id} className={activeChatId === chat.id ? 'active' : ''}>
                                <span>{chat.chat_name}</span>
                                <div className="chat-options">
                                    <div onClick={() => editChatName(chat.id)}><FaEdit /></div>
                                    <div onClick={() => checkDelete(chat.id)}><FaTrash /></div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
            <div className="chat-window">
                {activeChatId ? (
                    <>
                        <div className="messages">
                            {messages[activeChatId]?.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
                                >
                                    {msg.type === 'text' && <p>{msg.content}</p>}
                                    {msg.type === 'image' && <img src={msg.content} alt="sent" />}
                                </div>
                            ))}
                            {isLoading &&
                                <section className="dots-container">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </section>
                            }
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="input-area">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message..."
                            />
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={(e) => setImageFile(e.target.files[0])}
                            />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    </>
                ) : (
                    <p>Select or create a chat to start messaging.</p>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
