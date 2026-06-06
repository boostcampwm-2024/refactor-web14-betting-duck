import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();
    console.log(
      "AuthenticatedGuard(테스트용 로그, client IP) : ",
      client.handshake.headers["x-real-ip"],
    );

    const accessToken =
      client.handshake.auth?.token || client.handshake.headers?.token;

    if (!accessToken) {
      return false;
    }

    try {
      const payload = jwt.verify(
        accessToken,
        process.env.JWT_SECRET || "secret",
      ) as { id: string | number; role: string };

      if (!payload || (payload.role !== "user" && payload.role !== "guest")) {
        return false;
      }

      client.data.userId =
        typeof payload.id === "number" ? String(payload.id) : payload.id;
      client.data.userRole = payload.role;
      return true;
    } catch (err) {
      console.error("WS Token verification error:", err);
      return false;
    }
  }
}
