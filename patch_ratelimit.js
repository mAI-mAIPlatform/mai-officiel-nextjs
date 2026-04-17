const fs = require('fs');
const file = 'lib/ratelimit.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /export async function checkIpRateLimit/;
const replacement = `export async function checkUserOpusRateLimit(userId: string) {
  const redis = getClient();
  if (!redis?.isReady) {
    return;
  }
  try {
    const key = \`opus-rate-limit:\${userId}\`;
    const [count] = await redis.multi().incr(key).expire(key, 24 * 60 * 60, "NX").exec();
    if (typeof count === "number" && count > 1) {
      throw new ChatbotError("rate_limit:chat");
    }
  } catch (error) {
    if (error instanceof ChatbotError) {
      throw error;
    }
  }
}

export async function checkIpRateLimit`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
