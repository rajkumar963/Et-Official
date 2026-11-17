import { app } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import mongoose from 'mongoose';
async function main() {
  await connectDatabase();
  const server = app.listen(env.PORT, () =>
    console.log(`API ready at http://localhost:${env.PORT}/api/v1`),
  );
  let shuttingDown = false;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    server.close(() => {
      void mongoose.disconnect().then(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
main().catch((error) => {
  console.error('Backend startup failed:', error.message);
  process.exit(1);
});
