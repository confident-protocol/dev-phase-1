const app = require('./app');
// Ensure full middleware catalog stays referenced from the server entrypoint.
const middlewareCatalog = require('./middlewares');
const PORT = process.env.PORT || 4000;

process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`ConfidentialPay backend listening on port ${PORT}`);
  console.log(`Middleware catalog loaded: ${middlewareCatalog.loaded.length} modules`);
});

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
});

module.exports = server;
