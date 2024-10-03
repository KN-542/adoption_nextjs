# FROM node:16.17.1-bullseye
# WORKDIR /app
# RUN apt update \
#     && yarn install
# EXPOSE 3000

# ECRプッシュ用

# ベースイメージとしてNode.jsの公式イメージを指定
FROM node:16.17.1-bullseye

# 作業ディレクトリを指定
WORKDIR /app

# package.jsonとyarn.lockをコピーして、依存関係をインストール
COPY package.json yarn.lock ./

# 依存関係をインストール
RUN yarn install --production

# ESLintやTypeScriptなどの依存関係を追加
RUN yarn add --dev eslint typescript @types/react @types/node

# ソースコードをコピー
COPY . .

# ポート3000を公開
EXPOSE 3000

# アプリケーションをビルド（Next.jsアプリの場合はビルドコマンドを使用）
RUN yarn build

# アプリケーションを実行
CMD ["yarn", "start"]