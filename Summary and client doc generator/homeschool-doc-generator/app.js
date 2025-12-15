let logo = null;

let docData = {
  title: "Homeschool Support Summary",
  subtitle: "Faithful Way Homeschool Solutions",
  state: "Texas",
  sections: [
    {
      id: 1,
      title: "Purpose of This Summary:",
      content:
`This support summary gives a clear understanding of Texas homeschool requirements, considerations for choosing curriculum, and a personalized plan based on goals and learning style.`,
      bgColor: "#e8dce8"
    },
    {
      id: 2,
      title: "Texas Homeschool Requirements (Detailed Overview)",
      content:
`Texas is one of the most flexible homeschooling states...`,
      bgColor: "#e8dce8"
    }
  ]
};

/* ------------------------------
   RENDER PREVIEW
--------------------------------*/
function renderPreview() {
  const preview = document.getElementById("document-preview");
  preview.innerHTML = `
    <div class="doc-header">
      <div class="logo-box">
        ${logo ? `<img src="${logo}">` : `Logo Area`}
      </div>

      <div class="header-text">
        <h1 style="font-size:34px; margin:0; font-style:italic;">${docData.title}</h1>
        <h2 style="margin:6px 0; color:#7a5a7a;">${docData.subtitle}</h2>
        <p style="margin:0;">State: ${docData.state}</p>
      </div>
    </div>

    ${docData.sections.map(sec => `
      <div class="section" style="background:${sec.bgColor}; page-break-inside: avoid;">
        <div class="section-title">${sec.title}</div>
        <div class="section-body">${sec.content}</div>
      </div>
    `).join("")}
  `;
}

/* ------------------------------
   RENDER EDITOR
--------------------------------*/
function renderEditor() {
  const editor = document.getElementById("editor");

  editor.innerHTML = docData.sections.map(section => `
    <div class="edit-block" data-id="${section.id}">
      <label>Section Title</label>
      <input type="text" class="titleInput" value="${section.title}">

      <label>Background Color</label>
      <input type="color" class="colorInput" value="${section.bgColor}">

      <label>Content <span style="font-weight: normal; font-size: 12px; color: #888;">(HTML supported: use &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt; tags)</span></label>
      <div class="formatting-toolbar">
        <button type="button" onclick="insertFormatting(${section.id}, '<p>', '</p>')" title="Paragraph">¶ P</button>
        <button type="button" onclick="insertFormatting(${section.id}, '<ul>\\n  <li>', '</li>\\n</ul>')" title="Bullet List">• List</button>
        <button type="button" onclick="insertFormatting(${section.id}, '<strong>', '</strong>')" title="Bold"><b>B</b></button>
        <button type="button" onclick="insertFormatting(${section.id}, '<em>', '</em>')" title="Italic"><i>I</i></button>
      </div>
      <textarea class="contentInput">${section.content}</textarea>

      <button class="deleteBtn" style="background:#b84040; margin-top:10px;">Delete</button>
    </div>
  `).join("");

  attachEditorEvents();
}

/* ------------------------------
   FORMATTING HELPER
--------------------------------*/
function insertFormatting(sectionId, openTag, closeTag) {
  const section = docData.sections.find(s => s.id === sectionId);
  const textarea = document.querySelector(`[data-id="${sectionId}"] .contentInput`);

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);

  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);

  const newContent = before + openTag + selectedText + closeTag + after;

  textarea.value = newContent;
  section.content = newContent;
  renderPreview();

  // Set cursor position after inserted tags
  const newCursorPos = start + openTag.length + selectedText.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos);
  textarea.focus();
}

/* ------------------------------
   EVENT HANDLERS
--------------------------------*/
document.getElementById("titleInput").addEventListener("input", e => {
  docData.title = e.target.value;
  renderPreview();
});

document.getElementById("subtitleInput").addEventListener("input", e => {
  docData.subtitle = e.target.value;
  renderPreview();
});

document.getElementById("stateInput").addEventListener("input", e => {
  docData.state = e.target.value;
  renderPreview();
});

/* Logo upload */
document.getElementById("logoInput").addEventListener("change", e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = f => {
    logo = f.target.result;
    renderPreview();
  };
  reader.readAsDataURL(file);
});

/* Add Section */
document.getElementById("addSectionBtn").addEventListener("click", () => {
  const newSection = {
    id: Date.now(),
    title: "New Section Title:",
    content: "Enter your content...",
    bgColor: "#e8dce8"
  };

  docData.sections.push(newSection);
  renderEditor();
  renderPreview();
});

/* Attach listeners inside editor */
function attachEditorEvents() {
  document.querySelectorAll(".edit-block").forEach(block => {
    const id = parseInt(block.dataset.id);
    const section = docData.sections.find(s => s.id === id);

    block.querySelector(".titleInput").addEventListener("input", e => {
      section.title = e.target.value;
      renderPreview();
    });

    block.querySelector(".colorInput").addEventListener("input", e => {
      section.bgColor = e.target.value;
      renderPreview();
    });

    block.querySelector(".contentInput").addEventListener("input", e => {
      section.content = e.target.value;
      renderPreview();
    });

    block.querySelector(".deleteBtn").addEventListener("click", () => {
      docData.sections = docData.sections.filter(s => s.id !== id);
      renderEditor();
      renderPreview();
    });
  });
}

/* ------------------------------
   EXPORT TO PDF (print)
--------------------------------*/
document.getElementById("exportPDFBtn").addEventListener("click", () => {
  const printWindow = window.open("", "_blank");
  const content = document.getElementById("document-preview").innerHTML;

  printWindow.document.write(`
    <html>
    <head>
      <title>${docData.title}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          padding: 20px;
          margin: 0;
          background: white;
        }

        /* Document Header */
        .doc-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }
        .logo-box {
          width: 160px;
          height: 160px;
          border-radius: 20px;
          overflow: hidden;
          background: #d4c4d4;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .logo-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .header-text {
          flex: 1;
          padding: 20px;
          background: #e8dce8;
          border-radius: 16px;
        }
        .header-text h1 {
          font-size: 34px;
          margin: 0;
          font-style: italic;
          color: #000;
        }
        .header-text h2 {
          margin: 6px 0 0;
          color: #7a5a7a;
          font-size: 20px;
        }
        .header-text p {
          margin: 0;
        }

        /* Sections */
        .section {
          margin-top: 20px;
          padding: 20px;
          border-radius: 16px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #000;
        }
        .section-body {
          line-height: 1.6;
          color: #333;
        }

        /* Content Formatting */
        .section-body p {
          margin: 10px 0;
        }
        .section-body p:first-child {
          margin-top: 0;
        }
        .section-body p:last-child {
          margin-bottom: 0;
        }
        .section-body ul,
        .section-body ol {
          margin: 10px 0;
          padding-left: 25px;
        }
        .section-body li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
        .section-body strong {
          font-weight: 600;
          color: #000;
        }
        .section-body em {
          font-style: italic;
        }

        @media print {
          body { padding: 10px; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      ${content}
      <script>
        window.onload = () => {
          window.print();
          setTimeout(() => window.close(), 300);
        };
      <\/script>
    </body>
    </html>
  `);

  printWindow.document.close();
});

/* ------------------------------
   INITIAL RENDER
--------------------------------*/
renderEditor();
renderPreview();
