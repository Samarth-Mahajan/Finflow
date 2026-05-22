import "dotenv/config";
import { defineConfig } from "prisma/config";

const directUrl = process.env["DIRECT_URL"]!;
console.log("Using URL:", directUrl);
console.log("URL length:", directUrl?.length);
console.log("Host check:", directUrl?.split("@")[1]);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: directUrl,
  },
});
