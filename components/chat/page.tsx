"use client";
import React, { useEffect, useState } from "react";
import style from "./chat.module.css";
import { Socket } from "socket.io-client";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

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
      socket.emit("send_msg", msgData);
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
  }, [socket]);

  return (
    <Card className="max-w-sm p-4">
      <div className="h-80 overflow-y-scroll">
        {chat.map(({ user, msg, time }, key) => (
          <div
            key={key}
            className={
              user == username ? style.chatProfileRight : style.chatProfileLeft
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
        <form className="flex gap-1" onSubmit={(e) => sendData(e)}>
          <Input
            type="text"
            value={currentMsg}
            placeholder="Type your message.."
            onChange={(e) => setCurrentMsg(e.target.value)}
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </Card>
  );
};

export default ChatPage;
