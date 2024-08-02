import {ParsedObject} from "./interfaces";

const docx = require('docx');
const fs = require('fs');

const { Packer, Paragraph, TextRun } = docx

/**
 * Creates a DOCX document with the provided texts
 */
async function createDoc(texts: ParsedObject[]): Promise<void> {
  const doc = new docx.Document({
    creator: "Your Name",
    title: "Sample Document",
    description: "A sample document created with docx",
    sections: [
      {
        children: texts.flatMap(text => [
          new Paragraph({
            children: [
              new TextRun({
                text: `Название: ${text.title}`,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Цена: ${text.price}`,
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${text.text}`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '',
              }),
            ],
          }),
        ]),
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('output.docx', buffer);
}

module.exports = createDoc
