// ?utm_source={UTM_SOURCE}
// &utm_medium={medium}
// mediums = {"twitter", "facebook", "linkedin", "googleplus"}

module.exports = function (context, req) {

    var bluebird = require('bluebird'),
        redis = require('redis');

    bluebird.promisifyAll(redis.RedisClient.prototype);
    bluebird.promisifyAll(redis.Multi.prototype);

    var redisHost = process.env.REDIS_HOST || '127.0.0.1';
    var redisPort = process.env.REDIS_PORT || 6379;
    var shortUrl = process.env.SHORTENER_URL || 'http://lil.one/';
    var utmSource = process.env.UTM_SOURCE || '';

    var client = redis.createClient(redisPort, redisHost);

    if (req.query.url) {

        client.incrAsync('next.url.id').then(function (err, id) {

            if (err !== null)
            {
                context.res = {
                    status: 400,
                    body: err
                }
            } else {
                if (id < 1000) {
                    id = 1001;
                    client.setAsync('next.url.id', id);
                }

                var url = req.query.url;
                var hex = id.toString(16);

                var response = shortUrl + hex;

                context.res = {
                    status: 200,
                    body: response
                }
                client.setAsync(id, url);
            }

            context.done();
        })
    }
    else {
        context.res = {
            status: 400,
            body: 'Please pass a url on the query string or in the request body'
        };
        context.done();
    }

};