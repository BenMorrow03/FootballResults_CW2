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

    const client = new CosmosClient(connStr);
    const container = client.database("footballresultsdbcon").container("mediameta");

    await container.item(id, teamId).delete();

    context.res = { status: 204 };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
