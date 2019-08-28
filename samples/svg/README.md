# SVG Sample

SVG support in HTML/CSS files using plain JSON files.

- HTML support: https://github.com/Microsoft/vscode/issues/62976
- CSS support: https://github.com/Microsoft/vscode/issues/64164

The data are pulled from:

- SVG 2 [spec](https://www.w3.org/TR/SVG2/) and [GitHub](https://github.com/w3c/svgwg)
- [MDN SVG reference](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [mdn/browser-compat-data](https://github.com/mdn/browser-compat-data)

## Usage

- Open this folder in VS Code 1.31+
- Try editing the test.html or test.css files. You should get SVG tags and attributes in HTML files, and SVG specific CSS properties in CSS files.
- Look into the `contributes` section of `package.json`. You can package this project into an extension with [`vsce`](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#vsce). Alternatively, you can download the pre-packaged versions from [releases](https://github.com/octref/svg-data/releases).

## Docs

- [HTML Custom Data](https://github.com/Microsoft/vscode-html-languageservice/blob/master/docs/customData.md)
- [CSS Custom Data](https://github.com/Microsoft/vscode-css-languageservice/blob/master/docs/customData.md)

## License

MIT