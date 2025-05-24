import { DuckCoinIcon } from "@/shared/icons";
import { purchaseDuck } from "../api/purchaseDuck";
import { useQueryClient } from "@tanstack/react-query";
import { memo } from "react";

import type { UserInfo } from "@betting-duck/shared";
interface PurchaseButtonProps {
  userInfo: UserInfo;
}

const PurchaseButton = memo(({ userInfo }: PurchaseButtonProps) => {
  const queryClient = useQueryClient();

  return (
    <button
      aria-label="오리 구매하기"
      onClick={async () => await purchaseDuck(userInfo.duck, queryClient)}
      className="bg-secondary text-default border-default-hover flex items-center gap-4 rounded-xl border-2 px-6 py-3 text-xl font-bold"
    >
      <DuckCoinIcon width={32} height={33} />
      <span>-30</span>
    </button>
  );
});

export { PurchaseButton };
