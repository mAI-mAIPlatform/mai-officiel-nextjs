import { registerOTel } from "@vercel/otel";
import { APP_NAME } from "@/lib/app-version";

export function register() {
  registerOTel({ serviceName: APP_NAME });
}
