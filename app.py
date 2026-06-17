from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Dict, List

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


@dataclass(frozen=True)
class User:
    key: str
    name: str
    role: str
    email: str
    department: str


USERS: Dict[str, User] = {
    "jane": User(
        key="jane",
        name="Jane Doe",
        role="上司 / Line Manager",
        email="jane.doe@example.com",
        department="Capital Markets Division",
    ),
    "john": User(
        key="john",
        name="John Smith",
        role="部下 / Employee",
        email="john.smith@example.com",
        department="Capital Markets Division",
    ),
}

QUICK_QUESTIONS: List[str] = [
    "John Smith の人事情報を教えて",
    "Where is the policy on client gift limits?",
    "Who approved the exception for the Smith account?",
    "What's the process for requesting trading system access?",
]

HR_EVALUATION_RESPONSE = {
    "title": "John Smith の FY2026 人事評価情報",
    "summary": "Jane Doe は John Smith の直属上司として、FY2026 の評価情報を確認できます。",
    "items": [
        {"label": "評価年度", "value": "FY2026"},
        {"label": "総合評価", "value": "Exceeds Expectations"},
        {"label": "主な強み", "value": "顧客対応力、チーム貢献、取引システム改善への主体的な関与"},
        {"label": "育成ポイント", "value": "ドキュメント化と後進育成の強化"},
        {"label": "上長コメント", "value": "重要顧客対応において高い成果を示し、チーム全体の生産性向上にも貢献しました。"},
    ],
    "sources": ["Mock HR System", "Mock Performance Review DB", "Mock Manager Hierarchy"],
}

MOCK_RESPONSES = {
    "client gift": {
        "title": "Client Gift Policy",
        "summary": "顧客向け贈答品の上限は原則 USD 100 です。例外は Compliance Approval が必要です。",
        "items": [
            {"label": "参照元", "value": "Client Gift & Entertainment Policy v4.2"},
            {"label": "上限", "value": "USD 100 per client / per event"},
            {"label": "例外申請", "value": "Compliance Portal から事前承認を申請"},
        ],
        "sources": ["Mock Policy Portal", "Mock Compliance KB"],
    },
    "smith account": {
        "title": "Smith Account Exception Approval",
        "summary": "Smith account の例外承認者は Jane Doe です。承認日は 2026-03-14 です。",
        "items": [
            {"label": "承認者", "value": "Jane Doe"},
            {"label": "承認日", "value": "2026-03-14"},
            {"label": "承認理由", "value": "Strategic client retention case"},
        ],
        "sources": ["Mock CRM", "Mock Approval Workflow"],
    },
    "trading system": {
        "title": "Trading System Access Request Process",
        "summary": "取引システムアクセスは、上長承認、Compliance確認、IT Provisioning の順に申請します。",
        "items": [
            {"label": "Step 1", "value": "Access Request Portal で申請"},
            {"label": "Step 2", "value": "Line Manager Approval"},
            {"label": "Step 3", "value": "Compliance Review"},
            {"label": "Step 4", "value": "IT Support による権限付与"},
        ],
        "sources": ["Mock ITSM", "Mock Access Control Policy"],
    },
}


def is_john_hr_question(question: str) -> bool:
    normalized = question.lower()
    return "john smith" in normalized and ("人事" in question or "hr" in normalized or "evaluation" in normalized)


def build_response(user_key: str, question: str) -> dict:
    user = USERS.get(user_key, USERS["john"])

    if is_john_hr_question(question):
        if user.key == "jane":
            return {
                "status": "allowed",
                "badge": "Access granted",
                "user": user,
                **HR_EVALUATION_RESPONSE,
            }
        return {
            "status": "denied",
            "badge": "Access denied",
            "user": user,
            "title": "権限不足",
            "summary": "確認する権限がありません。help@example.com にお問い合わせください。",
            "items": [
                {"label": "理由", "value": "人事評価情報は本人による直接参照の対象外です。"},
                {"label": "問い合わせ先", "value": "help@example.com"},
            ],
            "sources": ["Mock ACL Policy", "Mock HR System"],
        }

    q = question.lower()
    for keyword, response in MOCK_RESPONSES.items():
        if keyword in q:
            return {
                "status": "allowed",
                "badge": "Access granted",
                "user": user,
                **response,
            }

    return {
        "status": "not_found",
        "badge": "No result",
        "user": user,
        "title": "該当情報なし",
        "summary": "該当するモックデータは見つかりませんでした。デモ用の質問例を選択してください。",
        "items": [],
        "sources": [],
    }


@app.get("/")
def index():
    initial_user = USERS["jane"]
    initial_question = QUICK_QUESTIONS[0]
    initial_answer = build_response("jane", initial_question)
    return render_template(
        "index.html",
        users=USERS,
        quick_questions=QUICK_QUESTIONS,
        initial_user=initial_user,
        initial_question=initial_question,
        initial_answer=initial_answer,
    )


@app.post("/api/ask")
def api_ask():
    payload = request.get_json(silent=True) or {}
    user_key = str(payload.get("user", "john"))
    question = str(payload.get("question", ""))
    return jsonify(build_response(user_key, question))


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
