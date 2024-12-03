class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    get(docId) {
        if (this.cache.has(docId)) {
            const value = this.cache.get(docId);
            // Setting it as recently used
            this.cache.delete(docId);
            this.cache.set(docId, new Date());
            return value;
        }
        return null; // doc not in cache
    }

    put(docId) {
        if (this.cache.has(docId)) {
            this.cache.delete(docId);
        }
        this.cache.set(docId, new Date());  // storing last saved

        // Removing least recently used item
        if (this.cache.size > this.capacity) {
            const lruDocId = this.cache.keys().next().value;
            this.cache.delete(lruDocId);
            console.log(`Removed from cache : ${lruDocId}`);
        }
    }
}


module.exports = { LRUCache };