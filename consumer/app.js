import { Consumer } from 'sqs-consumer';

const app = Consumer.create({
  queueUrl: 'http://localhost:9324/queue/default',
  handleMessage: async (message) => {
    // do some work with `message`
    console.log('process2')
    console.log(message)
  }
});

app.on('error', (err) => {
  console.error(err.message);
});

app.on('processing_error', (err) => {
  console.error(err.message);
});

app.start();
