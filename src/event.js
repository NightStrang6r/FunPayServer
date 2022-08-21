async function exit(timeout = 120000) {    
    await sleep(timeout);
    process.exit(1);
}

function sleep(delay) {
    if(delay == 0) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, delay));
}

export { exit, sleep };