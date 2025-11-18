FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile

FROM base AS dev
WORKDIR /app
COPY . .

CMD ["bun", "run", "dev"]

FROM base AS build
WORKDIR /app
COPY . .
RUN bun run build || echo "No build step found"

FROM oven/bun:1 AS prod
WORKDIR /app

COPY --from=build /app ./

RUN bun install --production --frozen-lockfile

ENV NODE_ENV=production

CMD ["bun", "run", "prod"]
