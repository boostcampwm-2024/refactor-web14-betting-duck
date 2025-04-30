import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();
    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.ip;

    res.on("finish", () => {
      const duration = Date.now() - start;
      const timestamp = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      console.log(
        `[Nest] ${process.pid}  - ${timestamp}       LOG [LoggerMiddleware] Mapped {${originalUrl}, ${method}} from IP ${ip} +${duration}ms`,
      );
    });

    next();
  }
}
