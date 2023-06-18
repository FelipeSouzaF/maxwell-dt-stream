import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB({
    endpoint: "http://localhost:8000",
});

const params = {
  TableName : 'logs',
  KeySchema: [       
    { AttributeName: 'id', KeyType: 'HASH'},  //Partition key
    { AttributeName: 'database', KeyType: 'RANGE'},
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'database', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 10
  }
};

dynamodb.createTable(params, function(err, data) {
  if (err) {
    console.error('Unable to create table. Error:', JSON.stringify(err, null, 2));
  } else {
    console.log('Created table. Table description:', JSON.stringify(data, null, 2));
  }
});
