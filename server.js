const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/databricks-failure", async (req, res) => {
  try {
    console.log("========== DATABRICKS WEBHOOK ==========");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("========================================");

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.get("/", (_, res) => {
  res.send("Databricks Alert Service Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
