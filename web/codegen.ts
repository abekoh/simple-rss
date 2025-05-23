import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "../backend/gql/*.graphqls", // バックエンドのGraphQLスキーマファイル
  documents: "src/**/*.{ts,tsx}", // GraphQLクエリが含まれるファイル
  generates: {
    "src/generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true, // useQueryなどのReact Hooksを生成
        withComponent: false,
        withHOC: false,
      },
    },
  },
};

export default config;
