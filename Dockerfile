FROM --platform=arm64 node:18.20.2 as node

ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN 
ARG SENTRY_RELEASE_NAME
ARG SENTRY_AUTH_TOKEN
ENV NODE_OPTIONS="--max-old-space-size=6144"

COPY . /app/

WORKDIR /app
RUN yarn install
RUN yarn install
RUN yarn install
RUN yarn remove @graphql-codegen/cli @graphql-codegen/fragment-matcher @graphql-codegen/introspection @graphql-codegen/typed-document-node @graphql-codegen/typescript @graphql-codegen/typescript-graphql-files-modules @graphql-codegen/typescript-operations
RUN yarn tsup && cp dist/* ./ 
RUN yarn postinstall
RUN yarn dev:prepare
RUN yarn snapshot
RUN rm scripts/snapshot.ts

FROM --platform=arm64 public.ecr.aws/lambda/nodejs:18-arm64
COPY --from=node app /var/task/

CMD [ "index.handler" ]
