'use client'

import React, { useState, useEffect, ChangeEvent } from 'react';
import io, { Socket } from 'socket.io-client';

const Chat: React.FC = () => {
    // State to store the messages
    const [messages, setMessages] = useState<string[]>([]);
    // State to store the current message
    const [currentMessage, setCurrentMessage] = useState<string>('');

    useEffect(() => {
        // Create a socket connection
        // const socket: Socket = io();
        const socket: Socket = io('http://localhost:3001');


        // Listen for incoming messages
        socket.on('message', (message: string) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Clean up the socket connection on unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    const sendMessage = () => {
        // Send the message to the server
        // Note: Make sure to handle the case when 'socket' is not defined
        // or consider using a state variable for 'socket'.
        // This is just a placeholder for demonstration purposes.
        // Replace it with the correct handling in your actual code.
        // const socket: Socket | undefined = ...;
        // if (socket) {
        //   socket.emit('message', currentMessage);
        // }

        setCurrentMessage('');
    };

    return (
        <div>
            {/* Display the messages */}
            {messages.map((message, index) => (
                <p key={index}>{message}</p>
            ))}

            {/* Input field for sending new messages */}
            <input
                type="text"
                value={currentMessage}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCurrentMessage(e.target.value)
                }
            />

            {/* Button to submit the new message */}
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default Chat;
