import { io, Socket } from "socket.io-client";
import Redis from "ioredis";
import * as jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

// Load backend .env file manually to avoid dependency issues
try {
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const index = trimmed.indexOf("=");
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        const value = trimmed.substring(index + 1).trim();
        process.env[key] = value;
      }
    });
  }
} catch (err) {
  console.warn("Could not manually load .env file:", err.message);
}

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const REDIS_HOST = process.env.REDIS_HOSTNAME || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const SERVER_URL = "http://localhost:3000"; // NestJS backend server URL

// Load Test Parameters
const CLIENT_COUNT = 50;          // Number of concurrent simulated clients
const CHAT_INTERVAL_MS = 3000;    // Time between chat messages per client (3 seconds)
const BET_INTERVAL_MS = 8000;     // Time between placing bets per client (8 seconds)

interface ClientInstance {
  id: string;
  nickname: string;
  token: string;
  chatSocket: Socket;
  betSocket: Socket;
  chatTimer?: NodeJS.Timeout;
  betTimer?: NodeJS.Timeout;
}

const clients: ClientInstance[] = [];
let roomId = process.argv[2]; // Get Room ID from command line arguments

async function main() {
  if (!roomId) {
    console.error("오류: Room ID가 지정되지 않았습니다.");
    console.log("사용법: npx ts-node -r tsconfig-paths/register test/socket-load-test.ts <ROOM_ID>");
    console.log("먼저 seed-socket-test.ts를 실행하여 생성된 Room ID를 사용하세요.");
    process.exit(1);
  }

  console.log(`Starting socket load test for Room: ${roomId}`);
  console.log(`Simulating ${CLIENT_COUNT} clients...`);

  // Connect to Redis to register guest users
  const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
  });

  try {
    // 1. Generate and seed mock guest users in Redis
    console.log("Registering simulated guest users in Redis...");
    for (let i = 0; i < CLIENT_COUNT; i++) {
      const guestId = `guest-${randomUUID()}`;
      const nickname = `TesterDuck_${i + 1}`;
      
      // Save guest user data to Redis (this satisfies auth-checks in BetGateway & BetService)
      await redis.hset(`user:${guestId}`, {
        nickname: nickname,
        role: "guest",
        duck: 50000, // Allocate 50,000 ducks for betting
        realDuck: 50000,
      });

      // Sign guest JWT
      const token = jwt.sign({ id: guestId, role: "guest" }, JWT_SECRET, { expiresIn: "1d" });

      clients.push({
        id: guestId,
        nickname,
        token,
        chatSocket: null as any,
        betSocket: null as any,
      });
    }
    console.log(`Successfully registered ${CLIENT_COUNT} guest users in Redis.`);

    // 2. Connect clients to Socket.io
    console.log("Connecting clients to sockets...");
    let connectedChats = 0;
    let connectedBets = 0;

    clients.forEach((client, idx) => {
      // Connect to Chat Namespace
      const chatSocket = io(`${SERVER_URL}/api/chat`, {
        auth: { token: client.token },
        transports: ["websocket"],
      });

      // Connect to Betting Namespace
      const betSocket = io(`${SERVER_URL}/api/betting`, {
        auth: { token: client.token },
        transports: ["websocket"],
      });

      client.chatSocket = chatSocket;
      client.betSocket = betSocket;

      // Handle Chat Connection
      chatSocket.on("connect", () => {
        connectedChats++;
        chatSocket.emit("joinRoom", {
          channel: { roomId },
        });

        // Start periodic chat messages
        let msgCount = 0;
        client.chatTimer = setInterval(() => {
          chatSocket.emit("sendMessage", {
            sender: { nickname: client.nickname },
            message: `[LoadTest] 꽥꽥! 테스트 메시지 #${++msgCount} 보내는 중!`,
            channel: { roomId },
          });
        }, CHAT_INTERVAL_MS + Math.random() * 1000); // add jitter
      });

      chatSocket.on("message", (msg: any) => {
        // Option to print sample messages to monitor flow
        if (idx === 0) {
          console.log(`[샘플 수신 - ${client.nickname}] 채팅: ${msg.sender.nickname}: ${msg.message}`);
        }
      });

      chatSocket.on("connect_error", (err) => {
        console.error(`Client ${client.nickname} Chat connect error:`, err.message);
      });

      // Handle Betting Connection
      betSocket.on("connect", () => {
        connectedBets++;
        betSocket.emit("joinRoom", {
          channel: { roomId },
        });

        // Start periodic betting calls via HTTP POST /api/bets
        client.betTimer = setInterval(async () => {
          try {
            const selectOption = Math.random() > 0.5 ? "option1" : "option2";
            const betAmount = 10; // place a small bet of 10 ducks

            // Make HTTP request to place a bet using the cookie for authentication
            const response = await fetch(`${SERVER_URL}/api/bets`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Cookie": `access_token=${client.token}`,
              },
              body: JSON.stringify({
                sender: { selectOption, betAmount },
                channel: { roomId },
              }),
            });

            if (response.ok) {
              const resBody = await response.json();
              if (idx === 0) {
                console.log(`[샘플 배팅 성공 - ${client.nickname}] ${selectOption}에 ${betAmount}덕 베팅 완료!`);
              }
            } else {
              const errBody = await response.json();
              if (idx === 0) {
                console.log(`[샘플 배팅 실패 - ${client.nickname}] 상태코드 ${response.status}: ${errBody.data?.message || errBody.message}`);
              }
            }
          } catch (err) {
            console.error(`Client ${client.nickname} placing bet error:`, err.message);
          }
        }, BET_INTERVAL_MS + Math.random() * 2000); // add jitter
      });

      betSocket.on("fetchBetRoomInfo", (data: any) => {
        if (idx === 0) {
          console.log(`[샘플 수신 - ${client.nickname}] 실시간 배팅현황 -> 옵션1: ${data.channel?.option1?.currentBets || 0}덕 (${data.channel?.option1?.participants || 0}명), 옵션2: ${data.channel?.option2?.currentBets || 0}덕 (${data.channel?.option2?.participants || 0}명)`);
        }
      });

      betSocket.on("connect_error", (err) => {
        console.error(`Client ${client.nickname} Bet connect error:`, err.message);
      });
    });

    // Monitor connections every 2 seconds
    const monitorInterval = setInterval(() => {
      console.log(`[연결 상태 리포트] Chat 소켓 연결됨: ${connectedChats}/${CLIENT_COUNT} | Betting 소켓 연결됨: ${connectedBets}/${CLIENT_COUNT}`);
      if (connectedChats === CLIENT_COUNT && connectedBets === CLIENT_COUNT) {
        console.log("모든 시뮬레이션 클라이언트가 연결 완료되어 트래픽 전송 중입니다.");
      }
    }, 3000);

    // Stop load test after 60 seconds
    setTimeout(() => {
      console.log("\n==============================================");
      console.log("60초가 경과하여 부하 테스트를 안전하게 종료합니다.");
      console.log("==============================================");
      clearInterval(monitorInterval);
      clients.forEach(client => {
        if (client.chatTimer) clearInterval(client.chatTimer);
        if (client.betTimer) clearInterval(client.betTimer);
        client.chatSocket.disconnect();
        client.betSocket.disconnect();
      });
      redis.disconnect();
      console.log("모든 연결이 정상적으로 해제되었습니다.");
      process.exit(0);
    }, 60000);

  } catch (error) {
    console.error("부하 테스트 중 치명적 오류 발생:", error);
    redis.disconnect();
  }
}

main();
