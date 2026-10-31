const resources = window.resources;
const categories = ['Tất cả', 'Reading', 'Writing', 'Chatbot', 'Forecast Speaking', 'Ngữ pháp', 'Lộ trình'];
const driveUrl = item => `https://drive.google.com/file/d/${item.key}/view`;
const sourceUrl = item => item.kind === 'drive' ? driveUrl(item) : item.url;
const shortcutUrl = item => `links/${item.id}.htm`;
const itemUrl = item => item.kind === 'drive' ? `tai-lieu.html?id=${encodeURIComponent(item.id)}` : item.url;

function makeCard(item) {
  const card = document.createElement('a');
  card.className = 'resource-card';
  card.href = itemUrl(item);
  if (item.kind === 'external') { card.target = '_blank'; card.rel = 'noopener noreferrer'; }
  const top = document.createElement('div');
  top.className = 'card-top';
  const icon = document.createElement('span');
  icon.className = 'card-icon';
  icon.textContent = item.kind === 'drive' ? '▤' : '↗';
  const kind = document.createElement('span');
  kind.textContent = item.kind === 'drive' ? 'TÀI LIỆU DRIVE' : 'LIÊN KẾT NGOÀI';
  top.append(icon, kind);
  const category = document.createElement('span');
  category.className = 'category-tag';
  category.textContent = item.category;
  const title = document.createElement('h3');
  title.textContent = item.title;
  const source = document.createElement('span');
  source.className = 'source-link';
  source.title = sourceUrl(item);
  source.textContent = sourceUrl(item);
  const link = document.createElement('span');
  link.className = 'card-link';
  link.textContent = item.kind === 'drive' ? 'Xem tài liệu →' : 'Mở liên kết ↗';
  card.append(top, category, title, source, link);
  return card;
}

function setupHome() {
  const search = document.getElementById('search');
  const filters = document.getElementById('filters');
  const cards = document.getElementById('cards');
  const count = document.getElementById('result-count');
  const empty = document.getElementById('empty-state');
  search.value = new URLSearchParams(location.search).get('q') || '';
  let selected = 'Tất cả';
  const normalize = value => value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

  function render() {
    const term = normalize(search.value.trim());
    const visible = resources.filter(item => (selected === 'Tất cả' || item.category === selected) && normalize(`${item.title} ${item.category}`).includes(term));
    cards.replaceChildren(...visible.map(makeCard));
    count.textContent = `${visible.length}/${resources.length} mục`;
    empty.hidden = visible.length !== 0;
    for (const button of filters.querySelectorAll('button')) {
      const active = button.dataset.category === selected;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }
  for (const category of categories) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-button';
    button.dataset.category = category;
    button.textContent = category;
    button.addEventListener('click', () => { selected = category; render(); });
    filters.append(button);
  }
  search.addEventListener('input', render);
  render();
}

function setupIntro() {
  const dialog = document.getElementById('intro-dialog');
  if (!dialog.showModal) return;
  let seen = false;
  try { seen = sessionStorage.getItem('intro-seen') === '1'; } catch { /* Storage can be disabled. */ }
  if (seen) return;
  dialog.showModal();
  dialog.addEventListener('close', () => {
    try { sessionStorage.setItem('intro-seen', '1'); } catch { /* Keep the dialog dismissible. */ }
  }, { once: true });
}

function setupDocument() {
  const id = new URLSearchParams(location.search).get('id');
  const item = resources.find(resource => resource.id === id && resource.kind === 'drive');
  if (!item) { location.replace('index.html#tai-lieu'); return; }
  document.title = `${item.title} — Kho tài liệu IELTS`;
  const head = document.getElementById('document-head');
  const heading = document.createElement('div');
  const tag = document.createElement('span'); tag.className = 'category-tag'; tag.textContent = item.category;
  const title = document.createElement('h1'); title.id = 'document-title'; title.textContent = item.title;
  const summary = document.createElement('p'); summary.textContent = 'Xem bản xem trước của tài liệu ngay trên website.';
  const source = document.createElement('a'); source.className = 'document-source'; source.href = driveUrl(item);
  source.target = '_blank'; source.rel = 'noopener noreferrer'; source.textContent = source.href;
  heading.append(tag, title, summary, source);
  const open = document.createElement('a'); open.className = 'primary-button'; open.href = driveUrl(item);
  open.target = '_blank'; open.rel = 'noopener noreferrer'; open.textContent = 'Mở trên Google Drive ↗';
  head.append(heading, open);
  document.getElementById('drive-frame').src = `https://drive.google.com/file/d/${item.key}/preview`;
  document.getElementById('save-shortcut').href = shortcutUrl(item);
  const related = resources.filter(other => other.kind === 'drive' && other.category === item.category && other.id !== item.id).slice(0, 4);
  const relatedList = document.getElementById('related');
  if (related.length === 0) { relatedList.textContent = 'Chưa có tài liệu khác trong danh mục này.'; }
  for (const other of related) {
    const a = document.createElement('a'); a.href = itemUrl(other); a.textContent = `${other.title} →`; relatedList.append(a);
  }
}

if (document.getElementById('cards')) setupHome();
if (document.getElementById('intro-dialog')) setupIntro();
if (document.getElementById('drive-frame')) setupDocument();
