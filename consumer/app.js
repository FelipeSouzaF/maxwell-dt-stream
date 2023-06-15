import { Consumer } from 'sqs-consumer';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const app = Consumer.create({
  queueUrl: 'http://localhost:9324/queue/default',
  handleMessage: async (message) => {
    // do some work with `message`
    console.log('event')
    console.log(message)

    const dynamodb = new AWS.DynamoDB({
      endpoint: "http://localhost:8000",
    });
    const docClient = new AWS.DynamoDB.DocumentClient({service: dynamodb});

    const params = {
      TableName: 'pedidos',
      Item: {
        'id': uuidv4(),
        'json_value': JSON.stringify(message),
      },
    };
    
    docClient.put(params, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
      }
    });
  }
});

app.on('error', (err) => {
  console.error(err.message);
});

app.on('processing_error', (err) => {
  console.error(err.message);
});

app.start();
