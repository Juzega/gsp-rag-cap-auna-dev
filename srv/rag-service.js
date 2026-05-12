const cds = require("@sap/cds");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { saveLog } = require("./helpers/logHelper");
const aicoreHelper = require("./helpers/aicoreHelper");

function getFileHash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

module.exports = async function (srv) {

  srv.on("ragSearch", async (req) => {
    const { consulta } = req.data;
    const db = await cds.connect.to("db");
    const start = Date.now();
    try {
      const embRes = await aicoreHelper.generateEmbedding(consulta);
      const queryEmbedding = embRes.data[0].embedding;
      const plugin = await cds.connect.to("cap-llm-plugin");
      const results = await plugin.similaritySearch(
        '"MY_RAG_DOCS"', "EMBEDDING", "TEXT",
        queryEmbedding, "COSINE_SIMILARITY", 3
      );
      const cleaned = results.map(r => ({
        ID: r.ID, TITLE: r.TITLE, CUSTOMER: r.CUSTOMER,
        PROJECT: r.PROJECT, TEXT: r.TEXT, SCORE: r.SCORE,
        SOURCE: r.SOURCE
      }));
      const contextDocs = cleaned.map(c => c.TEXT).join("\n---\n");
      const prompt = `Eres un asistente experto de AUNA. Responde usando los documentos.\nPregunta: "${consulta}"\n\nDocumentos:\n${contextDocs}\n\nResponde en espanol.`;
      const chatRes = await aicoreHelper.chatCompletion([{ role: "user", content: prompt }]);
      const finalAnswer = chatRes.choices[0].message.content;
      const duration = Date.now() - start;
      await saveLog({ type: "query", queryText: consulta, promptFinal: prompt, responseFinal: finalAnswer, details: cleaned, userName: req.user?.id || "anonymous", durationMs: duration });
      return { oAuditResponse: { idtransaccion: req.id, code: 1, message: "OK" }, oDataResponse: { respuestaFinal: finalAnswer, documentos: cleaned, durationMs: duration } };
    } catch (err) {
      console.error("[ragSearch] ERROR:", err.message);
      return { oAuditResponse: { idtransaccion: req.id, code: -1, message: err.message }, oDataResponse: null };
    }
  });

  srv.on("insertDoc", async (req) => {
    const { title, text, project, customer, docType, fileHash: fhash, chunkId, source } = req.data;
    const db = await cds.connect.to("db");
    try {
      const ID = uuidv4();
      const createdBy = req.user?.id || "caprag_user";
      const filehash = fhash || getFileHash(title + text + project + customer);
      const chunkid = chunkId || `chunk_1`;
      const src = source || title;
      const response = await aicoreHelper.generateEmbedding(text);
      const embedding = response.data[0].embedding;
      await db.run(
        `INSERT INTO "MY_RAG_DOCS" (ID, TITLE, TEXT, PROJECT, CUSTOMER, DOCTYPE, FILEHASH, CHUNKID, SOURCE, EMBEDDING, createdBy, createdAt, modifiedBy, modifiedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TO_REAL_VECTOR(?), ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP)`,
        [ID, title, text, project, customer, docType || "GENERAL", filehash, chunkid, src, JSON.stringify(embedding), createdBy, createdBy]
      );
      await saveLog({ type: "insert", queryText: `Insert Doc: ${title}`, responseFinal: "OK", details: { ID, title, chunkId: chunkid, source: src }, userName: createdBy, durationMs: 0 });
      return { oAuditResponse: { idtransaccion: req.id, code: 1, message: "Documento insertado" }, oDataResponse: { ID, title, project, customer, fileHash: filehash, chunkId: chunkid, source: src } };
    } catch (err) {
      console.error("[insertDoc] ERROR:", err.message);
      return { oAuditResponse: { idtransaccion: req.id, code: -1, message: err.message }, oDataResponse: null };
    }
  });
};
