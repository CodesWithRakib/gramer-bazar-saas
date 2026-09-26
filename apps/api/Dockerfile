FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
# Copy the entire monorepo
COPY . .
# Install dependencies
RUN pnpm install --frozen-lockfile
# Build the api package
RUN pnpm --filter api build
# Deploy the api package into an isolated directory with only production dependencies
RUN pnpm --filter api deploy --prod /prod/api
# Explicitly copy compiled dist since dist is gitignored and excluded by pnpm deploy
RUN cp -r /app/apps/api/dist /prod/api/dist

FROM base AS runner
WORKDIR /app
# Copy the deployed application and compiled dist from builder
COPY --from=builder /prod/api ./
RUN mkdir -p /app/uploads
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
CMD [ "pnpm", "start:prod" ]
