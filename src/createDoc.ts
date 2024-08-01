
const docx = require('docx');
const fs = require('fs');

const { Packer, Paragraph, TextRun } = docx

/**
 * Creates a DOCX document with the provided texts
 * @param {string[]} texts - Array of texts to include in the document
 */
async function createDoc(texts: string[]): Promise<void> {
  const doc = new docx.Document({
    creator: "Your Name",
    title: "Sample Document",
    description: "A sample document created with docx",
    sections: [
      {
        children: texts.map(text => new Paragraph({
          children: [
            new TextRun(text),
          ],
        })),
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('output.docx', buffer);
}

module.exports = createDoc
