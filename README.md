# RRK Cloud Run ACL Demo

Cloud Run で動かす、Enterprise AI Search の権限制御モックデモです。

## デモ内容

同じ質問「John Smith の人事情報を教えて」に対して、質問者の権限に応じて回答が変わります。

- Jane Doe / 上司: John Smith の FY2026 人事評価情報を表示
- John Smith / 本人: 「確認する権限がありません。help@example.com にお問い合わせください。」を表示

すべてのデータ、権限、AI回答はモックです。

## ローカル実行

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

ブラウザで以下を開きます。

```bash
http://localhost:8080
```

## Cloud Run へソースからデプロイ

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud run deploy rrk-acl-demo \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated
```

`--allow-unauthenticated` はデモ共有しやすくするための設定です。社内限定にしたい場合は外してください。

## Docker を使う場合

```bash
docker build -t rrk-acl-demo .
docker run -p 8080:8080 rrk-acl-demo
```
