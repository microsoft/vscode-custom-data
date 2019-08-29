# Web Component Examples

This is a fork of https://github.com/mdn/web-components-examples to demonstrate VS Code's improved HTML support for custom tags / attributes.

- VS Code tracking issue: https://github.com/Microsoft/vscode/issues/62976
- w3c/webcomponents discussion: https://github.com/w3c/webcomponents/issues/776

Please send feedback and feature requests to the above issues or open new issues at https://github.com/Microsoft/vscode.

## Demo

![demo](demo.gif)

## Files of interest

- [.vscode/settings.json](.vscode/settings.json): The `html.experimental.custom.tags` and `html.experimental.custom.attributes` settings inform VS Code's HTML language server of custom tags / attributes.
- [web-components.json](web-components.json) and [web-components-attributes.json](web-components-attributes.json): The JSON files that define custom tags / attributes. **The JSON format is subject to change.**

## Limitations

- [ ] VS Code does not offer attribute description in completions yet. https://github.com/Microsoft/vscode/issues/63955
- [ ] VS Code's HTML langauge server loads these components upon startup. Ideally, as users change the configuration, VS Code's HTML language server should reload the tags / attributes definitions.
- [ ] `slot` is not being parsed and no `<slot>` or `<slot name="">` completions yet.
- [ ] Currently this model makes it possible for `my-ui-lib` to publish a NPM package including a `web-components.json`, and ask users to include `./node_modules/my-ui-lib/web-components.json` in their workspace settings for HTML language features. However, extensions cannot contribute such JSON files yet. Tracked in https://github.com/Microsoft/vscode/issues/64022.
- [ ] No emmet support yet. Tracked in https://github.com/Microsoft/vscode/issues/64032.
