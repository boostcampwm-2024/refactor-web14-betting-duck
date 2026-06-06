import { useState, useEffect, useCallback } from "react";
import { useSessionStorage } from "@/shared/hooks/useSessionStorage";
import { authenticatedUserInfoSchema } from "@betting-duck/shared";
import type { UserInfoWithRoomId } from "../index";

const DEFAULT_USER_INFO: UserInfoWithRoomId = {
  message: "OK",
  role: "guest",
  nickname: "",
  duck: 0,
  realDuck: 0,
  roomId: undefined,
  isAuthenticated: false,
};

export function useSessionStoredUser(): [
  UserInfoWithRoomId,
  (info: Partial<UserInfoWithRoomId>) => Promise<void>,
] {
  const { getSessionItem, setSessionItem } = useSessionStorage();
  const [userInfo, setUserInfo] =
    useState<UserInfoWithRoomId>(DEFAULT_USER_INFO);

  useEffect(() => {
    let mounted = true;

    async function loadUserInfo() {
      try {
        const raw = await getSessionItem("userInfo");
        if (raw) {
          const stored = JSON.parse(raw);
          const parsed = authenticatedUserInfoSchema.safeParse(stored);
          if (!parsed.success) {
            console.error(
              "세션에 저장된 사용자 정보가 유효하지 않습니다.",
              parsed.error,
            );
            return;
          }
          if (mounted)
            setUserInfo({
              ...DEFAULT_USER_INFO,
              ...parsed.data.userInfo,
              isAuthenticated: parsed.data.isAuthenticated,
            });
        }
      } catch (error) {
        console.error("세션에서 사용자 정보 로드 실패", error);
      }
    }

    loadUserInfo();
    return () => {
      mounted = false;
    };
  }, [getSessionItem]);

  const updateUserInfo = useCallback(
    async (patch: Partial<UserInfoWithRoomId>) => {
      let current = userInfo;
      try {
        const raw = await getSessionItem("userInfo");
        if (raw) {
          current = JSON.parse(raw);
        }
      } catch (e) {
        console.error("세션 정보 로드 실패", e);
      }
      const next = { ...current, ...patch };
      try {
        await setSessionItem("userInfo", JSON.stringify(next));
        setUserInfo(next);
      } catch {
        console.error("세션에 사용자 정보 저장 실패");
      }
    },
    [getSessionItem, setSessionItem, userInfo],
  );

  return [userInfo, updateUserInfo];
}
