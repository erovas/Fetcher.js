# Fetcher.js

This module provides a comprehensive suite of **synchronous and asynchronous network utilities** for loading external resources (text, CSS, HTML, and images) directly in the browser.

It offers paired functions (`FetchX` and `FetchXSync`) that handle downloading, status validation, and data conversion, returning native, ready-to-use objects like `CSSStyleSheet`, `<template>`, or `HTMLImageElement`. Notably, the synchronous image fetcher automatically converts binary data into Base64 data URLs for immediate embedding.

#### `FetchTextSync(src)`
**Description:** Fetches text content from a URL **synchronously**. Blocks execution until the response is received.

```javascript
try {
  const content = FetchTextSync('https://example.com/data.txt');
  console.log(content);
} catch (e) {
  console.error('Failed:', e.message);
}
```

#### `FetchText(src)`
**Description:** Fetches text content from a URL **asynchronously**. Returns a Promise that resolves with the text.

```javascript
// Async/Await style
try {
  const content = await FetchText('https://example.com/data.txt');
  console.log(content);
} catch (e) {
  console.error('Failed:', e.message);
}

// Promise style
FetchText('https://example.com/data.txt')
  .then(content => console.log(content))
  .catch(e => console.error('Failed:', e.message));
```

#### `FetchCSSSync(src)`
**Description:** Fetches a CSS file synchronously and returns a live **`CSSStyleSheet`** object ready to be injected into the document.

```javascript
try {
  const sheet = FetchCSSSync('https://example.com/styles.css');
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
} catch (e) {
  console.error('CSS load failed:', e.message);
}
```

#### `FetchCSS(src)`
**Description:** Fetches a CSS file asynchronously and returns a Promise resolving to a **`CSSStyleSheet`** object.

```javascript
const sheet = await FetchCSS('https://example.com/styles.css');
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
```

#### `FetchHTMLSync(src)`
**Description:** Fetches HTML content synchronously and wraps it in a **`<template>`** element for safe parsing.

```javascript
try {
  const template = FetchHTMLSync('https://example.com/component.html');
  const content = template.content.cloneNode(true);
  document.body.appendChild(content);
} catch (e) {
  console.error('HTML load failed:', e.message);
}
```

#### `FetchHTML(src)`
**Description:** Fetches HTML content asynchronously and returns a Promise resolving to a **`<template>`** element.

```javascript
const template = await FetchHTML('https://example.com/component.html');
const content = template.content.cloneNode(true);
document.body.appendChild(content);
```

#### `FetchIMGSync(src)`
**Description:** Fetches an image synchronously, validates the extension, converts it to a **Base64 data URL**, and returns an **`HTMLImageElement`**.

```javascript
try {
  const img = FetchIMGSync('https://example.com/image.png');
  // img.src is already set to the data URL
  document.body.appendChild(img);
} catch (e) {
  console.error('Image load failed:', e.message);
}
```

#### `FetchIMG(src)`
**Description:** Fetches an image asynchronously. Returns a Promise resolving to a loaded **`HTMLImageElement`**.

```javascript
const img = await FetchIMG('https://example.com/image.png');
document.body.appendChild(img);
```

---

### Important Note Regarding Usage
- **Aynchronous (`Sync`):** These functions **block** the browser's main thread. Use them only in specific contexts where blocking isn't an issue (e.g., startup scripts or Node.js environments with adapters). In modern browsers, it's preferable to use the asynchronous versions.
- **Asynchronous:** These are the recommended versions for any network operation in the user interface to keep the application running smoothly.
