import { useState } from "react";
import { useChat } from "@/features/chat/hook/useChat";
import { useParams } from "@tanstack/react-router";
import { createSendMessagePayload } from "@/features/chat/utils";
import type { UserInfo } from "@betting-duck/shared";

function InputBar({ userInfo }: { userInfo: UserInfo }) {
  const [isComposing, setComposing] = useState(false);
  const [text, setText] = useState("");
  const { socket } = useChat();
  const { roomId } = useParams({
    from: "/betting_/$roomId/vote",
  });

  function sendMessage(e: React.KeyboardEvent<HTMLPreElement>) {
    if (!isComposing && text.trim().length > 0 && socket.isConnected) {
      socket.emit(
        "sendMessage",
        createSendMessagePayload(roomId, userInfo, text),
      );
      setText("");
      e.currentTarget.textContent = "";
    }
  }

  function handleInput(e: React.FormEvent<HTMLPreElement>) {
    if (!isComposing) {
      const content = e.currentTarget.textContent ?? "";
      setText(content);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLPreElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  }

  return (
    <div className="relative flex h-full w-full items-center">
      <pre
        className={`overflow-wrap-break-word ml-1 flex h-full min-h-[20px] w-full max-w-full resize-none items-center overflow-y-hidden whitespace-normal break-words break-all rounded-lg border-none bg-slate-100 px-3 py-2 font-normal leading-5 text-inherit outline-none`}
        role="textbox"
        aria-multiline="true"
        data-placeholder="메세지를 입력하세요."
        contentEditable="true"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={(e) => {
          const content = e.currentTarget.textContent ?? "";
          setText(content);
          setComposing(false);
        }}
      />
    </div>
  );
}

export { InputBar };
