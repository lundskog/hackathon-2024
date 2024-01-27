"use client";
import styles from "./page.module.css";
import { io, type Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import ChatPage from "@/components/chat/page";

export default function Home () {
    const [showChat, setShowChat] = useState(false);
    const [userName, setUserName] = useState("");
    const [showSpinner, setShowSpinner] = useState(false);
    const [roomId, setroomId] = useState("");

    // Declare socket as a state variable
    const [socket, setSocket] = useState<Socket | null>(null);

    // Function to initialize socket connection
    const initSocket = async () => {
        if (!socket) {
            const newSocket: any = io("http://localhost:3001");

            // Create a promise that resolves when the 'connect' event is received
            const connectPromise = new Promise<void>((resolve) => {
                newSocket.on('connect', () => {
                    console.log('Socket connected!');
                    resolve();
                });
            });

            setSocket(newSocket);

            // Wait for the connection to be established before continuing
            await connectPromise;
            return newSocket;
        }
        return socket;
    };
    useEffect(() => {
        handleJoin()
    }, [])


    const handleJoin = async () => {
        const currentSocket = await initSocket();

        if (currentSocket.connected && userName !== "" && roomId !== "") {
            console.log(userName, "userName", roomId, "roomId");
            currentSocket.emit("join_room", roomId);
            setShowSpinner(true);
            // You can remove this setTimeout and add your own logic
            setTimeout(() => {
                setShowChat(true);
                setShowSpinner(false);
            }, 2000);
        } else {
            alert("Please fill in Username and Room Id");
        }
    };
    return (
        <div>
            <div
                className={styles.main_div}
                style={{ display: showChat ? "none" : "" }}
            >
                <input
                    className={styles.main_input}
                    type="text"
                    placeholder="Username"
                    onChange={(e) => setUserName(e.target.value)}
                    disabled={showSpinner}
                />
                <input
                    className={styles.main_input}
                    type="text"
                    placeholder="room id"
                    onChange={(e) => setroomId(e.target.value)}
                    disabled={showSpinner}
                />
                <button className={styles.main_button} onClick={() => handleJoin()}>
                    {!showSpinner ? (
                        "Join"
                    ) : (
                        <div className={styles.loading_spinner}></div>
                    )}
                </button>
            </div>
            <div style={{ display: !showChat ? "none" : "" }}>
                {socket ? (
                    <ChatPage socket={socket} roomId={roomId} username={userName} />
                ) : (
                    <p>loading</p>
                )}
            </div>
        </div>
    );
}