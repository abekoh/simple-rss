# インフラストラクチャ設定

このディレクトリには、Simple RSSアプリケーションのインフラストラクチャ設定ファイルが含まれています。

## SSL証明書の作成手順（Mac）

`reader-api.abekoh.dev`用のSSL証明書を作成する方法を説明します。以下に2つの方法を紹介します。

### 方法1: OpenSSLを使用した自己署名証明書の作成（開発・テスト用）

1. ターミナルを開きます

2. 証明書を保存するディレクトリを作成します
```bash
mkdir -p ~/ssl-certs
cd ~/ssl-certs
```

3. 秘密鍵を生成します
```bash
openssl genrsa -out reader-api.abekoh.dev.key 2048
```

4. 証明書署名要求（CSR）を作成します
```bash
openssl req -new -key reader-api.abekoh.dev.key -out reader-api.abekoh.dev.csr
```
   - 質問に答える際、Common Name (CN)には必ず `reader-api.abekoh.dev` を入力してください

5. 自己署名証明書を生成します
```bash
openssl x509 -req -days 365 -in reader-api.abekoh.dev.csr -signkey reader-api.abekoh.dev.key -out reader-api.abekoh.dev.crt
```

6. 生成された証明書と秘密鍵をGoogle Cloud Storageにアップロードします
```bash
gsutil cp reader-api.abekoh.dev.crt gs://abekoh-simple-rss-ssl-certificates/
gsutil cp reader-api.abekoh.dev.key gs://abekoh-simple-rss-ssl-certificates/
```

### 方法2: Let's Encryptを使用した信頼された証明書の取得（本番環境用）

1. Homebrewをインストールしていない場合は、まずインストールします
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. certbotをインストールします
```bash
brew install certbot
```

3. 証明書を取得します（DNSチャレンジ方式）
```bash
sudo certbot certonly --manual --preferred-challenges dns -d reader-api.abekoh.dev
```
   - 指示に従って、DNSレコードにTXTレコードを追加します
   - メールアドレスの入力や利用規約への同意が求められます

4. 証明書が生成されたら、以下のパスから証明書と秘密鍵をコピーします
```bash
sudo cp /etc/letsencrypt/live/reader-api.abekoh.dev/fullchain.pem ~/ssl-certs/reader-api.abekoh.dev.crt
sudo cp /etc/letsencrypt/live/reader-api.abekoh.dev/privkey.pem ~/ssl-certs/reader-api.abekoh.dev.key
```

5. 証明書と秘密鍵のパーミッションを変更して読み取り可能にします
```bash
sudo chmod 644 ~/ssl-certs/reader-api.abekoh.dev.crt
sudo chmod 644 ~/ssl-certs/reader-api.abekoh.dev.key
```

6. Google Cloud Storageにアップロードします
```bash
gsutil cp ~/ssl-certs/reader-api.abekoh.dev.crt gs://abekoh-simple-rss-ssl-certificates/
gsutil cp ~/ssl-certs/reader-api.abekoh.dev.key gs://abekoh-simple-rss-ssl-certificates/
```

### 注意事項

- 自己署名証明書はブラウザに警告が表示されますが、開発・テスト環境では問題ありません
- 本番環境では、Let's Encryptなどの信頼された認証局から取得した証明書を使用することをお勧めします
- 秘密鍵（.key）は安全に管理し、不要になったら削除してください
- Google Cloud Storageバケットのアクセス権限が適切に設定されていることを確認してください

## Terraformの適用方法

1. 必要な環境変数を設定します
```bash
export TF_VAR_DB_URL="your_database_url"
export TF_VAR_GEMINI_API_KEY="your_gemini_api_key"
```

2. Terraformを初期化します
```bash
terraform init
```

3. 実行計画を確認します
```bash
terraform plan
```

4. 変更を適用します
```bash
terraform apply
```

5. リソースを削除する場合は以下のコマンドを実行します
```bash
terraform destroy
