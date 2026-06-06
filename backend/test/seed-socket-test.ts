import { Client } from "pg";
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

const pgClient = new Client({
  host: process.env.POSTGRES_HOSTNAME || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
  user: process.env.POSTGRES_USERNAME || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  database: process.env.POSTGRES_DB_NAME || "bettingduck",
});

async function main() {
  console.log("Connecting to PostgreSQL and Redis...");
  await pgClient.connect();
  const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
  });

  try {
    // 1. Create or Find Mock User in PostgreSQL
    const email = "socket-tester@example.com";
    const nickname = "SocketTester";
    const password = "hashed_password_placeholder"; // We bypass password checking during direct socket connection
    
    // Check if user already exists
    const userRes = await pgClient.query("SELECT id FROM users WHERE email = $1", [email]);
    let userId: string;

    if (userRes.rows.length > 0) {
      userId = String(userRes.rows[0].id);
      console.log(`Found existing user with ID: ${userId}`);
    } else {
      const insertUserRes = await pgClient.query(
        `INSERT INTO users (email, nickname, password, duck, "realDuck") 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id`,
        [email, nickname, password, 100000, 100000]
      );
      userId = String(insertUserRes.rows[0].id);
      console.log(`Created new mock user with ID: ${userId}`);
    }

    // Update Redis with user details (needed for socket authorization checks in BetGateway)
    await redis.hset(`user:${userId}`, {
      nickname: nickname,
      role: "user",
      duck: 100000,
      realDuck: 100000,
    });
    console.log(`Updated user data in Redis key user:${userId}`);

    // 2. Create a Mock Betting Room in PostgreSQL
    const roomId = randomUUID();
    const title = "개발용 소켓 테스트 방";
    const defaultBetAmount = 100;
    const option1 = "팀 A 승리";
    const option2 = "팀 B 승리";
    const status = "active"; // set to active directly to test betting
    const timer = 300;
    const joinUrl = `http://localhost:5173/betting_/${roomId}/vote`;

    await pgClient.query(
      `INSERT INTO bet_rooms (id, "managerId", title, "defaultBetAmount", option1, option2, status, "joinUrl", timer)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [roomId, parseInt(userId, 10), title, defaultBetAmount, option1, option2, status, joinUrl, timer]
    );
    console.log(`Created new betting room with ID: ${roomId} in PostgreSQL`);

    // 3. Initialize the Room in Redis
    await redis.set(`room:${roomId}:creator`, userId);
    await redis.set(`room:${roomId}:status`, "active");
    await redis.hset(`room:${roomId}:option1`, {
      participants: "0",
      currentBets: "0",
    });
    await redis.hset(`room:${roomId}:option2`, {
      participants: "0",
      currentBets: "0",
    });
    console.log(`Initialized room data in Redis for room:${roomId}`);

    // 4. Generate JWT Token
    const tokenPayload = {
      id: parseInt(userId, 10),
      role: "user",
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1d" });
    console.log("\n==============================================");
    console.log("Mock 데이터 셋업 완료!");
    console.log("==============================================");
    console.log(`테스트 URL: http://localhost:5173/betting_/${roomId}/vote`);
    console.log(`발급된 Access Token (JWT): \n${token}\n`);
    console.log("테스트 방법:");
    console.log(`1. 브라우저에서 아래 URL로 이동합니다:`);
    console.log(`   http://localhost:5173/betting_/${roomId}/vote`);
    console.log(`2. 브라우저의 개발자 도구(F12) -> 콘솔(Console)을 엽니다.`);
    console.log(`3. 다음 명령어를 복사하여 실행합니다 (JWT 쿠키 수동 등록):`);
    console.log(`   document.cookie = "access_token=${token}; path=/;";`);
    console.log(`4. 페이지를 새로고침(F5) 하면 로그인 과정 없이 곧바로 채팅 및 배팅 화면으로 진입할 수 있습니다.`);
    console.log("==============================================\n");

  } catch (error) {
    console.error("Error setting up mock data:", error);
  } finally {
    await pgClient.end();
    redis.disconnect();
  }
}

main();
