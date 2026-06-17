# ナレッジ統合検索(Mock DEMO)

Cloud Run 上で動作する、権限連動型のナレッジ統合検索アプリです。

## 対象ソース

- Confluence
- Workday
- SharePoint
- ServiceNow
- Compliance System

## ローカル実行

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

http://localhost:8080 を開きます。

## Cloud Run デプロイ

```bash
gcloud run deploy rrk-knowledge-search   --source .   --region asia-northeast1   --allow-unauthenticated
```
