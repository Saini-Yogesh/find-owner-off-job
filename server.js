require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/databricks-failure", async (req, res) => {
  try {
    console.log("Incoming payload:", JSON.stringify(req.body, null, 2));

    const jobId = req.body.job?.job_id;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "job_id not found",
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

    console.log("Job Response:", JSON.stringify(jobResponse.data, null, 2));

    const job = jobResponse.data;

    const owner = job.creator_user_name || job.run_as_user_name || "Unknown";

    const jobName = req.body.job?.name || job.settings?.name || "Unknown";

    const runId = req.body.run?.run_id;

    const enrichedPayload = {
      ...req.body,

      owner: job.settings?.tags?.Owner || job.creator_user_name,

      creator_user_name: job.creator_user_name,

      run_as_user_name: job.run_as_user_name,

      run_as_owner: job.run_as_owner,

      tags: job.settings?.tags || {},
    };

    console.log("Sending to Teams:", JSON.stringify(enrichedPayload, null, 2));

    const teamsResponse = await axios.post(
      process.env.TEAMS_WEBHOOK,
      enrichedPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Teams Response:", teamsResponse.status);

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error("Status:", err.response?.status);

    console.error("Response:", err.response?.data);

    console.error(err.message);

    res.status(500).json({
      success: false,
    });
  }
});

app.get("/", (_, res) => {
  res.send("Databricks Alert Service Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
