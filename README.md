# node-insights

Submit and query New Relic Insights data.

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
  queryKey: '<YOUR_QUERY_KEY>',
  accountId: '<YOUR_ACCOUNT_ID>'
});

insights.add({
  someInt: 42,
  someArray: [ 'apples', 'peaches', 'bananas' ],
  someObject: {
    'foo': 'bar'
  }
});

insights.query('SELECT count(*) FROM data', function(err, responseBody) {
  // ...
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
insights.add({ ... }, 'my-custom-event-type');
```

### timestamps
By default Insights will use the time data is sent to the server as the timestamp. Because this library buffers data for up to 10s, we will automatically add a timestamp when you call `insights.add()`.

If you provide your own timestamp (keeping in mind the date has to be within a day of the Insight server's time), the library will not overwrite the user provided one.

### querying data
To retrieve data from Insights you will need to use your [query key](https://docs.newrelic.com/docs/insights/new-relic-insights/adding-querying-data/querying-your-data-remotely#register) to execute NRQL queries.

```
insights.query(nrqlQuery, function(err, responseBody) {
  // ...
});
```

## tests

Run the tests
```shell
grunt test
```

## resources
New Relic docs about [inserting custom events](https://docs.newrelic.com/docs/insights/new-relic-insights/adding-querying-data/inserting-custom-events-insights-api) and [default attributes](https://docs.newrelic.com/docs/insights/new-relic-insights/decorating-events/insights-attributes)

