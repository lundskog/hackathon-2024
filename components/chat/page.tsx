"use client";
import React, { useEffect, useState } from "react";
import style from "./chat.module.css";
import { Socket } from "socket.io-client";

type ChatMessage = {
  user: string;
  msg: string;
  time: string;
};

const ChatPage = ({
  socket,
  username,
  roomId,
}: {
  socket: Socket;
  username: string;
  roomId: string;
}) => {
  const [currentMsg, setCurrentMsg] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);

  const sendData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentMsg !== "") {
      const msgData = {
        roomId,
        user: username,
        msg: currentMsg,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_msg", msgData);
      setCurrentMsg("");
    }
  };

  useEffect(() => {
    socket.on("receive_msg", (data: ChatMessage) => {
      setChat((pre) => [...pre, data]);
      console.log(data);
    });
    socket.on("chat_history", (data: ChatMessage[]) => {
      console.log(data);
      setChat((pre) => [...data, ...pre]);
    });
    socket.emit("join_room", roomId);
  }, [socket]);

  return (
    <div className="">
      <div className="">
        <div style={{ marginBottom: "1rem" }}>
          <p>
            Name: <b>{username}</b> and Room Id: <b>{roomId}</b>
          </p>
        </div>
        <div className="h-80 overflow-y-scroll">
          {chat.map(({ user, msg, time }, key) => (
            <div
              key={key}
              className={
                user == username
                  ? style.chatProfileRight
                  : style.chatProfileLeft
              }
            >
              <span
                className={style.chatProfileSpan}
                style={{ textAlign: user == username ? "right" : "left" }}
              >
                {user.charAt(0)}
              </span>
              <h3 style={{ textAlign: user == username ? "right" : "left" }}>
                {msg}
              </h3>
            </div>
          ))}
        </div>
        <div>
          <form onSubmit={(e) => sendData(e)}>
            <input
              className={style.chat_input}
              type="text"
              value={currentMsg}
              placeholder="Type your message.."
              onChange={(e) => setCurrentMsg(e.target.value)}
            />
            <button className={style.chat_button}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
