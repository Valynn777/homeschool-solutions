// ------------------ GLOBAL STATE ------------------
let data = {
  currentPage: 0,
  pages: [],
  font: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
  primaryColor: '#667eea',
  secondaryColor: '#764ba2'
};

let currentElement = null;   // element being edited/created
let editingIndex = null;     // index within page elements
let draggedElement = null;   // for drag+drop

// ------------------ UTILITIES ------------------
function setThemeVars() {
  document.documentElement.style.setProperty('--primary', data.primaryColor);
  document.documentElement.style.setProperty('--secondary', data.secondaryColor);
  document.documentElement.style.setProperty('--font', data.font);
}
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
function escapeHtmlAttr(s){ return escapeHtml(s).replace(/"/g,'&quot;'); }

// FNV-1a hash to namespace progress keys
function hashString(s){
  let h = 2166136261 >>> 0;
  for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h>>>0).toString(16);
}

// ------------------ INIT ------------------
function init() {
  // at least one page
  if (!Array.isArray(data.pages) || !data.pages.length) {
    addPage();
  }
  setThemeVars();
  renderPages();
  renderCanvas();
}

// ------------------ PAGES ------------------
function addPage() {
  const pageNum = data.pages.length + 1;
  data.pages.push({ name: `Page ${pageNum}`, elements: [] });
  data.currentPage = data.pages.length - 1;
  renderPages();
  renderCanvas();
}
function deletePage(index) {
  if (data.pages.length === 1) {
    showMessage('Cannot Delete', 'You must have at least one page.');
    return;
  }
  if (confirm('Delete this page?')) {
    data.pages.splice(index, 1);
    if (data.currentPage >= data.pages.length) data.currentPage = data.pages.length - 1;
    renderPages();
    renderCanvas();
  }
}
function switchPage(index) {
  data.currentPage = index;
  renderPages();
  renderCanvas();
}
function renderPages() {
  const list = document.getElementById('pagesList');
  list.innerHTML = data.pages.map((page, idx) => `
    <div class="page-item ${idx === data.currentPage ? 'active' : ''}" onclick="switchPage(${idx})">
      <input type="text" value="${escapeHtmlAttr(page.name)}"
        onchange="updatePageName(${idx}, this.value)"
        onclick="event.stopPropagation()">
      <button class="delete-page" onclick="event.stopPropagation(); deletePage(${idx})">🗑</button>
    </div>
  `).join('');
}
function updatePageName(index, name) {
  if (!data.pages[index]) return;
  data.pages[index].name = name;
  if (index === data.currentPage) {
    document.getElementById('pageTitleInput').value = name;
  }
}

// ------------------ CANVAS RENDER ------------------
function renderCanvas() {
  const page = data.pages[data.currentPage];
  const titleInput = document.getElementById('pageTitleInput');
  if (page && titleInput) titleInput.value = page.name;

  const content = document.getElementById('canvasContent');
  content.innerHTML = page.elements.map((el, idx) => {
    let html = `<div class="element" draggable="true"
                  ondragstart="handleDragStart(event, ${idx})"
                  ondragover="handleDragOver(event)"
                  ondragleave="handleDragLeave(event)"
                  ondrop="handleDrop(event, ${idx})"
                  ondragend="handleDragEnd(event)">
      <div class="element-controls">
        <button class="edit-btn" onclick="editElement(${idx})">✏️ Edit</button>
        <button class="move-up-btn" onclick="moveElement(${idx}, -1)">↑</button>
        <button class="move-down-btn" onclick="moveElement(${idx}, 1)">↓</button>
        <button class="delete-btn" onclick="deleteElement(${idx})">🗑 Delete</button>
      </div>`;

    switch (el.type) {
      case 'heading':
        html += `<div class="heading-element">${escapeHtml(el.content || '')}</div>`;
        break;
      case 'text':
        html += `<div class="text-element">${escapeHtml(el.content || '')}</div>`;
        break;
      case 'image':
        const heightStyle = el.heightPct > 0 ? `height:${el.heightPct}%;object-fit:cover;` : '';
        html += `<div class="image-wrap" style="width:${Number(el.widthPct || 100)}%">`;
        if (el.src) {
          html += `<img src="${escapeHtmlAttr(el.src)}" class="image-element" style="${heightStyle}" alt="Image">`;
        } else {
          html += `<div class="tiny">No image selected.</div>`;
        }
        html += `</div>`;
        break;
      case 'list':
        html += `<ul class="list-element">${(el.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
        break;
      case 'mcq':
        html += `<div class="mcq-element">
          <div class="mcq-question">${escapeHtml(el.question || '')}</div>
          ${(el.options || []).map((opt, optIdx) =>
            `<div class="mcq-option">${escapeHtml(opt)} ${optIdx === el.correct ? '<span class="correct-badge">✓ Correct</span>' : ''}</div>`
          ).join('')}
        </div>`;
        break;
      case 'fib':
        html += `<div class="fib-element">
          <div class="fib-question">${escapeHtml(el.question || '')}</div>
          <div class="tiny" style="margin-top:10px;">Answer: ${escapeHtml(el.answer || '')}</div>
        </div>`;
        break;
      case 'namefield':
        html += `<div class="namefield-element">
          <strong>${escapeHtml(el.label || '')}</strong>
          <div class="tiny" style="margin-top:8px;">Placeholder: ${escapeHtml(el.placeholder || '')}</div>
        </div>`;
        break;
      case 'flipcard':
        html += `<div class="flipcard-element">
          <div class="flipcard-inner">
            <div class="flipcard-face flipcard-front"><strong>Front:</strong><br>${escapeHtml(el.front || '')}</div>
            <div class="flipcard-face flipcard-back"><strong>Back:</strong><br>${escapeHtml(el.back || '')}</div>
          </div>
          <div class="tiny" style="margin-top:6px;">(Full flip animation in exported lesson)</div>
        </div>`;
        break;
      case 'popout':
        html += `<div class="popout-element">
          <div class="popout-trigger">💬 ${escapeHtml(el.trigger || '')}</div>
          <div class="popout-content show">${escapeHtml(el.content || '')}</div>
        </div>`;
        break;
      case 'highlight':
        html += `<div class="highlight-element">✨ ${escapeHtml(el.content || '')}</div>`;
        break;
    }

    html += `</div>`;
    return html;
  }).join('');
}

// ------------------ ELEMENT EDITOR ------------------
function addElement(type) {
  currentElement = { type };
  editingIndex = null;
  showElementEditor(type);
}
function editElement(index) {
  currentElement = JSON.parse(JSON.stringify(data.pages[data.currentPage].elements[index]));
  editingIndex = index;
  showElementEditor(currentElement.type);
}
function deleteElement(index) {
  if (confirm('Delete this element?')) {
    data.pages[data.currentPage].elements.splice(index, 1);
    renderCanvas();
  }
}
function moveElement(index, direction) {
  const elements = data.pages[data.currentPage].elements;
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= elements.length) return;
  [elements[index], elements[newIndex]] = [elements[newIndex], elements[index]];
  renderCanvas();
}

function showElementEditor(type) {
  const modal = document.getElementById('elementModal');
  const title = document.getElementById('modalTitle');
  const body  = document.getElementById('modalBody');

  title.textContent = editingIndex !== null ? 'Edit Element' : 'Add Element';
  let html = '';

  switch (type) {
    case 'heading':
    case 'text':
    case 'highlight':
      html = `
        <div class="form-group">
          <label>${type === 'heading' ? 'Heading' : type === 'text' ? 'Text' : 'Highlight Text'}</label>
          <textarea id="elementContent" placeholder="Enter ${type} content...">${currentElement.content || ''}</textarea>
        </div>
      `;
      break;

    case 'image':
      html = `
        <div class="form-group">
          <label>Image</label>
          <div class="upload-row">
            <input type="file" id="imageFile" accept="image/*" style="display:none">
            <button class="btn btn-primary" type="button" id="chooseImageBtn">📁 Choose Image</button>
            <button class="btn btn-secondary" type="button" id="clearImageBtn">Clear</button>
          </div>
          <div class="tiny" style="margin-top:6px;">Stored inside your project (base64). Works offline & in export.</div>
          <div class="form-group" style="margin-top:12px;">
            <label>Optional image URL</label>
            <input type="text" id="imageSrc" placeholder="https://example.com/image.jpg" value="${currentElement.src && !String(currentElement.src).startsWith('data:') ? escapeHtmlAttr(currentElement.src) : ''}">
          </div>
          <div class="preview-wrap">
            ${currentElement.src ? `<img id="imagePreview" src="${escapeHtmlAttr(currentElement.src)}" alt="Preview">` : `<img id="imagePreview" style="display:none" alt="Preview">`}
            <span class="tiny" id="imageInfo">${currentElement.src ? infoForSrc(currentElement.src) : ''}</span>
          </div>
          <div class="range-row">
            <label>Width:</label>
            <input type="range" id="imageWidthRange" min="10" max="100" step="1" value="${Number(currentElement.widthPct || 100)}">
            <span class="range-val" id="imageWidthVal">${Number(currentElement.widthPct || 100)}%</span>
          </div>
          <div class="range-row">
            <label>Height:</label>
            <input type="range" id="imageHeightRange" min="0" max="100" step="1" value="${Number(currentElement.heightPct || 0)}">
            <span class="range-val" id="imageHeightVal">${Number(currentElement.heightPct || 0) === 0 ? 'Auto' : Number(currentElement.heightPct || 0) + '%'}</span>
          </div>
          <div class="tiny" style="margin-top:6px;">Set height to 0 for automatic height (maintains aspect ratio). Set a specific percentage to crop/stretch.</div>
        </div>
      `;
      break;

    case 'list':
      html = `
        <div class="form-group">
          <label>List Items</label>
          <div class="list-editor" id="listEditor"></div>
          <button class="btn btn-primary" id="addListItemBtn">+ Add Item</button>
        </div>
      `;
      break;

    case 'mcq':
      html = `
        <div class="form-group">
          <label>Question</label>
          <textarea id="mcqQuestion" placeholder="Enter question...">${currentElement.question || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Options (select the correct answer)</label>
          <div class="mcq-options-editor" id="mcqOptionsEditor"></div>
          <button class="btn btn-primary" id="addMcqOptionBtn">+ Add Option</button>
        </div>
      `;
      break;

    case 'fib':
      html = `
        <div class="form-group">
          <label>Question</label>
          <textarea id="fibQuestion" placeholder="Enter question...">${currentElement.question || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Correct Answer</label>
          <input type="text" id="fibAnswer" placeholder="Enter correct answer..." value="${currentElement.answer || ''}">
        </div>
      `;
      break;

    case 'namefield':
      html = `
        <div class="form-group">
          <label>Label</label>
          <input type="text" id="nameLabel" placeholder="e.g., Student Name" value="${currentElement.label || 'Name:'}">
        </div>
        <div class="form-group">
          <label>Placeholder</label>
          <input type="text" id="namePlaceholder" placeholder="e.g., Enter your name..." value="${currentElement.placeholder || 'Enter your name...'}">
        </div>
      `;
      break;

    case 'flipcard':
      html = `
        <div class="form-group">
          <label>Front Text</label>
          <textarea id="flipFront" placeholder="Front of card...">${currentElement.front || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Back Text</label>
          <textarea id="flipBack" placeholder="Back of card...">${currentElement.back || ''}</textarea>
        </div>
        <div class="tiny">In the exported lesson, the card flips with 3-D animation and a real card look.</div>
      `;
      break;

    case 'popout':
      html = `
        <div class="form-group">
          <label>Trigger Text</label>
          <input type="text" id="popTrigger" placeholder="Click here..." value="${currentElement.trigger || ''}">
        </div>
        <div class="form-group">
          <label>Pop-out Content</label>
          <textarea id="popContent" placeholder="Content to show...">${currentElement.content || ''}</textarea>
        </div>
      `;
      break;
  }

  body.innerHTML = html;
  modal.classList.add('active');

  // hook modal controls
  document.getElementById('cancelElementBtn').onclick = closeElementModal;

  if (type === 'image') {
    const fileInput = document.getElementById('imageFile');
    const chooseBtn = document.getElementById('chooseImageBtn');
    const clearBtn  = document.getElementById('clearImageBtn');
    const urlInput  = document.getElementById('imageSrc');
    const preview   = document.getElementById('imagePreview');
    const info      = document.getElementById('imageInfo');
    const widthRange     = document.getElementById('imageWidthRange');
    const widthRangeVal  = document.getElementById('imageWidthVal');
    const heightRange    = document.getElementById('imageHeightRange');
    const heightRangeVal = document.getElementById('imageHeightVal');

    if (!currentElement.widthPct) currentElement.widthPct = 100;
    if (currentElement.heightPct === undefined) currentElement.heightPct = 0;

    const updatePreviewSize = () => {
      if (preview && preview.src) {
        preview.style.width = currentElement.widthPct + '%';
        preview.style.height = currentElement.heightPct === 0 ? 'auto' : currentElement.heightPct + '%';
      }
    };

    chooseBtn.addEventListener('click', ()=> fileInput.click());
    clearBtn.addEventListener('click', ()=>{
      currentElement.src = '';
      preview.removeAttribute('src');
      preview.style.display = 'none';
      info.textContent = '';
      fileInput.value = '';
      urlInput.value = '';
    });

    fileInput.addEventListener('change', function(){
      const file = this.files && this.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        currentElement.src = e.target.result; // base64
        preview.src = currentElement.src;
        preview.style.display = 'inline-block';
        info.textContent = infoForSrc(currentElement.src, file);
        urlInput.value = '';
        updatePreviewSize();
      };
      reader.readAsDataURL(file);
    });

    urlInput.addEventListener('input', function(){
      if (this.value.trim()) {
        currentElement.src = this.value.trim();
        preview.src = currentElement.src;
        preview.style.display = 'inline-block';
        info.textContent = infoForSrc(currentElement.src);
        fileInput.value = '';
        updatePreviewSize();
      }
    });

    widthRange.addEventListener('input', function(){
      widthRangeVal.textContent = this.value + '%';
      currentElement.widthPct = Number(this.value);
      updatePreviewSize();
    });

    heightRange.addEventListener('input', function(){
      const val = Number(this.value);
      heightRangeVal.textContent = val === 0 ? 'Auto' : val + '%';
      currentElement.heightPct = val;
      updatePreviewSize();
    });

    updatePreviewSize();
  }

  if (type === 'list') {
    if (!currentElement.items) currentElement.items = [''];
    const listEditor = document.getElementById('listEditor');
    const addBtn = document.getElementById('addListItemBtn');

    const renderListEditor = () => {
      listEditor.innerHTML = currentElement.items.map((item, idx) => `
        <div class="list-item">
          <input type="text" value="${escapeHtmlAttr(item)}" data-idx="${idx}" placeholder="List item...">
          <button data-remove="${idx}" class="btn btn-secondary">Remove</button>
        </div>
      `).join('');

      listEditor.querySelectorAll('input[type="text"]').forEach(inp=>{
        inp.addEventListener('input', e=>{
          const i = Number(e.target.getAttribute('data-idx'));
          currentElement.items[i] = e.target.value;
        });
      });
      listEditor.querySelectorAll('button[data-remove]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const i = Number(btn.getAttribute('data-remove'));
          currentElement.items.splice(i,1);
          renderListEditor();
        });
      });
    };

    addBtn.addEventListener('click', ()=>{
      currentElement.items.push('');
      renderListEditor();
    });
    renderListEditor();
  }

  if (type === 'mcq') {
    if (!currentElement.options) currentElement.options = ['',''];
    if (currentElement.correct === undefined) currentElement.correct = 0;

    const editor = document.getElementById('mcqOptionsEditor');
    const addBtn = document.getElementById('addMcqOptionBtn');

    const renderMcqEditor = () => {
      editor.innerHTML = currentElement.options.map((option, idx) => `
        <div class="mcq-option-editor">
          <input type="radio" name="correctOption" ${idx === currentElement.correct ? 'checked' : ''} data-radio="${idx}">
          <input type="text" value="${escapeHtmlAttr(option)}" data-idx="${idx}" placeholder="Option ${idx+1}...">
          <button data-remove="${idx}" class="btn btn-secondary">Remove</button>
        </div>
      `).join('');

      editor.querySelectorAll('input[type="radio"][data-radio]').forEach(r=>{
        r.addEventListener('change', e=>{
          currentElement.correct = Number(e.target.getAttribute('data-radio'));
        });
      });
      editor.querySelectorAll('input[type="text"][data-idx]').forEach(inp=>{
        inp.addEventListener('input', e=>{
          const i = Number(e.target.getAttribute('data-idx'));
          currentElement.options[i] = e.target.value;
        });
      });
      editor.querySelectorAll('button[data-remove]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const i = Number(btn.getAttribute('data-remove'));
          if (currentElement.options.length <= 2) { alert('Must have at least 2 options'); return; }
          currentElement.options.splice(i,1);
          if (currentElement.correct >= currentElement.options.length) currentElement.correct = currentElement.options.length - 1;
          renderMcqEditor();
        });
      });
    };

    addBtn.addEventListener('click', ()=>{
      currentElement.options.push('');
      renderMcqEditor();
    });
    renderMcqEditor();
  }
}

function infoForSrc(src, file) {
  if (!src) return '';
  if (String(src).startsWith('data:')) {
    const sizeKB = file ? Math.round(file.size/1024) : Math.round((src.length*3/4)/1024);
    return `Embedded image (${sizeKB} KB)`;
  }
  return `External URL`;
}

function closeElementModal(){ document.getElementById('elementModal').classList.remove('active'); }

// Save element from modal
function handleSaveElement(){
  const type = currentElement.type;
  switch (type) {
    case 'heading':
    case 'text':
    case 'highlight':
      currentElement.content = (document.getElementById('elementContent') || {}).value || '';
      break;
    case 'image': {
      const url = (document.getElementById('imageSrc') || { value: '' }).value.trim();
      const hasBase64 = currentElement.src && String(currentElement.src).startsWith('data:');
      if (!currentElement.src && !url) {
        alert('Please upload an image or paste an image URL.');
        return;
      }
      if (url && !hasBase64) currentElement.src = url;
      if (!currentElement.widthPct) currentElement.widthPct = 100;
      if (currentElement.heightPct === undefined) currentElement.heightPct = 0;
      break;
    }
    case 'list':
      currentElement.items = (currentElement.items || []).filter(item => (item || '').trim() !== '');
      if (currentElement.items.length === 0) { alert('Please add at least one list item'); return; }
      break;
    case 'mcq':
      currentElement.question = (document.getElementById('mcqQuestion') || {}).value || '';
      currentElement.options = (currentElement.options || []).filter(opt => (opt || '').trim() !== '');
      if (currentElement.options.length < 2) { alert('Please add at least 2 options'); return; }
      if (currentElement.correct >= currentElement.options.length) currentElement.correct = 0;
      break;
    case 'fib':
      currentElement.question = (document.getElementById('fibQuestion') || {}).value || '';
      currentElement.answer   = (document.getElementById('fibAnswer') || {}).value || '';
      break;
    case 'namefield':
      currentElement.label = (document.getElementById('nameLabel') || {}).value || '';
      currentElement.placeholder = (document.getElementById('namePlaceholder') || {}).value || '';
      break;
    case 'flipcard':
      currentElement.front = (document.getElementById('flipFront') || {}).value || '';
      currentElement.back  = (document.getElementById('flipBack') || {}).value || '';
      break;
    case 'popout':
      currentElement.trigger = (document.getElementById('popTrigger') || {}).value || '';
      currentElement.content = (document.getElementById('popContent') || {}).value || '';
      break;
  }

  if (editingIndex !== null) {
    data.pages[data.currentPage].elements[editingIndex] = currentElement;
  } else {
    data.pages[data.currentPage].elements.push(currentElement);
  }
  closeElementModal();
  renderCanvas();
  showNotification('Element saved!');
}

// ------------------ DRAG ------------------
function handleDragStart(e, index) {
  draggedElement = index;
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}
function handleDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); e.dataTransfer.dropEffect = 'move'; }
function handleDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
function handleDrop(e, dropIndex) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');

  if (draggedElement !== null && draggedElement !== dropIndex) {
    const elements = data.pages[data.currentPage].elements;
    const draggedItem = elements[draggedElement];
    elements.splice(draggedElement, 1);
    elements.splice(draggedElement < dropIndex ? dropIndex - 1 : dropIndex, 0, draggedItem);
    renderCanvas();
  }
}
function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  draggedElement = null;
  document.querySelectorAll('.element').forEach(el => el.classList.remove('drag-over'));
}

// ------------------ SAVE/LOAD/EXPORT ------------------
function saveTemplate() {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'lesson-template.json'; a.click();
  showNotification('Template saved!');
}
function loadTemplate() { document.getElementById('fileInput').click(); }
function loadProject(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const loaded = JSON.parse(e.target.result);
      data = loaded || {};
      if (!Array.isArray(data.pages)) data.pages = [];
      if (!data.pages.length) data.pages = [{ name: 'Page 1', elements: [] }];

      // defaults
      data.font = data.font || "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif";
      data.primaryColor = data.primaryColor || '#667eea';
      data.secondaryColor = data.secondaryColor || '#764ba2';

      // apply UI
      document.getElementById('fontSelector').value = data.font;
      document.getElementById('primaryColor').value = data.primaryColor;
      document.getElementById('secondaryColor').value = data.secondaryColor;

      setThemeVars();
      renderPages(); renderCanvas();
      showNotification('Template loaded!');
    } catch (err) {
      showMessage('Error', 'Invalid file format: ' + err.message);
    }
  };
  reader.readAsText(file);
}
function downloadProject() {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'lesson-project.json'; a.click();
  showNotification('Project downloaded!');
}

// Exported HTML generator
function exportLesson() {
  const keyBase = (data.pages||[]).map(p=>p.name).join('|') + '::' + data.pages.length + '::' + data.primaryColor + '::' + data.secondaryColor + '::' + data.font;
  const LESSON_KEY = 'lp_' + hashString(keyBase);

  const escHtml = s => String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const enc = s => encodeURIComponent(String(s||''));

  let h = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">';
  h += '<meta name="viewport" content="width=device-width,initial-scale=1.0">';
  h += '<title>Interactive Lesson</title>';
  h += '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></'+'script>';
  h += `<style>
    :root{ --primary:${data.primaryColor}; --secondary:${data.secondaryColor}; --font:${data.font}; }
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:var(--font);background:linear-gradient(135deg,var(--primary) 0%,var(--secondary) 100%);min-height:100vh;padding:20px}
    .lesson{max-width:900px;margin:0 auto;background:white;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.2);overflow:hidden}
    .header{background:linear-gradient(135deg,var(--primary) 0%,var(--secondary) 100%);color:white;padding:25px;text-align:center}
    .header h1{font-size:32px;margin-bottom:8px}.header p{font-size:16px;opacity:0.9}
    .content{display:none;padding:30px}.content.active{display:block}
    .page-title{font-size:28px;font-weight:700;margin-bottom:25px;padding-bottom:12px;border-bottom:3px solid var(--primary)}
    .element{margin-bottom:25px}
    .heading-element{font-size:22px;font-weight:700;color:#24292e;border-bottom:2px solid var(--primary);padding-bottom:8px}
    .text-element{font-size:16px;line-height:1.7;color:#24292e;white-space:pre-wrap}
    .image-wrap{max-width:100%}
    .image-element{width:100%;display:block;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
    .list-element{padding-left:25px}.list-element li{margin-bottom:10px;line-height:1.6}
    .mcq-element{background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 12%, white), color-mix(in srgb,var(--primary) 3%, white));padding:20px;border-radius:8px;border:2px solid color-mix(in srgb,var(--primary) 45%, #64b5f6)}
    .mcq-question{font-weight:600;margin-bottom:15px;font-size:17px;color:var(--primary)}
    .mcq-options{display:flex;flex-direction:column;gap:10px}
    .mcq-option{padding:12px 15px;background:white;border-radius:8px;border:2px solid #e1e4e8;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:10px}
    .mcq-option:hover{border-color:var(--primary);transform:translateX(5px)}
    .mcq-option.correct{background:color-mix(in srgb,#28a745 15%, white);border-color:#28a745}
    .mcq-option.incorrect{background:color-mix(in srgb,#dc3545 12%, white);border-color:#dc3545}
    .mcq-option input[type="radio"]{width:18px;height:18px;cursor:pointer}
    .fib-element{background:linear-gradient(135deg,color-mix(in srgb,var(--secondary) 12%, white), color-mix(in srgb,var(--secondary) 3%, white));padding:20px;border-radius:8px;border:2px solid var(--secondary)}
    .fib-question{font-weight:600;margin-bottom:15px;font-size:17px;color:var(--secondary)}
    .fib-input{width:100%;padding:12px;border:2px solid #e1e4e8;border-radius:6px;font-size:15px;margin-bottom:10px}
    .fib-btn{padding:10px 20px;background:var(--primary);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px}
    .fib-btn:hover{filter:brightness(0.95)}
    .fib-feedback{margin-top:10px;padding:10px;border-radius:6px;font-weight:600;display:none}
    .fib-feedback.correct{background:color-mix(in srgb,#28a745 15%, white);color:#155724}
    .fib-feedback.incorrect{background:color-mix(in srgb,#dc3545 12%, white);color:#721c24}
    .namefield-element{background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 10%, white), white);padding:20px;border-radius:8px;border:2px solid var(--primary)}
    .namefield-input{width:100%;padding:12px;border:2px solid #e1e4e8;border-radius:6px;font-size:15px;margin-top:10px}
    .flipcard-element{position:relative;perspective:1000px;cursor:pointer}
    .flipcard-inner{position:relative;width:100%;min-height:150px;transition:transform .6s;transform-style:preserve-3d}
    .flipcard-element.flipped .flipcard-inner{transform:rotateY(180deg)}
    .flipcard-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:14px;border:2px solid color-mix(in srgb,var(--primary) 55%, var(--secondary) 45%);box-shadow:0 10px 24px rgba(0,0,0,.1);padding:16px 18px}
    .flipcard-front{background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 12%, white), white)}
    .flipcard-back{transform:rotateY(180deg);background:linear-gradient(135deg,color-mix(in srgb,var(--secondary) 12%, white), white)}
    .flip-btn{margin-top:12px;padding:10px 16px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600}
    .popout-element{background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 8%, white), white);padding:20px;border-radius:8px;border:2px solid var(--primary)}
    .popout-trigger{cursor:pointer;font-weight:600;color:#fff;padding:10px;background:var(--primary);border-radius:8px;display:inline-block}
    .popout-trigger:hover{filter:brightness(0.95)}
    .popout-content{display:none;margin-top:15px;padding:15px;background:white;border-radius:8px;border-left:5px solid var(--primary)}
    .popout-content.show{display:block}
    .highlight-element{background:color-mix(in srgb, var(--primary) 12%, #ffffcc);padding:15px;border-left:6px solid var(--primary);font-weight:500;font-size:16px}
    .nav{display:flex;justify-content:space-between;align-items:center;padding:20px;background:#f8f9fa;border-top:1px solid #e1e4e8}
    .nav-btn{padding:12px 24px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;transition:all 0.2s}
    .nav-btn:hover{opacity:0.93;transform:translateY(-2px)}
    .nav-btn:disabled{background:#ccc;cursor:not-allowed;transform:none}
    #pageInd{font-weight:600;color:#24292e}
    .controls{text-align:center;padding:20px;background:#f8f9fa;border-top:1px solid #e1e4e8}
    .control-btn{padding:12px 24px;margin:0 8px;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.2s}
    .save-btn{background:#28a745;color:white}
    .save-btn:hover{filter:brightness(0.95)}
    .download-btn{background:#6610f2;color:white}
    .download-btn:hover{filter:brightness(0.95)}
    .notification{position:fixed;top:20px;right:20px;padding:15px 20px;background:#28a745;color:white;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:3000;opacity:0;transform:translateY(-20px);transition:all 0.3s}
    .notification.show{opacity:1;transform:translateY(0)}
  </style></head><body>`;

  h += '<div class="lesson"><div class="header"><h1>📚 Interactive Lesson</h1><p>Complete all activities as you progress through the pages</p></div>';

  // Pages & elements
  data.pages.forEach((page, pageIdx) => {
    h += `<div class="content${pageIdx === 0 ? ' active' : ''}" id="page${pageIdx}">`;
    h += `<div class="page-title">${escHtml(page.name)}</div>`;

    page.elements.forEach((el, elIdx) => {
      h += '<div class="element">';
      switch (el.type) {
        case 'heading':
          h += `<div class="heading-element">${escHtml(el.content)}</div>`;
          break;
        case 'text':
          h += `<div class="text-element">${escHtml(el.content)}</div>`;
          break;
        case 'image': {
          const imgHeightStyle = el.heightPct > 0 ? `height:${el.heightPct}%;object-fit:cover;` : '';
          h += `<div class="image-wrap" style="width:${Number(el.widthPct || 100)}%">`;
          if (el.src) h += `<img src="${el.src}" class="image-element" style="${imgHeightStyle}" alt="Image">`;
          h += `</div>`;
          break;
        }
        case 'list':
          h += '<ul class="list-element">';
          (el.items || []).forEach(item => h += `<li>${escHtml(item)}</li>`);
          h += '</ul>';
          break;
        case 'mcq': {
          const mcqId = `mcq-${pageIdx}-${elIdx}`;
          const correct = Number(el.correct) || 0;
          h += '<div class="mcq-element">';
          h += `<div class="mcq-question">${escHtml(el.question || '')}</div>`;
          h += `<div class="mcq-options" data-save-id="${mcqId}">`;
          (el.options || []).forEach((opt, optIdx) => {
            h += `<label class="mcq-option" data-option-idx="${optIdx}">`;
            h += `<input type="radio" name="${mcqId}" value="${optIdx}" onchange="checkMCQ('${mcqId}',${optIdx},${correct})">`;
            h += `<span>${escHtml(opt)}</span>`;
            h += '</label>';
          });
          h += '</div></div>';
          break;
        }
        case 'fib': {
          const fibId = `fib-${pageIdx}-${elIdx}`;
          const ans = enc(el.answer || '');
          h += '<div class="fib-element">';
          h += `<div class="fib-question">${escHtml(el.question || '')}</div>`;
          h += `<input type="text" class="fib-input" id="${fibId}">`;
          h += `<button class="fib-btn" onclick="checkFIB('${fibId}', decodeURIComponent('${ans}'))">Check Answer</button>`;
          h += `<div class="fib-feedback" id="${fibId}-fb"></div>`;
          h += '</div>';
          break;
        }
        case 'namefield':
          h += '<div class="namefield-element">';
          h += `<label style="font-weight:600;margin-bottom:10px;display:block">Name</label>`;
          h += `<input type="text" class="namefield-input" placeholder="${escHtml(el.placeholder||'Enter your name...')}">`;
          h += '</div>';
          break;
        case 'flipcard': {
          const flipId = `flip-${pageIdx}-${elIdx}`;
          h += `<div class="flipcard-element" id="${flipId}" onclick="toggleFlip('${flipId}')" tabindex="0">`;
          h += '<div class="flipcard-inner">';
          h += `<div class="flipcard-face flipcard-front"><strong>Front:</strong><br>${escHtml(el.front||'')}</div>`;
          h += `<div class="flipcard-face flipcard-back"><strong>Back:</strong><br>${escHtml(el.back||'')}</div>`;
          h += '</div>';
          h += `<button class="flip-btn" onclick="event.stopPropagation();toggleFlip('${flipId}')">🔄 Flip Card</button>`;
          h += '</div>';
          break;
        }
        case 'popout': {
          const popId = `pop-${pageIdx}-${elIdx}`;
          h += '<div class="popout-element">';
          h += `<div class="popout-trigger" onclick="togglePop('${popId}')">💬 ${escHtml(el.trigger||'More')}</div>`;
          h += `<div class="popout-content" id="${popId}">${escHtml(el.content||'')}</div>`;
          h += '</div>';
          break;
        }
        case 'highlight':
          h += `<div class="highlight-element">✨ ${escHtml(el.content||'')}</div>`;
          break;
      }
      h += '</div>';
    });

    h += '</div>';
  });

  // Controls + Nav
  h += '<div class="controls">';
  h += '<button class="control-btn save-btn" onclick="saveProgress()">💾 Save Progress</button>';
  h += '<button class="control-btn download-btn" onclick="downloadWork()">⬇️ Download Work</button>';
  h += '</div>';

  h += '<div class="nav">';
  h += '<button class="nav-btn" id="prevBtn" onclick="prevPage()">← Previous</button>';
  h += `<span id="pageInd">Page 1 of ${data.pages.length}</span>`;
  h += '<button class="nav-btn" id="nextBtn" onclick="nextPage()">Next →</button>';
  h += '</div>';

  h += '</div><div class="notification" id="saveNotification"></div>';

  // Exported JS
  h += '<script>';
  h += `var LESSON_KEY="${LESSON_KEY}"; var STORAGE_KEY="lessonProgress:"+LESSON_KEY; var currentPage=0,totalPages=${data.pages.length};`;
  h += `
    function showPage(n){
      document.querySelectorAll(".content").forEach(c=>c.classList.remove("active"));
      const pg=document.getElementById("page"+n); if(pg) pg.classList.add("active");
      document.getElementById("pageInd").textContent="Page "+(n+1)+" of "+totalPages;
      document.getElementById("prevBtn").disabled=(n===0);
      document.getElementById("nextBtn").disabled=(n===totalPages-1);
      window.scrollTo(0,0);
    }
    function prevPage(){ if(currentPage>0){ currentPage--; showPage(currentPage); } }
    function nextPage(){ if(currentPage<totalPages-1){ currentPage++; showPage(currentPage); } }
    function checkMCQ(id, idx, correct){
      const container=document.querySelector('.mcq-options[data-save-id="'+id+'"]'); if(!container) return;
      const options=container.querySelectorAll(".mcq-option");
      options.forEach(opt=>opt.classList.remove("correct","incorrect"));
      if(idx===correct){ options[idx].classList.add("correct"); }
      else { options[idx].classList.add("incorrect"); if(options[correct]) options[correct].classList.add("correct"); }
      saveProgress();
    }
    function checkFIB(id, ans){
      const inp=document.getElementById(id); const fb=document.getElementById(id+"-fb");
      fb.style.display="block";
      if((inp.value||"").trim().toLowerCase()===(ans||"").toLowerCase()){ fb.className="fib-feedback correct"; fb.textContent="✓ Correct!"; }
      else { fb.className="fib-feedback incorrect"; fb.textContent="✗ Try again"; }
      saveProgress();
    }
    function toggleFlip(id){ const el=document.getElementById(id); if(el) el.classList.toggle("flipped"); }
    function togglePop(id){ const el=document.getElementById(id); if(el) el.classList.toggle("show"); }
    function saveProgress(){
      const progress={ currentPage: currentPage, answers:{} };
      document.querySelectorAll(".mcq-options").forEach(mcq=>{
        const id=mcq.getAttribute("data-save-id"); const selected=mcq.querySelector("input:checked");
        if(selected){ const option=selected.closest(".mcq-option");
          progress.answers[id]={type:"mcq",value:parseInt(selected.value),correct:option.classList.contains("correct")}; }
      });
      document.querySelectorAll(".fib-input").forEach(inp=>{
        if(inp.value){ progress.answers[inp.id]={type:"fib",value:inp.value}; }
      });
      document.querySelectorAll(".namefield-input").forEach((inp,i)=>{
        if(inp.value){ progress.answers["name_"+i]={type:"name",value:inp.value}; }
      });
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); showNotification("Progress Saved!"); }catch(e){}
    }
    function showNotification(msg){ const n=document.getElementById("saveNotification"); n.textContent=msg; n.classList.add("show"); setTimeout(()=>n.classList.remove("show"),2000); }
    async function downloadWork(){
      try{
        const{jsPDF}=window.jspdf; const doc=new jsPDF();
        let y=20, lineHeight=7, pageHeight=doc.internal.pageSize.height, margin=20;
        doc.setFontSize(18); doc.text("My Lesson Work",105,y,"center"); y+=15;
        doc.setFontSize(10); doc.text("Date: "+new Date().toLocaleString(),margin,y); y+=10;
        doc.setFontSize(12); let count=0;
        document.querySelectorAll(".namefield-input").forEach(inp=>{ if(inp.value){ if(y>pageHeight-margin){doc.addPage();y=margin} doc.text("Name: "+inp.value,margin,y); y+=lineHeight; count++; }});
        document.querySelectorAll(".mcq-option.correct, .mcq-option.incorrect").forEach(opt=>{
          const q=opt.closest(".mcq-element").querySelector(".mcq-question").textContent;
          const a=opt.querySelector("span").textContent; const correct=opt.classList.contains("correct");
          if(y>pageHeight-margin){doc.addPage();y=margin} doc.text("Q: "+q,margin,y); y+=lineHeight;
          doc.text("A: "+a+" "+(correct?"[Correct]":"[Incorrect]"),margin+5,y); y+=lineHeight+3; count++;
        });
        document.querySelectorAll(".fib-input").forEach(inp=>{
          if(inp.value){ const q=inp.closest(".fib-element").querySelector(".fib-question").textContent;
            if(y>pageHeight-margin){doc.addPage();y=margin} doc.text("Q: "+q,margin,y); y+=lineHeight;
            doc.text("A: "+inp.value,margin+5,y); y+=lineHeight+3; count++; }
        });
        if(count===0){ doc.text("No answers recorded yet.",margin,y); }
        doc.save("my-work.pdf"); showNotification("Work Downloaded!");
      }catch(e){ alert("PDF failed to generate. Ensure you’re online so jsPDF can load."); }
    }
    function loadProgress(){
      try{
        const saved=localStorage.getItem(STORAGE_KEY);
        if(!saved){ currentPage=0; showPage(0); return; } // default to page 1
        const progress=JSON.parse(saved);
        if(typeof progress.currentPage==="number"){ currentPage=Math.min(Math.max(0,progress.currentPage), totalPages-1); } else { currentPage=0; }
        showPage(currentPage);
        Object.keys(progress.answers||{}).forEach(id=>{
          const answer=progress.answers[id];
          if(answer.type==="mcq"){
            const mcq=document.querySelector('.mcq-options[data-save-id="'+id+'"]');
            if(mcq){ const option=mcq.querySelector('.mcq-option[data-option-idx="'+answer.value+'"]');
              if(option){ const input=option.querySelector("input"); if(input) input.checked=true; option.classList.add(answer.correct?"correct":"incorrect"); }}
          } else if(answer.type==="fib"){
            const inp=document.getElementById(id); if(inp) inp.value=answer.value;
          } else if(answer.type==="name"){
            const idx=parseInt(id.split("_")[1]); const input=document.querySelectorAll(".namefield-input")[idx]; if(input) input.value=answer.value;
          }
        });
      }catch(e){ showPage(0); }
    }
    window.addEventListener("load", loadProgress);
  `;
  h += '</'+'script></body></html>';

  const blob = new Blob([h], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'interactive-lesson.html'; a.click();
  showNotification('Lesson exported!');
}

// ------------------ UI HELPERS ------------------
function showMessage(title, message) {
  document.getElementById('modalMessageTitle').textContent = title;
  document.getElementById('modalMessage').textContent = message;
  document.getElementById('messageModal').classList.add('active');
}
function closeMessage() { document.getElementById('messageModal').classList.remove('active'); }
function showNotification(msg) {
  const notif = document.getElementById('notification');
  notif.textContent = msg;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 2000);
}

// ------------------ EVENT WIRING ------------------
window.addEventListener('DOMContentLoaded', () => {
  // top inputs
  document.getElementById('pageTitleInput').addEventListener('input', function() {
    if (data.pages && data.pages[data.currentPage]) {
      data.pages[data.currentPage].name = this.value;
      renderPages();
    }
  });

  document.getElementById('addPageBtn').addEventListener('click', addPage);

  document.getElementById('fontSelector').addEventListener('change', function(){
    data.font = this.value; setThemeVars();
  });
  document.getElementById('primaryColor').addEventListener('change', function(){
    data.primaryColor = this.value; setThemeVars(); renderCanvas();
  });
  document.getElementById('secondaryColor').addEventListener('change', function(){
    data.secondaryColor = this.value; setThemeVars(); renderCanvas();
  });
  document.getElementById('resetThemeBtn').addEventListener('click', function(){
    data.primaryColor = '#667eea'; data.secondaryColor = '#764ba2'; setThemeVars();
    document.getElementById('primaryColor').value = data.primaryColor;
    document.getElementById('secondaryColor').value = data.secondaryColor;
    renderCanvas(); showNotification('Theme reset to defaults');
  });

  // file/template
  document.getElementById('saveTemplateBtn').addEventListener('click', saveTemplate);
  document.getElementById('loadTemplateBtn').addEventListener('click', ()=> document.getElementById('fileInput').click());
  document.getElementById('fileInput').addEventListener('change', function(e) {
    if (e.target.files.length > 0) loadProject(e.target.files[0]);
  });
  document.getElementById('downloadProjectBtn').addEventListener('click', downloadProject);

  // export
  document.getElementById('exportLessonBtn').addEventListener('click', exportLesson);

  // modal buttons
  document.getElementById('closeModalBtn').addEventListener('click', closeMessage);
  document.getElementById('saveElementBtn').addEventListener('click', handleSaveElement);

  // element add buttons
  document.querySelectorAll('.element-btn').forEach(btn => {
    btn.addEventListener('click', function() { addElement(this.getAttribute('data-type')); });
  });

  init();
});
