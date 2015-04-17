'use strict';

var _ = require('lodash');
var request = require('request');
var logger = console;

function Insights(config){

  this.config = _.assign({
    accountId: null,
    enabled: true,
    insertKey: '',
    queryKey: '',
    timerInterval: 10000,
    maxPending: 1000,
    defaultEventType: 'data',
    baseURL: null,
    url: null
  }, config);

  if(_.isEmpty(this.config.accountId)){
    throw new Error('Missing account ID');
  }

  this.data = [];
  this.timerId = null;
  this.timerCallback = _.bind(this.send, this);
  this.urlPathPrefix = '/v1/accounts/' + this.config.accountId + '/';
}

Insights.collectorBaseURL = "https://insights-collector.newrelic.com";
Insights.queryBaseURL = "https://insights-api.newrelic.com";

//start the timer that will send insights after some interval of time
//this is called implicitly when data is added via the add method
Insights.prototype.start = function(){
  if (!this.timerId){
    this.timerId = setInterval(this.timerCallback, this.config.timerInterval);
  }
};

//stop the timer that will send insights after some interval of time
//this is called implicitly when the amount of data exceeds maxPending and the queue is sent
Insights.prototype.stop = function(){
  if (this.timerId){
    clearInterval(this.timerId);
    this.timerId = null;
  }
};

//Send accumulated insights data to new relic (if enabled)
Insights.prototype.send = function(){
  var that = this;
  if (that.config.enabled && that.data.length > 0){
    var bodyData = that.data;
    that.data = [];
    try {
      request({
        method: 'POST',
        json: true,
        headers: {
          "X-Insert-Key": this.config.insertKey
        },
        url: (Insights.collectorBaseURL + that.urlPathPrefix + "events"),
        body: bodyData
      }, function(err, res, body){
        if (err){
          logger.error('Error sending to insights', err);
        }
        else if (res){
          logger.log('Insights response', res.statusCode, body);
        }
      });
    }
    catch(x){
      logger.error(x);
    }
  }
};

function reducer(prefix){
  return function(insight, value, key){
    if (_.isString(value) || _.isNumber(value)){
      insight[prefix + key] = value;
    }
    else if (_.isPlainObject(value) || _.isArray(value)){
      _.reduce(value, reducer(key + '.'), insight);
    }
    else if (_.isBoolean(value) || _.isDate(value)){
      insight[prefix + key] = value.toString();
    }
    else {
      //ignore functions, nulls, undefineds
      logger.warn('not reducing', prefix, key, value);
    }
    return insight;
  };
}

//Add insights data to the queue.
//It is sent when the queue reaches a max size or a period of time has elapsed
Insights.prototype.add = function(data, eventType){
  if (_.isEmpty(this.config.insertKey)){
    throw new Error('Missing insert key');
  }

  var that = this;
  try {

    var insight = _.reduce(data, reducer(""), {
      "eventType": eventType || that.config.defaultEventType
    });

    if (insight.timestamp === undefined) {
      insight.timestamp = Date.now();
    }

    logger.log('Insights data', insight);
    that.data.push(insight);

    if (that.data.length >= that.config.maxPending){
      that.stop();
      that.send();
    }
    else {
      that.start();
    }
  }
  catch(x){
    logger.error('Insights Add Exception:', x);
    that.data.length = 0;
  }
};

Insights.prototype.nrql = function(params) {
  if(params.constructor == String) {
    return params
  }

  if(!params.select) {
    throw "parameters must include :select"
  }
  if(!params.from) {
    throw "parameters must include :from"
  }

  var nrql = "SELECT " + params.select
  nrql += " FROM " + params.from
  if(params.where) {
    nrql += " WHERE " + this.where(params.where)
  }
  if(params.since) {
    nrql += " SINCE " + params.since
  }
  if(params.until) {
    nrql += " UNTIL " + params.until
  }
  if(params.facet) {
    nrql += " FACET " + params.facet
  }
  if(params.timeseries) {
    nrql += " TIMESERIES " + params.timeseries
  }
  if(params.limit) {
    nrql += " LIMIT " + params.limit
  }
  if(params.compare) {
    nrql += " COMPARE WITH " + params.compare
  }

  return nrql
}

Insights.prototype.where = function(clause) {
  var quote = function(value) { return "'"+value+"'" }

  if(clause == null) {
    return null
  }

  if(clause.constructor == String) {
    return "("+clause+")"
  }
  else if(clause.constructor == Array) {
    var clauses = []
    for(var i = 0; i < clause.length; i++) {
      clauses.push(this.where(clause[i]))
    }
    return clauses.join(" AND ")
  }

  var segments = []
  for(var key in clause) {
    if(clause.hasOwnProperty(key)) {
      var value = clause[key]
      var segment = ""

      if(value.constructor == Array) {
        var quotedValues = []
        for(var i = 0; i < value.length; i++) {
          var x = value[i]
          if(x.constructor !== Number) {
            x = quote(x)
          }
          quotedValues.push(x)
        }
        segment += key+" IN ("
        segment += quotedValues.join(",")
        segment += ")"
      }
      else {
        if (value.constructor !== Number) {
          value = quote(value);
        }
        segment += key+" = "+value;
      }
      segments.push(segment)
    }
  }

  if(segments.length > 0) {
    return "("+segments.join(" AND ")+")"
  }
  else {
    return null
  }
}

Insights.prototype.query = function(query, done) {
  if (_.isEmpty(this.config.queryKey)){
    throw new Error('Missing query key');
  }

  query = this.nrql(query);
  try {
    decodeURIComponent(query);
  }
  catch(ex) {
    query = encodeURI(query);
  }

  var url = Insights.queryBaseURL + this.urlPathPrefix + "query?nrql=" + query;

  request({
    method: 'GET',
    json: true,
    headers: {
      "X-Query-Key": this.config.queryKey
    },
    url: url,
  }, function(err, res, body){
    done(err, body);
  });

};

module.exports = Insights;
