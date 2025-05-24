import { useNavigate, useParams } from "@tanstack/react-router";

function CancleVottingButton() {
  const navigate = useNavigate();
  const { roomId } = useParams({
    from: "/betting_/$roomId/waiting",
  });

  async function cancleBettingRoom() {
    try {
      const response = await fetch(`/api/betrooms/${roomId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("방 삭제에 실패했습니다.");

      navigate({ to: "/my-page" });
    } catch (error) {
      navigate({ to: "/my-page" });
      console.error(error);
    }
  }

  return (
    <button
      onClick={cancleBettingRoom}
      className="bg-default text-secondary w-full rounded-lg p-[10px]"
    >
      투표 취소
    </button>
  );
}

export { CancleVottingButton };
