# Docs

Ivy is an integrated visualization editor which aims to support a variety of ways to create visualizations. In this page we provide documentation of the template language used to power our system. The basic idea of the language is that it combines JSON with a series of simple abstraction operations that enable simpler re-usability. 

Through this language we are able to treat chart specified in JSON-based domain specifics languages as functions, with the content of the function being referred to as the **body** and the arguments being referred to as the **settings**. There are two key abstraction mechanisms within these programs, substitutions and control flow, which we discuss in greater depth below. Before we get into all that, let's look at a toy example 

```js
---- settings
{"xDim": "Origin", "sort": "false"}
---- body
{
  "$schema": "https:vega.github.io/schema/vega-lite/v4.json",
  "transform": [],
  "encoding": {
    "y": {
        "field": "[xDim]", 
        "type": "nominal", 
        "sort": {"$if": "parameters.sort.includes('true')", "true": "-x"}
    },
    "x": {"aggregate": "count"}
  },
  "mark": "bar"
}

---- output
{
  "$schema": "https:vega.github.io/schema/vega-lite/v4.json",
  "transform": [],
  "encoding": {
    "y": {
        "field": "Origin", 
        "type": "nominal"
    },
    "x": {"aggregate": "count"}
  },
  "mark": "bar"
}
```

The settings are pretty simple; they just say there's something called xDim and something called sort. Everywhere in the body that looks like "[xDim]" is then replaced with the value of xDim in the settings, here "Origin". The sort field of the y channel is an if-else style conditional that checks if the sort value of the parameters object (our settings) includes true (i.e. it's true), if it is then it replaces the conditional with "-x", if not then that key is removed because there is no false branch described in the conditional.





### GUI Elements

The current user interface for Ivy features a number of different types of variables (and corresponding GUI widgets). These include:

| Data Type  | Gui Component  |   
|---|---|---|
|  Field name From Dataset |  DataTarget |
| Array of field names From Dataset |  MultiDataTarget |
| Enum |  List |
| Boolean |  Switch |
| Number |  Slider |
| Text |  FreeText |

From these basic components you can define a wide array of specific GUI behaviours. There are also a number of predefined widgets that can be helpful to use, such as DiscreteColorOptions which is a List that includes all of the basic discrete color schemes present in vega and vega-lite.

## Substitutions

Substitutions are the bread and butter of the Ivy Template Language. They enable the template designer to slot in lots of different types of values into the body. There anatomy is quite simple, anywhere in the template body where there is a match between a key name, such as xDim, in the settings and a string in the body, such as "[xDim]", the matching string is replaced with the corresponding value in from the settings.



## Control Flow

Sometimes you need to specify a conditional value when you are designing a template. Perhaps you have a Color Variable/ DataTarget where, if it's defined, you want there to be color scheme picker, and if it's not then you want there to be a single value picker. To achieve these ends you should use a conditional. You can think of them as little ternaries for JSON: is the variable in play? Do this. If not do that.



Here's a rough template for the conditionals in general

```json
{
  "$if": "QUERY",
  "true": "VALUE_IF_TRUE",
  "false": "VALUE_IF_FALSE"
}
```

**QUERY**: This is an evaluated javascript string. It only has access to one object, which is the settings object. The settings object is a plain old javascript object that maps the names of the variables in the templates (the keys) to their current values. The result of the query will be treated as a boolean, so please keep in mind the various quirks of javascript's notions of truthy/falsy, or, better yet, use explicit true and false false.

Here are a few recipes.

- If you are trying to check if a value is a boolean, then try `"query": "parameters.varName.includes('true')"` 
- If you are trying to check if a value has not been defined at all `"query": "!parameters.varName"`. (If varName is null then negating it will be true).


**VALUE_IF_TRUE** / **VALUE_IF_FALSE**: These optional values are the values taken on by the conditional if the query results in true or false. These values can be anything: arrays, objects, numbers, strings, other conditionals. As long as it's a valid ivy template language snippet than it's valid. 

*An import special behavior note*: the true and false branches are optional. Typically if the conditional encounters a query that results in a path that is not defined then it will remove that conditional. If the conditional is the value of a key-value pair (as in an object) it will delete the key, if it is an array, that cell will be removed. We saw an example of this in the example at the top of the page.

An important gotcha here is that the values of the parameters object should all be treated as strings.