const JSDOM = global.jsdom;

function parseDOM(text) {
    const { document } = (new JSDOM(text)).window;
    return document;
}

export default parseDOM;