module.exports = function (context, req) {

    var appInsights = require('applicationinsights');
    var bluebird = require('bluebird');
    var redis = require('redis');
    bluebird.promisifyAll(redis.RedisClient.prototype);
    bluebird.promisifyAll(redis.Multi.prototype);

    var redisHost = process.env.REDIS_HOST || '127.0.0.1';
    var redisPort = process.env.REDIS_PORT || 6379;

    var client = redis.createClient(redisPort, redisHost);
    appInsights.setup().start();
    let telemetry = appInsights.defaultClient;

    if (req.query.id) {
        var id = parseInt(req.query.id, 16);

        client.getAsync(id).then(function (reply) {
           telemetry.trackEvent({ name: reply, properties: { url: reply, short_url: req.query.id, id: id } });

            context.res = {
                status: 302,
                headers: { 'location': reply },
                body: null
            }
            context.done();
        })
    }
    else {
        context.res = {
            status: 400,
            body: 'Please pass a id on the query string'
        };
        context.done();
    }
};