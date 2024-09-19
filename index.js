const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const { generateAndSavePdf } = require("./generatePdf");

const app = express();

app.use(express.json());
app.use(logger("dev"));
app.use(cors());

app.post("/convert", async (req, res) => {
  try {
    const filename = await generateAndSavePdf(req.body.htmlContent);
    return res.status(200).json({
      filename,
    });
  } catch (error) {
    return res.status(500).json({ error, message: error.message });
  }
});

const port = 5757;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
