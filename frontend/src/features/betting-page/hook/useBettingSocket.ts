import { useSocketIO } from "@/shared/hooks/useSocketIo";
import { useNavigate, UseNavigateResult } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ChannelType } from "@betting-duck/shared";

interface SocketConnectProps {
  socket: ReturnType<typeof useSocketIO>;
  channel: {
    id: string;
    status: string;
  };
  joinRef: React.MutableRefObject<boolean>;
  fetchRef: React.MutableRefObject<boolean>;
}

function onSocketConnect({
  socket,
  channel,
  joinRef,
  fetchRef,
}: SocketConnectProps) {
  console.log("베팅 페이지에 소켓에 연결이 되었습니다.");
  if (!joinRef.current) {
    joinRef.current = true;
    socket.emit("joinRoom", {
      channel: {
        roomId: channel.id,
      },
    });
  }
  if (channel.status === "active" && !fetchRef.current) {
    fetchRef.current = true;
    socket.emit("fetchBetRoomInfo", {
      roomId: channel.id,
    });
  }
}

function onFinshed(channel: ChannelType, navigate: UseNavigateResult<string>) {
  console.log("베팅이 종료되었습니다");
  navigate({
    to: "/betting/$roomId/vote/resultDetail",
    params: { roomId: channel.id },
  });
}

function onCancelWaitingRoom(
  channel: ChannelType,
  navigate: UseNavigateResult<string>,
) {
  console.log("베팅이 취소되었습니다");
  navigate({
    to: "/betting/$roomId/vote/resultDetail",
    params: { roomId: channel.id },
  });
}

export function useBettingSocket(channel: ChannelType) {
  const joinRef = useRef(false);
  const fetchRef = useRef(false);
  const navigate = useNavigate();

  const socket = useSocketIO({
    url: "/api/betting",
    onConnect: () => onSocketConnect({ socket, channel, joinRef, fetchRef }),
    onDisconnect: (reason) => {
      console.log("베팅 페이지에 소켓 연결이 끊겼습니다.", reason);
      joinRef.current = false;
      fetchRef.current = false;
    },
    onError: (error) => {
      console.error("베팅 페이지에 소켓 에러가 발생했습니다.", error);
    },
  });

  useEffect(() => {
    socket.on("finished", () => onFinshed(channel, navigate));
    socket.on("cancelWaitingRoom", () =>
      onCancelWaitingRoom(channel, navigate),
    );

    return () => {
      socket.off("finished");
      socket.off("cancelWaitingRoom");
    };
  }, [socket, channel, navigate]);

  return socket;
}
