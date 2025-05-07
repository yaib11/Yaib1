const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const app = express();

const port = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('לא נשלחה תמונה');
  }

  const pdf = new PDFDocument();
  const outputPath = `outputs/${req.file.filename}.pdf`;
  const output = fs.createWriteStream(outputPath);

  pdf.pipe(output);
  pdf.image(req.file.path, {
    fit: [500, 700],
    align: 'center',
    valign: 'center'
  });
  pdf.end();

  output.on('finish', () => {
    res.download(outputPath, 'converted.pdf', () => {
      // ניקוי קבצים זמניים
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(outputPath);
    });
  });
});

app.get('/', (req, res) => {
  res.send(`
    <h1>👋 ממיר PNG ל־PDF</h1>
    <form method="POST" enctype="multipart/form-data" action="/convert">
      <input type="file" name="image" accept="image/png" required />
      <button type="submit">המר</button>
    </form>
  `);
});

app.listen(port, () => {
  console.log(`שרת רץ על פורט ${port}`);
});
