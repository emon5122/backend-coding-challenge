import { Redis } from "ioredis";

const redis = new Redis({
  host: "redis",
  port: 6379,
  db: 1,
});

interface JwtSession {
  id: string;
  jwt: string;
  isOutdated: boolean;
}

export async function storeJwt(session: JwtSession) {
  await redis.hmset(`jwt:${session.jwt}`, {
    id: session.id,
    isOutdated: session.isOutdated.toString(),
  });
  await redis.expire(`jwt:${session.jwt}`, 30 * 60);
}
export async function updateIsOutdated(jwt: string) {
  await redis.hset(`jwt:${jwt}`, "isOutdated", true.toString());
}

export async function getSessionByJwt(jwt: string): Promise<JwtSession | null> {
  const data = await redis.hgetall(`jwt:${jwt}`);

  if (!data || Object.keys(data).length === 0) return null;

  return {
    id: data.id,
    jwt,
    isOutdated: data.isOutdated === "true",
  };
}
