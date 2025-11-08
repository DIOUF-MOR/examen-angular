

export interface Article {
  id: string;
  nom: string;
  description?: string;
  prixReference?: number;
  unite?: string;
  categorie?: string;
}

export interface Fournisseur {
  id: string;
  nom: string;
  contact?: string;
  email?: string;
  adresse?: string;
}

export interface ArticleApprovisionnement {
  articleId: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
}

export interface Approvisionnement {
  id?: string;
  reference: string;
  date: string;
  fournisseurId: string;
  fournisseur?: string;
  observations?: string;
  articles: ArticleApprovisionnement[];
  montantTotal: number;
  statut: 'En attente' | 'Reçu' | 'Annulé';
  createdAt?: Date;
  updatedAt?: Date;
}