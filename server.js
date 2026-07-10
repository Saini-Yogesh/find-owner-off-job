const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/databricks-failure", async (req, res) => {
  try {
    const requestData = req.body;

    console.log("========== DATABRICKS REQUEST Body ==========");
    console.log(requestData);
    console.log("========== Formatted DATABRICKS REQUEST Body==========");
    console.log(JSON.stringify(requestData, null, 2));
    console.log("========================================");

    console.log(
      `Job ID: ${requestData.job?.job_id} | ` +
        `Job Name: ${requestData.job?.name} | ` +
        `Run ID: ${requestData.run?.run_id} | ` +
        `Run URL: ${requestData.run?.run_page_url} | ` +
        `Event Type: ${requestData.event_type}`,
    );

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
