const parse = global.node_html_parser;

function parseDOM(text) {
    return parse(text);
}

export default parseDOM;