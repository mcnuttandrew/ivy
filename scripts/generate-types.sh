# requires having https://github.com/YousefED/typescript-json-schema installed globally
SCHEMA="./assets/hydra-template-lang-schema.json"
typescript-json-schema "./src/templates/types.ts" "*" --ignoreErrors > $SCHEMA && ./scripts/add-lang-ref.js $SCHEMA
