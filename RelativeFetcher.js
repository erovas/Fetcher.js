/*!
 * RelativeFetcher.js v1.0.0
 * Copyright (c) 2026, Emanuel Rojas Vásquez
 * MIT License
 * https://github.com/erovas/Fetcher.js
 */

/**
 * Finds the last non-empty string in an array.
 * @param {string[]} arr - The array of strings to search.
 * @returns {string} The last non-empty string, or an empty string if all items are empty.
 */
function getLastNonEmpty(arr) {
    for (let i = arr.length - 1; i >= 0; i--)
        if (arr[i]?.trim() !== '')
            return arr[i];

    return '';
}

/**
 * Gets the URL of the file that called this function.
 * @returns The URL of the caller file, or `null` if not found.
 */
function getCallerURL() {
    const stack = new Error().stack;
  
    if (!stack) 
        return null;
  
    const lines = stack.split('\n');
    const callerLine = getLastNonEmpty(lines);
    const match = callerLine.match(/([a-zA-Z][a-zA-Z0-9+.\-]*:\/\/[^\s)]+?):\d+:\d+/);
    return match ? match[1] : null;
}

/**
 * Gets the full path, given a relative or full path.
 * @param {string} src - The URL of the resource to fetch.
 * @returns 
 */
function getFullPath(src){
    return (new URL(src, getCallerURL())).href;
}

/**
 * Fetches text content from a URL synchronously using XMLHttpRequest.
 * @param {string} src - The URL of the resource to fetch.
 * @returns {string} The text response text if the request is successful (status 200-299 or 304).
 * @throws {Error} If the HTTP status is not in the successful range.
 */
function FetchTextSync(src){
    src = getFullPath(src);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', src, false);
    xhr.send();
    let status = xhr.status;
    //respuesta satisfactoria (200 a 299) ó cache (304)
    if((status >= 200 && status < 300) || status == 304)
        return xhr.responseText;
    
    throw new Error(`HTTP ${status}: ${xhr.statusText}`);
}

/**
 * Fetches text content from a URL asynchronously using XMLHttpRequest.
 * @param {string} src - The URL of the resource to fetch.
 * @returns {Promise<string>} A promise resolving to the text response text.
 * @throws {Error} A promise rejecting if the HTTP status is not in the successful range.
 */
function FetchText(src){
    src = getFullPath(src);
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onloadend = function(){
            const status = xhr.status;
            //respuesta satisfactoria (200 a 299) ó cache (304)
            if((status >= 200 && status < 300) || status == 304)
                resolve(xhr.responseText);
            else
                reject(new Error(`HTTP ${status}: ${xhr.statusText}`));
        }
        xhr.open('GET', src, true);
        xhr.send();
    });
}

/**
 * Fetches a CSS file from a URL synchronously and creates a CSSStyleSheet.
 * @param {string} src - The URL of the CSS resource to fetch.
 * @returns {CSSStyleSheet} A CSSStyleSheet instance populated with the fetched CSS.
 * @throws {Error} If the underlying text fetch fails.
 */
function FetchCSSSync(src){
    const css = new CSSStyleSheet();
    css.replaceSync(FetchTextSync(src))
    return css;
}

/**
 * Fetches a CSS file from a URL asynchronously and creates a CSSStyleSheet.
 * @param {string} src - The URL of the CSS resource to fetch.
 * @returns {Promise<CSSStyleSheet>} A promise resolving to a CSSStyleSheet instance.
 * @throws {Error} A promise rejecting if the fetch fails.
 */
async function FetchCSS(src){
    const css = new CSSStyleSheet();
    css.replaceSync(await FetchText(src));
    return css;
}

/**
 * Fetches HTML content from a URL synchronously and wraps it in a template element.
 * @param {string} src - The URL of the HTML resource to fetch.
 * @returns {HTMLTemplateElement} A template element containing the fetched HTML content.
 * @throws {Error} If the underlying text fetch fails.
 */
function FetchHTMLSync(src){
    const template = document.createElement('template');
    template.innerHTML = FetchTextSync(src)
    return template;
}

/**
 * Fetches HTML content from a URL asynchronously and wraps it in a template element.
 * @param {string} src - The URL of the HTML resource to fetch.
 * @returns {Promise<HTMLTemplateElement>} A promise resolving to a template element.
 * @throws {Error} A promise rejecting if the fetch fails.
 */
async function FetchHTML(src){
    const template = document.createElement('template');
    template.innerHTML = await FetchText(src)
    return template;
}

