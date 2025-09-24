import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Store")
    .items([
      S.documentTypeListItem("produit").title("Produits"),
      S.documentTypeListItem("collection").title("Collections"),
      S.documentTypeListItem("marque").title("Marques"),
      S.documentTypeListItem("commande").title("Commandes"),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          !["produit", "collection", "marque", "commande"].includes(
            item.getId()!
          )
      ),
    ]);
