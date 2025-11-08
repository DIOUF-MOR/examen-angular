import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Article {
  id: string;
  nom: string;
  description?: string;
  prixReference?: number;
  unite?: string;
  categorie?: string;
  stock?: number;
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
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApprovisionnementService {
  // URL de JSON Server (par défaut sur le port 3000)
  private apiUrl = 'http://localhost:3000';
  
  private headers = new HttpHeaders({ 
    'Content-Type': 'application/json' 
  });

  constructor(private http: HttpClient) {}

  // ==================== FOURNISSEURS ====================

  /**
   * Récupère tous les fournisseurs
   */
  getFournisseurs(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`${this.apiUrl}/fournisseurs`);
  }

  /**
   * Récupère un fournisseur par ID
   */
  getFournisseurById(id: string): Observable<Fournisseur> {
    return this.http.get<Fournisseur>(`${this.apiUrl}/fournisseurs/${id}`);
  }

  /**
   * Crée un nouveau fournisseur
   */
  createFournisseur(fournisseur: Omit<Fournisseur, 'id'>): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(
      `${this.apiUrl}/fournisseurs`,
      fournisseur,
      { headers: this.headers }
    );
  }

  /**
   * Met à jour un fournisseur
   */
  updateFournisseur(id: string, fournisseur: Partial<Fournisseur>): Observable<Fournisseur> {
    return this.http.patch<Fournisseur>(
      `${this.apiUrl}/fournisseurs/${id}`,
      fournisseur,
      { headers: this.headers }
    );
  }

  /**
   * Supprime un fournisseur
   */
  deleteFournisseur(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/fournisseurs/${id}`);
  }

  // ==================== ARTICLES ====================

  /**
   * Récupère tous les articles
   */
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/articles`);
  }

  /**
   * Récupère un article par ID
   */
  getArticleById(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/articles/${id}`);
  }

  /**
   * Recherche des articles par nom
   */
  searchArticles(searchTerm: string): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/articles?nom_like=${searchTerm}`);
  }

  /**
   * Crée un nouvel article
   */
  createArticle(article: Omit<Article, 'id'>): Observable<Article> {
    return this.http.post<Article>(
      `${this.apiUrl}/articles`,
      article,
      { headers: this.headers }
    );
  }

  /**
   * Met à jour un article
   */
  updateArticle(id: string, article: Partial<Article>): Observable<Article> {
    return this.http.patch<Article>(
      `${this.apiUrl}/articles/${id}`,
      article,
      { headers: this.headers }
    );
  }

  /**
   * Supprime un article
   */
  deleteArticle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/articles/${id}`);
  }

  // ==================== APPROVISIONNEMENTS ====================

  /**
   * Récupère tous les approvisionnements
   * Supporte les paramètres de filtrage et de tri
   */
  getApprovisionnements(params?: {
    fournisseurId?: string;
    statut?: string;
    dateDebut?: string;
    dateFin?: string;
    _sort?: string;
    _order?: 'asc' | 'desc';
    _page?: number;
    _limit?: number;
  }): Observable<Approvisionnement[]> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<Approvisionnement[]>(
      `${this.apiUrl}/approvisionnements`,
      { params: httpParams }
    );
  }

  /**
   * Récupère un approvisionnement par ID
   */
  getApprovisionnementById(id: string): Observable<Approvisionnement> {
    return this.http.get<Approvisionnement>(`${this.apiUrl}/approvisionnements/${id}`);
  }

  /**
   * Récupère un approvisionnement par référence
   */
  getApprovisionnementByReference(reference: string): Observable<Approvisionnement[]> {
    return this.http.get<Approvisionnement[]>(
      `${this.apiUrl}/approvisionnements?reference=${reference}`
    );
  }

  /**
   * Crée un nouvel approvisionnement
   */
  createApprovisionnement(appro: Omit<Approvisionnement, 'id'>): Observable<Approvisionnement> {
    // Récupérer le nom du fournisseur
    return this.getFournisseurById(appro.fournisseurId).pipe(
      map(fournisseur => ({
        ...appro,
        fournisseur: fournisseur.nom,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      map(approWithFournisseur => 
        this.http.post<Approvisionnement>(
          `${this.apiUrl}/approvisionnements`,
          approWithFournisseur,
          { headers: this.headers }
        )
      ),
      // Flatten the nested Observable
      map(obs => obs),
      // Execute the inner observable
      switchMap(obs => obs)
    );
  }

  /**
   * Version simplifiée de createApprovisionnement
   */
  createApprovisionnementSimple(appro: any): Observable<Approvisionnement> {
    const approWithTimestamps = {
      ...appro,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.http.post<Approvisionnement>(
      `${this.apiUrl}/approvisionnements`,
      approWithTimestamps,
      { headers: this.headers }
    );
  }

  /**
   * Met à jour un approvisionnement
   */
  updateApprovisionnement(id: string, appro: Partial<Approvisionnement>): Observable<Approvisionnement> {
    const approWithTimestamp = {
      ...appro,
      updatedAt: new Date().toISOString()
    };

    return this.http.patch<Approvisionnement>(
      `${this.apiUrl}/approvisionnements/${id}`,
      approWithTimestamp,
      { headers: this.headers }
    );
  }

  /**
   * Supprime un approvisionnement
   */
  deleteApprovisionnement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/approvisionnements/${id}`);
  }

  /**
   * Change le statut d'un approvisionnement
   */
  changeStatut(id: string, statut: 'En attente' | 'Reçu' | 'Annulé'): Observable<Approvisionnement> {
    return this.updateApprovisionnement(id, { statut });
  }

  /**
   * Valide la réception d'un approvisionnement
   */
  validerReception(id: string): Observable<Approvisionnement> {
    return this.changeStatut(id, 'Reçu');
  }

  // ==================== RECHERCHE ET FILTRAGE ====================

  /**
   * Recherche d'approvisionnements avec filtres multiples
   */
  searchApprovisionnements(filters: {
    searchTerm?: string;
    fournisseurId?: string;
    statut?: string;
    dateDebut?: string;
    dateFin?: string;
  }): Observable<Approvisionnement[]> {
    let params = new HttpParams();

    // Recherche textuelle sur la référence
    if (filters.searchTerm) {
      params = params.set('reference_like', filters.searchTerm);
    }

    // Filtre par fournisseur
    if (filters.fournisseurId) {
      params = params.set('fournisseurId', filters.fournisseurId);
    }

    // Filtre par statut
    if (filters.statut) {
      params = params.set('statut', filters.statut);
    }

    // Les filtres de date nécessitent un traitement côté client
    // car JSON Server ne supporte pas les comparaisons de dates directement
    return this.http.get<Approvisionnement[]>(
      `${this.apiUrl}/approvisionnements`,
      { params }
    ).pipe(
      map(appros => {
        let filtered = appros;

        // Filtre par date de début
        if (filters.dateDebut) {
          filtered = filtered.filter(a => a.date >= filters.dateDebut!);
        }

        // Filtre par date de fin
        if (filters.dateFin) {
          filtered = filtered.filter(a => a.date <= filters.dateFin!);
        }

        return filtered;
      })
    );
  }

  // ==================== STATISTIQUES ====================

  /**
   * Récupère les statistiques des approvisionnements
   */
  getStatistiques(dateDebut?: string, dateFin?: string): Observable<any> {
    let params = new HttpParams();
    
    return this.http.get<Approvisionnement[]>(`${this.apiUrl}/approvisionnements`, { params })
      .pipe(
        map(appros => {
          // Filtrer par dates si nécessaire
          let filtered = appros;
          if (dateDebut) {
            filtered = filtered.filter(a => a.date >= dateDebut);
          }
          if (dateFin) {
            filtered = filtered.filter(a => a.date <= dateFin);
          }

          // Calculer les statistiques
          const total = filtered.reduce((sum, a) => sum + a.montantTotal, 0);
          const enAttente = filtered.filter(a => a.statut === 'En attente').length;
          const recus = filtered.filter(a => a.statut === 'Reçu').length;
          const annules = filtered.filter(a => a.statut === 'Annulé').length;

          // Fournisseur principal
          const parFournisseur = filtered.reduce((acc, appro) => {
            if (!acc[appro.fournisseur || '']) {
              acc[appro.fournisseur || ''] = 0;
            }
            acc[appro.fournisseur || ''] += appro.montantTotal;
            return acc;
          }, {} as Record<string, number>);

          const fournisseurPrincipal = Object.entries(parFournisseur)
            .sort(([, a], [, b]) => b - a)[0] || ['', 0];

          return {
            totalMontant: total,
            nombreApprovisionnements: filtered.length,
            enAttente,
            recus,
            annules,
            fournisseurPrincipal: {
              nom: fournisseurPrincipal[0],
              montant: fournisseurPrincipal[1],
              pourcentage: total > 0 ? (fournisseurPrincipal[1] / total) * 100 : 0
            }
          };
        })
      );
  }

  // ==================== GÉNÉRATION DE RÉFÉRENCE ====================

  /**
   * Génère une référence unique pour un approvisionnement
   */
  genererReference(): Observable<string> {
    return this.http.get<Approvisionnement[]>(`${this.apiUrl}/approvisionnements`)
      .pipe(
        map(appros => {
          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          
          // Trouver le dernier numéro utilisé ce mois
          const prefix = `APP-${year}${month}-`;
          const existingRefs = appros
            .map(a => a.reference)
            .filter(ref => ref.startsWith(prefix))
            .map(ref => parseInt(ref.split('-')[2]))
            .filter(num => !isNaN(num));
          
          const lastNum = existingRefs.length > 0 ? Math.max(...existingRefs) : 0;
          const nextNum = String(lastNum + 1).padStart(3, '0');
          
          return `${prefix}${nextNum}`;
        })
      );
  }

  /**
   * Vérifie si une référence existe déjà
   */
  verifierReference(reference: string): Observable<boolean> {
    return this.http.get<Approvisionnement[]>(
      `${this.apiUrl}/approvisionnements?reference=${reference}`
    ).pipe(
      map(appros => appros.length > 0)
    );
  }

  // ==================== UTILITAIRES ====================

  /**
   * Enrichit un approvisionnement avec le nom du fournisseur
   */
  enrichirAvecFournisseur(appro: Approvisionnement): Observable<Approvisionnement> {
    return this.getFournisseurById(appro.fournisseurId).pipe(
      map(fournisseur => ({
        ...appro,
        fournisseur: fournisseur.nom
      }))
    );
  }
}

// Import manquant
import { switchMap } from 'rxjs/operators';