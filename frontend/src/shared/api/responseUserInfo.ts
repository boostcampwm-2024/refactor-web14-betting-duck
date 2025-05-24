import { userInfoSchema, type UserInfo } from "@betting-duck/shared";

async function responseUserInfo(): Promise<UserInfo> {
  const response = await fetch("/api/users/userInfo");
  if (!response.ok) {
    throw new Error(
      `사용자 정보를 불러오는데 실패했습니다. Status: ${response.status}`,
    );
  }

  const json = await response.json();
  const parsed: UserInfo = userInfoSchema.parse(json.data);
  return parsed;
}

export { responseUserInfo };
