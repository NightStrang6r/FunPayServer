import { JSDOM } from 'jsdom';

function parseDOM(text) {
    const { document } = (new JSDOM(text)).window;
    return document;
}

export { parseDOM };