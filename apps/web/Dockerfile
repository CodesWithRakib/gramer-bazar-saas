FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm install --frozen-lockfile
RUN pnpm --filter web build
RUN pnpm --filter web deploy --prod /prod/web
# Explicitly copy .next and public since .next is gitignored and excluded by pnpm deploy
RUN cp -r /app/apps/web/.next /prod/web/.next
RUN cp -r /app/apps/web/public /prod/web/public

FROM base AS runner
WORKDIR /app
COPY --from=builder /prod/web ./
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD [ "pnpm", "start" ]
