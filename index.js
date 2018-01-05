const { props } = require('bluebird');

function CacheQueue() {
  this.cache = {};
  this.queuedKeys = {};
}

CacheQueue.prototype.addPromise = function(keyedPromises) {
  const dedupedPromises = {};
  for (let key in keyedPromises) {
    if (keyedPromises.hasOwnProperty(key) && !this.queuedKeys[key] && !this.cache[key]) {
      dedupedPromises[key] = keyedPromises[key];
      this.queuedKeys[key] = true;
    }
  }
  return props(dedupedPromises).then(data => {
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        delete this.queuedKeys[key];
        this.cache[key] = data[key];
      }
    }
    return this.cache;
  });
};

CacheQueue.prototype.getCache = function() {
  return this.cache;
};

CacheQueue.prototype.getCacheLength = function() {
  return +Object.keys(this.cache).length;
};

CacheQueue.prototype.getQueueLength = function() {
  return +Object.keys(this.queuedKeys).length;
};

CacheQueue.prototype.isCached = function(key) {
  return !!this.cache[key];
};

CacheQueue.prototype.removeCache = function(key) {
  delete this.cache[key];
  return this.cache;
};

CacheQueue.prototype.clearAll = function() {
  this.cache = {};
  this.queuedKeys = {};
};

module.exports = CacheQueue;
