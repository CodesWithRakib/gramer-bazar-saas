FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter web build
RUN pnpm --filter web deploy --prod /prod/web

FROM base AS runner
WORKDIR /app
COPY --from=builder /prod/web ./
ENV NODE_ENV=production
EXPOSE 3000
CMD [ "pnpm", "start" ]
