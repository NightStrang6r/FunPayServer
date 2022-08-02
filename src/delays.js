export default class Delays {
    constructor() {

    }
    
    sleep(timeout = 1) {
        return new Promise(function(resolve, reject) {
            setTimeout(resolve, timeout);
        });
    }
}