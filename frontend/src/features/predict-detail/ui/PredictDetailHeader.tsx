import { TrophyIcon } from "@/shared/icons";
import { memo } from "react";

interface Props {
  title: string;
  winningOptionName: string;
}

export const PredictDetailHeader = memo(function ({
  title,
  winningOptionName,
}: Props) {
  return (
    <div className="bg-primary shadow-middle flex w-[90cqw] flex-col items-center justify-center rounded-2xl p-4">
      <h2 className="text-layout-main text-lg font-extrabold">{title}</h2>
      <div className="text-layout-main mt-2 flex items-center gap-2 text-2xl font-extrabold">
        <TrophyIcon width={32} height={32} />
        승리 : {winningOptionName}
      </div>
    </div>
  );
});