const exts = new Set(['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'gif', 'webp', 'avif', 'svg', 'apng', 'bmp', 'ico']);

/**
 * Retrieves the file extension from a filename or URL string. (tTry "name.xls.doc.js" result "js")
 * @param {string} src - The filename or URL string to parse.
 * @returns {string} The file extension (e.g., 'js', 'png'). Returns undefined if no extension found.
 */
function getExtension(src){
    const regex = /(?:\.([^.]+))?$/;
    const ext = (regex.exec(src+"")[1]).toLowerCase();

    if(!exts.has(ext))
        throw new Error(`File ${src}: not compatible.`);

    return ext;
}

/**
 * Converts a Uint8Array to a Base64 encoded string.
 * @param {Uint8Array} uint8Array - The binary data to convert.
 * @returns {string} The Base64 encoded string representation of the array.
 */
function uint8ToBase64(uint8Array) {
    let binary = '';
    const len = uint8Array.byteLength;

    for (let i = 0; i < len; i++)
        binary += String.fromCharCode(uint8Array[i]);
    
    return btoa(binary);
}

/**
 * Create a Image from XHR response text.
 * @param {string} ext - Image extension.
 * @param {string} text - XHR response text
 * @returns 
 */
function createIMG(ext, text){
    const img = new Image();
    const bytes = new Uint8Array(text.length);

    for (let i = 0; i < text.length; i++)
        bytes[i] = text.charCodeAt(i) & 0xff;
    
    img.src = `data:image/${ext};base64,` + uint8ToBase64(bytes);
    return img;
}

/**
 * Fetches an image file from a URL synchronously, validates the extension, 
 * and returns an HTMLImageElement using a data URL.
 * @param {string} src - The URL of the image resource to fetch.
 * @returns {HTMLImageElement} An Image element with the src set to the fetched data URL.
 * @throws {Error} If the file extension is not supported or the HTTP request fails.
 */
function FetchIMGSync(src){
    src = getFullPath(src);
    const ext = getExtension(src).toLowerCase();
    const xhr = new XMLHttpRequest();
    xhr.open('GET', src, false);
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.send();
    const status = xhr.status;
    
    if((status >= 200 && status < 300) || status == 304)
        return createIMG(ext, xhr.responseText);

    throw new Error(`HTTP ${status}: ${xhr.statusText}`);
}

/**
 * Fetches an image from a URL asynchronously and resolves with an HTMLImageElement.
 * @param {string} src - The URL of the image resource to fetch.
 * @returns {Promise<HTMLImageElement>} A promise resolving to an Image element.
 * @throws {Error} A promise rejecting if the image fails to load.
 */
async function FetchIMG(src){
    src = getFullPath(src);
    const ext = getExtension(src);
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onloadend = function(){
            const status = xhr.status;
            //respuesta satisfactoria (200 a 299) ó cache (304)
            if((status >= 200 && status < 300) || status == 304)
                resolve(createIMG(ext, xhr.responseText));    
            else
                reject(new Error(`HTTP ${status}: ${xhr.statusText}`));
        }

        xhr.overrideMimeType('text/plain; charset=x-user-defined');
        xhr.open('GET', src, true);
        xhr.send();
    });
}

/**
 * Fetches a JSON file from a URL asynchronously and creates a plain object.
 * @param {string} src - The URL of the JSON resource to fetch.
 * @returns {object} Plain object
 */
function FetchJSONSync(src) {
    return JSON.parse(FetchTextSync(src));
}

/**
 * Fetches a JSON file from a URL asynchronously and creates a plain object.
 * @param {string} src - The URL of the JSON resource to fetch.
 * @returns {Promise<object>} A promise resolving to a plain object.
 */
async function FetchJSON(src) {
    return JSON.parse(await FetchText(src));
}

/**
 * Create a Document parsing XML text.
 * @param {string} txt - Text to parse.
 * @returns {Document}
 */
function createXML(txt){
    const doc = new DOMParser().parseFromString(
        txt,
        'application/xml'
    );

    const err = doc.querySelector('parsererror');
    
    if (err) 
        throw new Error(`Invalid XML: ${err.textContent}`);

    return doc;
}

/**
 * Fetches a XML file from a URL synchronously and creates a Document.
 * @param {string} src - The URL of the XML resource to fetch.
 * @returns {Document} Parse XML as Document.
 */
function FetchXMLSync(src) {
    return createXML(FetchTextSync(src));
}

/**
 * Fetches a XML file from a URL asynchronously and creates a Document.
 * @param {string} src - The URL of the XML resource to fetch.
 * @returns {Promise<Document>} A promise resolving to a Document.
 */
async function FetchXML(src) {
    return createXML(await FetchText(src));
}

export { 
    FetchText, FetchCSS, 
    FetchHTML, FetchIMG,
    FetchJSON, FetchXML,
    FetchTextSync, FetchCSSSync, 
    FetchHTMLSync, FetchIMGSync,
    FetchJSONSync, FetchXMLSync
};