const { v4: uuidv4 } = require("uuid");
const cds = require("@sap/cds");

async function saveLog({ type, queryText, promptFinal, responseFinal, details, userName, durationMs, username, email }) {
  try {
    const db = await cds.connect.to("db");
    await db.run(
      `INSERT INTO "MY_RAG_LOGS" (ID, TIMESTAMP, TYPE, QUERYTEXT, PROMPTFINAL, RESPONSEFINAL, DETAILS, USERNAME, DURATIONMS, username, email, CREATEDAT, CREATEDBY, MODIFIEDAT, MODIFIEDBY) VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, ?)`,
      [uuidv4(), type, queryText || "", promptFinal || "", responseFinal || "", JSON.stringify(details || {}), userName || "system", durationMs || 0, username || "", email || "", userName || "system", userName || "system"]
    );
  } catch (err) {
    console.error("Error log:", err.message);
  }
}

module.exports = { saveLog };
