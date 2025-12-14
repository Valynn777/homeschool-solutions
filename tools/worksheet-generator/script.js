function generateWorksheet() {
  const title = document.getElementById("titleInput").value;
  const header = document.getElementById("headerInput").value;
  const mainText = document.getElementById("mainText").value.replace(/\n/g, "<br>");
  const activityText = document.getElementById("activityText").value;
  const tfFormat = document.getElementById("tfFormat").checked;
  const imgFile = document.getElementById("imgUpload").files[0];

  const output = document.getElementById("output");

  let imgHTML = "";
  if (imgFile) {
    const imgURL = URL.createObjectURL(imgFile);
    imgHTML = `<img src="${imgURL}" alt="Worksheet Image">`;
  }

  // Format activities
  let activityHTML = '';
  if (tfFormat && activityText.trim()) {
    const statements = activityText.split('\n').filter(s => s.trim());
    activityHTML = '<div style="margin-top: 1rem;">';
    statements.forEach((statement, index) => {
      activityHTML += `
        <div style="display: flex; align-items: flex-start; margin-bottom: 0.75rem;">
          <div style="margin-right: 1rem; min-width: 80px; font-weight: 600; color: #4f46e5; flex-shrink: 0;">
            <span style="display: inline-block; width: 22px; height: 22px; border: 2px solid #4f46e5; border-radius: 4px; margin-right: 8px; vertical-align: middle;"></span>T
            <span style="display: inline-block; width: 22px; height: 22px; border: 2px solid #4f46e5; border-radius: 4px; margin: 0 8px 0 12px; vertical-align: middle;"></span>F
          </div>
          <div style="flex: 1; line-height: 1.6;">${statement.trim()}</div>
        </div>
      `;
    });
    activityHTML += '</div>';
  } else {
    activityHTML = `<p>${activityText.replace(/\n/g, "<br>")}</p>`;
  }

  output.innerHTML = `
    <div class="worksheet">
      <div class="header-bar">${header || 'Faithful Way Homeschool Solutions'}</div>
      <div class="worksheet-title">${title || 'Worksheet'}</div>

      ${imgHTML}

      <div>
        ${mainText ? `<p>${mainText}</p>` : ''}
      </div>

      <div class="section" style="clear: none;">
        <div class="section-title">Activities</div>
        ${activityHTML}
      </div>

      <div class="worksheet-footer">
        Created with Faithful Way Homeschool Solutions
      </div>
    </div>

    <button class="btn-secondary" onclick="printWorksheet()">Print Worksheet</button>
  `;
}

function printWorksheet() {
  const worksheetContent = document.querySelector('.worksheet').outerHTML;
  const printWindow = window.open('', '', 'height=800,width=800');

  printWindow.document.write('<html><head><title>Worksheet</title>');
  printWindow.document.write('<link rel="stylesheet" href="style.css">');
  printWindow.document.write('</head><body>');
  printWindow.document.write(worksheetContent);
  printWindow.document.write('</body></html>');

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}
