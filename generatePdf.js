const fs = require("fs");
var path = require("path");
const { chromium } = require("playwright");

async function generatePdfFromHtml(htmlContent) {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle" });

  const contentDimensions = await page.evaluate(() => {
    const body = document.body;
    return {
      height: Math.ceil(
        Math.max(body.scrollHeight, body.offsetHeight, body.clientHeight)
      ),
    };
  });

  const pdfBuffer = await page.pdf({
    width: `774px`,
    height: `${contentDimensions.height}px`,
    printBackground: true,
    margin: {
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    },
  });

  await browser.close();

  return pdfBuffer;
}

async function generateAndSavePdf(htmlContent) {
  try {
    const baseFilename = "generated_document.pdf";
    const folder = path.join(__dirname, "./files");

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    async function getUniqueFileName(baseFilename) {
      let uniqueFilename = baseFilename;
      var filePath = path.join(folder, uniqueFilename);

      while (fs.existsSync(filePath)) {
        const regex = /(?: \((\d+)\))?\.pdf$/;
        const match = regex.exec(baseFilename);
        const number = match ? parseInt(match[1] || "0", 10) + 1 : 1;
        uniqueFilename = `generated_document (${number}).pdf`;
        filePath = path.join(folder, uniqueFilename);
      }

      return uniqueFilename;
    }

    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    const newFileName = await getUniqueFileName(baseFilename);
    const filePath = path.join(folder, newFileName);

    fs.writeFileSync(filePath, pdfBuffer);
    console.log(newFileName);

    return newFileName;
  } catch (error) {
    console.error("Error generating PDF:", error.message);
    return error;
  }
}

module.exports = {
  generatePdfFromHtml,
  generateAndSavePdf,
};
