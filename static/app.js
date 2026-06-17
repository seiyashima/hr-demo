const userSelect = document.getElementById('userSelect');
const questionEl = document.getElementById('question');
const askButton = document.getElementById('askButton');
const answerPanel = document.getElementById('answerPanel');
const emptyState = document.getElementById('emptyState');
const answerContent = document.getElementById('answerContent');
const answerTitle = document.getElementById('answerTitle');
const answerBadge = document.getElementById('answerBadge');
const answerSummary = document.getElementById('answerSummary');
const answerItems = document.getElementById('answerItems');
const sources = document.getElementById('sources');
const currentUser = document.getElementById('currentUser');
const loginUserName = document.getElementById('loginUserName');
const loginUserRole = document.getElementById('loginUserRole');

function selectedUser() {
  return userSelect.value;
}

function updateLoginDisplay() {
  const selected = userSelect.options[userSelect.selectedIndex];
  loginUserName.textContent = selected.dataset.name;
  loginUserRole.textContent = selected.dataset.role;
}

userSelect.addEventListener('change', updateLoginDisplay);
updateLoginDisplay();

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderAnswer(data) {
  answerPanel.classList.remove('empty');
  emptyState.hidden = true;
  answerContent.hidden = false;

  answerTitle.textContent = data.title;
  answerBadge.textContent = data.badge;
  answerBadge.className = `status ${data.status}`;
  answerSummary.textContent = data.summary;
  currentUser.textContent = `${data.user.name} / ${data.user.role}`;

  answerItems.innerHTML = '';
  data.items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = `<span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong>`;
    answerItems.appendChild(row);
  });

  sources.innerHTML = '';
  data.sources.forEach((source) => {
    const tag = document.createElement('em');
    tag.textContent = source;
    sources.appendChild(tag);
  });
}

async function ask() {
  askButton.disabled = true;
  askButton.textContent = '検索中...';
  answerPanel.classList.add('loading');

  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: selectedUser(), question: questionEl.value }),
    });

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }

    renderAnswer(await res.json());
  } catch (error) {
    renderAnswer({
      status: 'denied',
      badge: 'Error',
      user: { name: 'System', role: 'Application' },
      title: 'エラーが発生しました',
      summary: 'リクエストを処理できませんでした。時間をおいて再度お試しください。',
      items: [{ label: '詳細', value: error.message }],
      sources: [],
    });
  } finally {
    answerPanel.classList.remove('loading');
    askButton.disabled = false;
    askButton.textContent = '質問する';
  }
}

askButton.addEventListener('click', ask);

document.querySelectorAll('.quick').forEach((button) => {
  button.addEventListener('click', () => {
    questionEl.value = button.dataset.question;
  });
});

questionEl.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    ask();
  }
});
