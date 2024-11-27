const fs = require('fs/promises');
const fsSync = require('fs');
const { encodeStateAsUpdate, applyUpdate } = require('yjs');

const saveYjsState = async (doc) => {
    const update = encodeStateAsUpdate(doc);
    await fs.writeFile('doc-state.bin', update);
    console.log('Yjs state saved.');
};

const loadYjsState = (doc) => {
    if (fsSync.existsSync('doc-state.bin')) {
        const savedState = fsSync.readFileSync('doc-state.bin');
        applyUpdate(doc, savedState);
        console.log('Yjs state loaded.');
    }
};

module.exports = { saveYjsState, loadYjsState };
