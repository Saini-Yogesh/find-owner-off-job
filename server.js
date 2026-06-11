require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/databricks-failure", async (req, res) => {
  try {
    console.log("Incoming payload:", JSON.stringify(req.body, null, 2));

    // We will confirm exact field after first test
    const jobId =
      req.body.job_id || req.body.job?.job_id || req.body.event?.job_id;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "job_id not found in payload",
      });
    }

    const jobResponse = await axios.get(
      `${process.env.DATABRICKS_URL}/api/2.1/jobs/get`,
      {
        headers: {
          Authorization: `Bearer ${process.env.DATABRICKS_TOKEN}`,
        },
        params: {
          job_id: jobId,
        },
      },
    );

    const jobData = jobResponse.data;

    const owner = jobData.creator_user_name || "Unknown";

    const jobName = jobData.settings?.name || "Unknown";

    const teamsMessage = {
      text: `🚨 Databricks Job Failed

        Job Name: ${jobName}
        Owner: ${owner}
        Job ID: ${jobId}`,
    };

    await axios.post(process.env.TEAMS_WEBHOOK, teamsMessage);

    console.log("Teams notification sent");

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/", (_, res) => {
  res.send("Databricks Alert Service Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
