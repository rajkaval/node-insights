# node-insights

Submit data to New Relic Insights

## installation

```shell
npm install node-insights --save
```

## usage

Create an Insights instance and pass in an object with your New Relic app id, insert key, and url.

```
var Insights = require('node-insights');

var insights = new Insights({
  appId: <YOUR_APP_ID>,
  insertKey: '<YOUR_INSERT_KEY>',
  url: 'https://insights-collector.newrelic.com/v1/accounts/<YOUR_ACCOUNT_ID>/events'
});

insights.add({
  someInt: 42,
  someArray: [ 'apples', 'peaches', 'bananas' ],
  someObject: {
    'foo': 'bar'
  }
});

```

## Adding Data

By default, adding data will start the send timer.

New Relic Insights expects key/value pairs.
As a convenience, the Insights Object will flatten Object and Array data.

Adding this data object:

```
insights.add({
  'purchase': {
    "account":3,
    "amount":259.54
  }
}, 'purchase');
```

Actually flattens out and is sent like this:
```
{
  'appId': 42,
  'eventType': 'purchase',
  'purchase.account':3,
  'purchase.amount':259.54
}
```


## tests

Run the tests
```shell
grunt test
```

## resources
[New Relic Docs](https://docs.newrelic.com/docs/insights/new-relic-insights/adding-querying-data/inserting-custom-events-insights-api)
