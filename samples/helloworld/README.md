# Custom Data for HTML/CSS support in VS Code

This demonstrates Custom HTML/CSS data support for VS Code.

See https://code.visualstudio.com/updates/v1_31 for details.

## Usage

- Open this folder in VS Code 1.31+
- Try completion/hover in the test.html and test.css
  - In `test.html`, try typing `<my-` to complete `<my-button>` HTML tag.
  - In `test.css` try typing `my-` inside a selector to complete `my-size` CSS property.
- Edit data in html.json and css.json and reload VS Code to reload the custom data

## Docs

- [HTML Custom Data](https://github.com/Microsoft/vscode-html-languageservice/blob/master/docs/customData.md)
- [CSS Custom Data](https://github.com/Microsoft/vscode-css-languageservice/blob/master/docs/customData.md)