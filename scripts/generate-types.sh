# requires having https://github.com/YousefED/typescript-json-schema installed globally
SCHEMA="./assets/ivy.json"
typescript-json-schema "./src/lang-types.ts" "*" --ignoreErrors > $SCHEMA && ./scripts/add-lang-ref.js $SCHEMA
