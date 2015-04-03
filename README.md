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

## adding data

By default, adding data will start the send timer.
Data is held in the queue until either the number of items exceeds maxPending or the send timer goes off.

### data format
New Relic Insights expects key/value pairs.
As a convenience, the Insights object will flatten Object and Array data.

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

Array data flattens out too:

```
  insights.add({
    'randomWords': [ "card", "bean", "chair", "box" ]
  });
```

but it is less pretty:
```
{
  'appId': 42,
  'eventType': 'data',
  'randomWords.0': 'card',
  'randomWords.1': 'bean',
  'randomWords.2': 'chair',
  'randomWords.3': 'box'
}
```

### event types
When you add data, you can specify the eventType that is sent to New Relic.
If you don't specify the eventType, the defaultEventType (from the initial config is used).
The defaultEventType **defaults** to the string 'data'. Awesome!

```
insight.add({ ... }, 'my-custom-event-type');
```

## tests

Run the tests
```shell
grunt test
```

## resources
[New Relic Docs](https://docs.newrelic.com/docs/insights/new-relic-insights/adding-querying-data/inserting-custom-events-insights-api)
