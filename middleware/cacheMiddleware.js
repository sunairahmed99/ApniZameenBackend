import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 minutes default TTL

const cacheMiddleware = (duration) => (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
        return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
        return res.send(cachedResponse);
    } else {
        res.sendResponse = res.send;
        res.send = (body) => {
            cache.set(key, body, duration);
            res.sendResponse(body);
        };
        next();
    }
};

export const clearCache = (url) => {
    if (url) {
        cache.del(`__express__${url}`);
    } else {
        cache.flushAll();
    }
};

export default cacheMiddleware;
