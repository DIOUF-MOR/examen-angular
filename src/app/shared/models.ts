
export interface Article {
  nom: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
}

export interface Approvisionnement {
  id?: number;
  date: string;
  reference: string;
  fournisseur: string;
  articles: Article[];
  montantTotal: number;
  statut: string;
}