function removeCharsetUTF8(req, res, next) {
    const contentType = req.headers['content-type'];
    if (contentType && contentType.includes('charset=utf-8')) {
        req.headers['content-type'] = 'application/json';
    }
    next();
}

//  application/x-www-form-urlencoded to application/JSON
function parseRequestBody(req, res, next) {
    // Check if the content type is "application/x-www-form-urlencoded"
    if (req.is('application/x-www-form-urlencoded')) {
        // Get the request body and decode it from Base64
        const encodedBody = req.body;
        const decodedBody = Buffer.from(encodedBody, 'base64').toString('ascii');

        // Split the decoded body into an array of key-value pairs
        const keyValuePairs = decodedBody.split('&');

        // Construct a JSON object from the key-value pairs
        const jsonObject = {};
        keyValuePairs.forEach(keyValuePair => {
            const [key, value] = keyValuePair.split('=');
            jsonObject[key] = decodeURIComponent(value);
        });

        // Set the parsed request body as the new request body
        req.body = jsonObject;
    }

    // Call the next middleware function
    next();
}

module.exports = {
    removeCharsetUTF8, parseRequestBody
};