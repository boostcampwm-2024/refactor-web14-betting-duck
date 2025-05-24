import { EmoticomButton } from "./ui/EmoticonButton";
import { InputBar } from "./ui/InputBar";
import { VoteButton } from "./ui/VoteButton";

import type { UserInfo } from "@betting-duck/shared";

function ChatInput({ userInfo }: { userInfo: UserInfo }) {
  return (
    <div className="bg-secondary relative flex h-full max-h-[60px] w-full flex-row items-center justify-between gap-4 py-3 pl-2 pr-4">
      <div
        id="message-container-scroll-bottom"
        className="absolute -top-[16px] left-0 h-[1px] w-full"
      />
      <EmoticomButton />
      <InputBar userInfo={userInfo} />
      <VoteButton />
    </div>
  );
}

export { ChatInput };
