FROM node:22-alpine AS base

WORKDIR /app

FROM base AS dependencies

COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

FROM dependencies AS build

COPY . .

RUN npx prisma generate && npx nuxi prepare && npm run build

FROM base AS runtime

COPY --from=build /app/.output .output

ENV NODE_ENV=production

ENV NUXT_HOST=0.0.0.0

ENV NUXT_PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
