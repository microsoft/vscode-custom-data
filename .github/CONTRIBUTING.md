# Contributing to VS Code Custom Data

## I want to update a specific HTML/CSS entity

If you go to `web-data`, the `generate-data` script will regenerate `data/browsers.html-data.json` and `data/browsers.css-data.json`.

Some data are pulled remotely from MDN and other sources. For all the local xml and json files, you can edit them and run `yarn generate-data` to update the files in [`web-data/data`](../web-data/data).