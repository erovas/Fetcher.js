/**
 * Fetches text content from a URL synchronously using XMLHttpRequest.
 * @param {string} src - The URL of the resource to fetch.
 * @returns {string} The text response text if the request is successful (status 200-299 or 304).
 * @throws {Error} If the HTTP status is not in the successful range.
 */
function FetchTextSync(src){
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

/**
 * Retrieves the file extension from a filename or URL string. (tTry "name.xls.doc.js" result "js")
 * @param {string} fileName - The filename or URL string to parse.
 * @returns {string} The file extension (e.g., 'js', 'png'). Returns undefined if no extension found.
 */
function getExtension(fileName){
    let regex = /(?:\.([^.]+))?$/;
    return regex.exec(fileName+"")[1];
}

const exts = new Set(['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'gif', 'webp', 'avif', 'svg', 'apng', 'bmp', 'ico']);

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
 * Fetches an image file from a URL synchronously, validates the extension, 
 * and returns an HTMLImageElement using a data URL.
 * @param {string} src - The URL of the image resource to fetch.
 * @returns {HTMLImageElement} An Image element with the src set to the fetched data URL.
 * @throws {Error} If the file extension is not supported or the HTTP request fails.
 */
function FetchIMGSync(src){
    const ext = getExtension(src).toLowerCase();

    if(!exts.has(ext))
        throw new Error(`File ${src}: not compatible.`);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', src, false);
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.send();
    const status = xhr.status;
    
    if((status >= 200 && status < 300) || status == 304){
        const img = new Image();
        const text = xhr.responseText;
        const bytes = new Uint8Array(text.length);

        for (let i = 0; i < text.length; i++)
            bytes[i] = text.charCodeAt(i) & 0xff;
        
        img.src = `data:image/${ext};base64,` + uint8ToBase64(bytes);
        return img
    }

    throw new Error(`HTTP ${status}: ${xhr.statusText}`);
}

/**
 * Fetches an image from a URL asynchronously and resolves with an HTMLImageElement.
 * @param {string} src - The URL of the image resource to fetch.
 * @returns {Promise<HTMLImageElement>} A promise resolving to an Image element.
 * @throws {Error} A promise rejecting if the image fails to load.
 */
function FetchIMG(src){
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = e => resolve(img);
        img.onerror = e => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

export { FetchText, FetchCSS, FetchHTML, FetchIMG, FetchTextSync, FetchCSSSync, FetchHTMLSync, FetchIMGSync };
