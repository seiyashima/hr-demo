const questionEl = document.getElementById('question');
const askButton = document.getElementById('askButton');
const answerTitle = document.getElementById('answerTitle');
const answerBadge = document.getElementById('answerBadge');
const answerSummary = document.getElementById('answerSummary');
const answerItems = document.getElementById('answerItems');
const sources = document.getElementById('sources');
const currentUser = document.getElementById('currentUser');

function selectedUser() {
  return document.querySelector('input[name="user"]:checked').value;
}

function renderAnswer(data) {
  answerTitle.textContent = data.title;
  answerBadge.textContent = data.badge;
  answerBadge.className = `status ${data.status}`;
  answerSummary.textContent = data.summary;
  currentUser.textContent = `${data.user.name} / ${data.user.role}`;

  answerItems.innerHTML = '';
  data.items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = `<span>${item.label}</span><strong>${item.value}</strong>`;
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
  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: selectedUser(), question: questionEl.value }),
    });
    renderAnswer(await res.json());
  } finally {
    askButton.disabled = false;
    askButton.textContent = 'AIに質問する';
  }
}

askButton.addEventListener('click', ask);
document.querySelectorAll('.quick').forEach((button) => {
  button.addEventListener('click', () => {
    questionEl.value = button.dataset.question;
    ask();
  });
});
document.querySelectorAll('input[name="user"]').forEach((radio) => {
  radio.addEventListener('change', ask);
});
