export type Collection = {
  id: string;
  nom: string;
  description: string;
  image: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductCollection = {
  id: string;
  productId: string;
  collectionId: string;
  collection: Collection;
};

export type ProductVariant = {
  id: string;
  productId: string;
  taille: string | null;
  couleur: string | null;
  couleurHex: string | null;
  prix: number | null;
  quantity: number;
  sku: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TypeProduct = {
  id: string;
  nom: string;
  slug: string;
  description: string;
  prix: number;
  prixReduit: number;
  images: string[];
  quantity: number | null;
  createdAt: Date;
  updatedAt: Date;
  variants: ProductVariant[];
  collections: ProductCollection[];
};