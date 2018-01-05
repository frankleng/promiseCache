const { expect } = require('chai');
const CacheQueue = require('./index');
const uuid = require('uuid/v4');

let validKeyToDelete = '';

function fakeCall(val) {
  return new Promise(resolve =>
    setTimeout(() => resolve({user: val}), 100)
  );
}

function getKeyedFakeCalls(num) {
  const results = {};
  for (let i = 0; i < num; i++) {
    const id = uuid();
    if (i === 0) validKeyToDelete = id;
    results[id] = fakeCall(id);
  }
  return results;
}

describe('Cached promises', function() {
  it('should add all results to cache', () => {
    let cacheQueueInstance = new CacheQueue();
    return Promise.all([
      cacheQueueInstance.addPromise(getKeyedFakeCalls(5)),
      cacheQueueInstance.addPromise(getKeyedFakeCalls(15))
    ])
      .then(() => {
        const cached = cacheQueueInstance.getCache();
        return expect(Object.keys(cached).length).to.equal(20);
      });
  });
  it('should handle duplicate requests gracefully', () => {
    let cacheQueueInstance = new CacheQueue();
    const requests = getKeyedFakeCalls(20);
    cacheQueueInstance.addPromise(requests)
      .then(() => cacheQueueInstance.addPromise(requests))
      .then(() => {
        expect(cacheQueueInstance.getCacheLength()).to.equal(20);
        expect(cacheQueueInstance.getQueueLength()).to.equal(0);
      });
  })
});