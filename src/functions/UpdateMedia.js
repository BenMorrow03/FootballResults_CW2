const { CosmosClient } = require("@azure/cosmos");

module.exports = async function (context, req) {
  try {
    const connStr = process.env.Cosmos_connection_string;
    if (!connStr) {
      context.res = { status: 500, body: { error: "Missing Cosmos_connection_string" } };
      return;
    }

    const id = req.query.id;
    const teamId = req.query.teamId;

    if (!id || !teamId) {
      context.res = { status: 400, body: { error: "id and teamId are required" } };
      return;
    }

    const updates = req.body || {};

    const client = new CosmosClient(connStr);
    const container = client.database("footballresultsdbcon").container("mediameta");

    const { resource } = await container.item(id, teamId).read();
    if (!resource) {
      context.res = { status: 404, body: { error: "Not found" } };
      return;
    }

    if (typeof updates.title === "string") resource.title = updates.title;
    if (typeof updates.description === "string") resource.description = updates.description;
    if (typeof updates.blobUrl === "string") resource.blobUrl = updates.blobUrl;

    resource.updatedAt = new Date().toISOString();

    const { resource: saved } = await container.item(id, teamId).replace(resource);

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: saved
    };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
