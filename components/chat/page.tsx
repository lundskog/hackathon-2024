"use client";
import React, { useEffect, useRef, useState } from "react";
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
  const endOfChatRef = useRef<HTMLDivElement>(null);

  const scrollToChatBottom = () => {
    setTimeout(() => {
      endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  useEffect(() => {
    scrollToChatBottom();
  }, []);

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
      scrollToChatBottom();
      setCurrentMsg("");
    }
  };

  useEffect(() => {
    socket.on("receive_msg", (data: ChatMessage) => {
      setChat((pre) => [...pre, data]);
      scrollToChatBottom();
      console.log(data);
    });
    socket.on("chat_history", (data: ChatMessage[]) => {
      console.log(data);
      setChat((pre) => [...data, ...pre]);
    });
  }, [socket]);

  return (
    <Card className="max-w-sm p-4">
      <div className="h-80 overflow-y-scroll space-y-1">
        {chat.map(({ user, msg, time }, key) => (
          <div
            key={key}
            className={`flex gap-1 items-center
            ${user == username ? "flex-row-reverse" : ""}
            `}
          >
            <span className="text-xs text-muted-foreground">{time}</span>
            <span
              className={`w-8 h-8 p-2 rounded-full flex justify-center items-center ${
                user == username ? "bg-primary" : "bg-accent"
              }`}
            >
              {user.charAt(0)}
            </span>
            <h3 className="font-medium">{msg}</h3>
          </div>
        ))}
        <div ref={endOfChatRef} />
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
