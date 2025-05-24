import { memo } from "react";
import { UserFooter } from "./UserFooter";
import { GuestFooter } from "./GuestFooter";

export const FooterSelector = memo(function ({ role }: { role: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-8">
      {role === "guest" ? <GuestFooter /> : <UserFooter />}
    </div>
  );
});
