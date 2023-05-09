

async function helloAsync({name}) {
    return {data: "Hello " + name};
}


exports.apiFunctions = {
    hello: helloAsync
}


