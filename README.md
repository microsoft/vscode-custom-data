<p>
  <h2 align="center">vscode-custom-data</h2>
  Documentation, sample and data for using VS Code's HTML/CSS custom data format.
</p>

## Synopsis

VS Code ships with rich [language feature support](https://code.visualstudio.com/api/language-extensions/programmatic-language-features) for HTML/CSS, such as auto-completion and hover information. The core of these language support are implemented in [vscode-html-languageservice](https://github.com/microsoft/vscode-html-languageservice) and [vscode-css-languageservice](https://github.com/microsoft/vscode-css-languageservice). In the past, these libraries were coupled to outdated schemas that define HTML/CSS entities. Custom data decouples these libraries from the data they use and allows VS Code to offer up-to-date support for latest HTML/CSS proposals or frameworks built on top of HTML/CSS.

TODO TODO TODO TODO TODO

## Samples

- [`samples/helloworld`](./samples/helloworld): Open this sample in VS Code and start playing with custom data.
- [`samples/svg`](./samples/svg): A real-world sample that loads SVG-related HTML/CSS entities inVS Code.

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
