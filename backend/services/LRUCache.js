const Y = require('yjs');
const { updateFile } = require('./fileService');


class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        this.saveToDB = updateFile;
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

    async put(docId) {
        if (this.cache.has(docId)) {
            this.cache.delete(docId);
        }
        this.cache.set(docId, new Date());  // storing last saved

        // Removing least recently used item
        if (this.cache.size > this.capacity) {
            const lruDocId = this.cache.keys().next().value;

            // Saving to DB before removing
            try {
                const ydoc = new Y.Doc();
                const docMap = ydoc.getMap('documents');
                const ytext = docMap.get(lruDocId);

                if (ytext) {
                    const content = ytext.toString();
                    await this.saveToDB(lruDocId, null, content, null);
                    console.log(`Saved document ${lruDocId} to DB.`);
                }

                // Remove the document from Y.js
                docMap.delete(lruDocId);
                console.log(`Removed document ${lruDocId} from Y.js.`);
            } catch (error) {
                console.error(`Failed to save or remove document ${lruDocId}:`, error);
            }

            this.cache.delete(lruDocId);
            console.log(`Removed from cache : ${lruDocId}`);
        }
    }
}


module.exports = { LRUCache };