import React from "react";
import { useChat } from "../../hook/useChat";
import { MessageList } from "./ui/MessageList";
import { messageResponseSchema } from "@betting-duck/shared";
import Message from "./ui/Message";
import { useParams } from "@tanstack/react-router";
import { getRandomColor, getRandomRadius } from "../../utils";

interface Message {
  message: string;
  color: string;
  radius: string;
  sender: {
    nickname: string;
  };
}

function ChatMessages({ nickname }: { nickname: string }) {
  const { socket } = useChat();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const isJoinedRef = React.useRef(false);
  const { roomId } = useParams({
    from: "/betting_/$roomId/vote",
  });

  React.useEffect(() => {
    socket.on("message", (data) => {
      const message = messageResponseSchema.safeParse(data);
      const color = getRandomColor();
      const radius = getRandomRadius();
      if (!message.success) {
        console.error(message.error.errors);
        return;
      }
      const newMessage = {
        message: message.data.message,
        sender: message.data.sender,
        color,
        radius,
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("message");
    };
  }, [socket]);

  React.useEffect(() => {
    if (!isJoinedRef.current && socket.isConnected && nickname) {
      socket.emit("sendMessage", {
        sender: {
          nickname: nickname,
        },
        channel: {
          roomId: roomId,
        },
        message: `${nickname}님이 입장하셨습니다.`,
      });

      isJoinedRef.current = true;
    }
  }, [socket, nickname, roomId]);

  const renderMessage = React.useCallback(Message, []);

  return <MessageList>{messages.map(renderMessage)}</MessageList>;
}

export { ChatMessages };
