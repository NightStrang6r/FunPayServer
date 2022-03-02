function log(msg, err = false) {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    if(day.toString().length == 1)
        day = `0${day}`;
    if(month.toString().length == 1)
        month = `0${month}`;
    if(hour.toString().length == 1)
        hour = `0${hour}`;
    if(minute.toString().length == 1)
        minute = `0${minute}`;
    if(second.toString().length == 1)
        second = `0${second}`;

    const logText = `>[${day}.${month}.${year}] [${hour}:${minute}:${second}]: ${msg}`;
    if(!err) {
        console.log(logText);
    } else {
        console.error(logText);
    }
    if(typeof msg == 'object')
        console.log(msg);
}

export { log };