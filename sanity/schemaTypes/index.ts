import { type SchemaTypeDefinition } from "sanity";
import { collectionType } from "./collectionType";
import { commandeType } from "./commandeType";
import { marqueType } from "./marqueType";
import { produitType } from "./produitType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [produitType, collectionType, marqueType, commandeType],
};
