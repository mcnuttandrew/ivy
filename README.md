# Ivy - an Integrated Visualization Editor

This is the code repository for the ivy integrated visualization editor. It's functionality is described in depth in our paper [CHI21 paper](https://arxiv.org/pdf/2101.07902.pdf). The idea for the design of the editor is as follows: there are many different ways to create charts. Each of them have upsides and downsides. For instance chart choosers (like what you find in excel or google sheets) are simple to use and make creating charts really easy, however they aren't very flexible. Shelf builders (like Tableau) are great for exploration, but they make that gain by exchanging some amount of ease of use and repeatability. Textual programming (through tools like vega-lite or d3) is really expressive and enables precise construction of particular forms, yet it can be difficult to do so.

This system tries to fill these gaps by combining each of these modalities seeking to combine the good parts of each without falling prey to their weaknesses. It does this by constructing a meta-language over the top any JSON-based charting grammar (in particular we support [Vega](https://vega.github.io/vega/), [Vega-Lite](https://vega.github.io/vega-lite/), [Atom](https://github.com/mcnuttandrew/unit-vis#readme), and a toy data table language). The meta-language is a super set of JSON which adds conditionals and variables. You can find out more about the [meta-language in the docs](https://ivy-vis.netlify.app/#/docs). 



# Development

For local development install node deps and start development server as you normally would:

```sh
yarn
yarn start
# or if using npm
npm install
npm run start
```

Currently netlify runs the deployed version (and remounts automatically on push). It is hosted at https://ivy-vis.netlify.com/
