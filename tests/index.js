/* global describe, it */
'use strict';

var expect = require('chai').expect;
var Insights = require('../index.js');
var nock = require('nock');

describe('node-insights', function(){

  var config = {
    insertKey: "xyz",
    url: "https://insights-collector.newrelic.com/v1/accounts/123456/events",
    appId: 42,
    timerInterval: 500
  };


  it('should throw an Error if no insertKey is supplied', function(){
    expect(function(){
      new Insights({
        appId: 42,
        url: "https://insights-collector.newrelic.com/v1/accounts/< YOUR ACCOUNT ID>/events"
      });
    }).to.throw(Error);
  });

  it('should throw an Error if no url is supplied', function(){
    expect(function(){
      new Insights({
        insertKey: "xyz",
        appId: 42
      });
    }).to.throw(Error);
  });

  it('should throw an Error if no appId is supplied', function(){
    expect(function(){
      new Insights({
        insertKey: "xyz",
        url: "https://insights-collector.newrelic.com/v1/accounts/< YOUR ACCOUNT ID>/events"
      });
    }).to.throw(Error);
  });

  it('should not throw an Error', function(){
    expect(function(){
      new Insights(config);
    }).to.not.throw(Error);

  });

  it('should have the method start', function(){
    var insights = new Insights(config);
    expect(insights).to.respondTo('start');
  });

  it('should have the method stop', function(){
    var insights = new Insights(config);
    expect(insights).to.respondTo('stop');
  });

  it('should have the method send', function(){
    var insights = new Insights(config);
    expect(insights).to.respondTo('send');
  });

  it('should have the method add', function(){
    var insights = new Insights(config);
    expect(insights).to.respondTo('add');
  });

  it('should send data that is added', function(){
    var scope = nock('https://insights-collector.newrelic.com').post('/v1/accounts/123456/events').reply(200, { });
    var insights = new Insights(config);
    insights.add({
      'apples': 42
    });
    insights.send();
    setTimeout(function(){
      expect(scope.isDone()).to.be.true;
    }, 1000);
  });

  it('should send flattened data', function(done){
    var body;
    var scope = nock('https://insights-collector.newrelic.com')
                  .post('/v1/accounts/123456/events')
                  .reply(200, function(uri, reqBody){
                    body = reqBody;
                    return body;
                  });
    var insights = new Insights(config);
    insights.add({
      'purchase': {
        "account":3,
        "amount":259.54
      }
    }, 'purchase');
    insights.send();
    setTimeout(function(){
      expect(scope.isDone()).to.be.true;
      expect(body).to.eql('[{"appId":42,"eventType":"purchase","purchase.account":3,"purchase.amount":259.54}]');
      done();
    }, 1000);
  });

  it('should have more tests');
});
