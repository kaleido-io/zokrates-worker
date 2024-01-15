import app from './app.mjs';
import rabbitmq from './utils/rabbitmq.mjs';
import queues from './queues/index.mjs';
import logger from './utils/logger.mjs';

const main = async () => {
  try {
    // 1 means enable it
    // 0 mean keep it disabled
    if (Number(process.env.ENABLE_QUEUE)) {
      await rabbitmq.connect();
      queues();
    }

    console.log('listening on port 3002');
    app.listen(3002);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

main();
