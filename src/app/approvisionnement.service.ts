import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { delay, Observable, of } from 'rxjs';
import { Approvisionnement, Article, Fournisseur } from './shared/models';



@Injectable({ providedIn: 'root' })
export class ApprovisionnementService {
  
 private apiUrl = '/api'; // URL de base de votre API
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  // Données mockées pour le développement
  private mockFournisseurs: Fournisseur[] = [
    { id: '1', nom: 'Textiles Dakar SARL', contact: '77 123 45 67', email: 'contact@textiles-dakar.sn' },
    { id: '2', nom: 'Mercerie Centrale', contact: '76 234 56 78', email: 'info@mercerie-centrale.sn' },
    { id: '3', nom: 'Tissus Premium', contact: '78 345 67 89', email: 'vente@tissus-premium.sn' },
    { id: '4', nom: 'Distribution Moderne', contact: '70 456 78 90', email: 'commercial@distrib-moderne.sn' }
  ];

  private mockArticles: Article[] = [
    { id: '1', nom: 'Coton blanc 100%', prixReference: 5000, unite: 'mètre', categorie: 'Tissus' },
    { id: '2', nom: 'Soie naturelle', prixReference: 15000, unite: 'mètre', categorie: 'Tissus' },
    { id: '3', nom: 'Lin premium', prixReference: 8000, unite: 'mètre', categorie: 'Tissus' },
    { id: '4', nom: 'Polyester résistant', prixReference: 3000, unite: 'mètre', categorie: 'Tissus' },
    { id: '5', nom: 'Laine mérinos', prixReference: 12000, unite: 'mètre', categorie: 'Tissus' },
    { id: '6', nom: 'Velours de luxe', prixReference: 18000, unite: 'mètre', categorie: 'Tissus' },
    { id: '7', nom: 'Denim brut', prixReference: 6000, unite: 'mètre', categorie: 'Tissus' },
    { id: '8', nom: 'Satin brillant', prixReference: 10000, unite: 'mètre', categorie: 'Tissus' }
  ];

  private mockApprovisionnements: Approvisionnement[] = [];

  constructor(private http: HttpClient) {}

  // ==================== FOURNISSEURS ====================

  /**
   * Récupère tous les fournisseurs
   */
  getFournisseurs(): Observable<Fournisseur[]> {
    // Version mockée (développement)
    return of(this.mockFournisseurs).pipe(delay(300));

    // Version API (production)
    // return this.http.get<Fournisseur[]>(`${this.apiUrl}/fournisseurs`);
  }

  /**
   * Récupère un fournisseur par ID
   */
  getFournisseurById(id: string): Observable<Fournisseur | undefined> {
    // Version mockée
    const fournisseur = this.mockFournisseurs.find(f => f.id === id);
    return of(fournisseur).pipe(delay(200));

    // Version API
    // return this.http.get<Fournisseur>(`${this.apiUrl}/fournisseurs/${id}`);
  }

  // ==================== ARTICLES ====================

  /**
   * Récupère tous les articles
   */
  getArticles(): Observable<Article[]> {
    // Version mockée
    return of(this.mockArticles).pipe(delay(300));

    // Version API
    // return this.http.get<Article[]>(`${this.apiUrl}/articles`);
  }

  /**
   * Récupère un article par ID
   */
  getArticleById(id: string): Observable<Article | undefined> {
    // Version mockée
    const article = this.mockArticles.find(a => a.id === id);
    return of(article).pipe(delay(200));

    // Version API
    // return this.http.get<Article>(`${this.apiUrl}/articles/${id}`);
  }

  /**
   * Recherche des articles par nom
   */
  searchArticles(searchTerm: string): Observable<Article[]> {
    // Version mockée
    const results = this.mockArticles.filter(a => 
      a.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return of(results).pipe(delay(300));

    // Version API
    // return this.http.get<Article[]>(`${this.apiUrl}/articles/search?q=${searchTerm}`);
  }

  // ==================== APPROVISIONNEMENTS ====================

  /**
   * Récupère tous les approvisionnements
   */
  getApprovisionnements(): Observable<Approvisionnement[]> {
    // Version mockée
    return of(this.mockApprovisionnements).pipe(delay(500));

    // Version API
    // return this.http.get<Approvisionnement[]>(`${this.apiUrl}/approvisionnements`);
  }

  /**
   * Récupère un approvisionnement par ID ou référence
   */
  getApprovisionnementById(id: string): Observable<Approvisionnement | undefined> {
    // Version mockée
    const appro = this.mockApprovisionnements.find(a => a.id === id || a.reference === id);
    return of(appro).pipe(delay(300));

    // Version API
    // return this.http.get<Approvisionnement>(`${this.apiUrl}/approvisionnements/${id}`);
  }

  /**
   * Crée un nouvel approvisionnement
   */
  createApprovisionnement(appro: Omit<Approvisionnement, 'id' | 'createdAt' | 'updatedAt'>): Observable<Approvisionnement> {
    // Version mockée
    const newAppro: Approvisionnement = {
      ...appro,
      id: `APP-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockApprovisionnements.push(newAppro);
    return of(newAppro).pipe(delay(500));

    // Version API
    // return this.http.post<Approvisionnement>(
    //   `${this.apiUrl}/approvisionnements`, 
    //   appro, 
    //   { headers: this.headers }
    // );
  }

  /**
   * Met à jour un approvisionnement
   */
  updateApprovisionnement(id: string, appro: Partial<Approvisionnement>): Observable<Approvisionnement> {
    // Version mockée
    const index = this.mockApprovisionnements.findIndex(a => a.id === id);
    if (index !== -1) {
      this.mockApprovisionnements[index] = {
        ...this.mockApprovisionnements[index],
        ...appro,
        updatedAt: new Date()
      };
      return of(this.mockApprovisionnements[index]).pipe(delay(500));
    }
    throw new Error('Approvisionnement non trouvé');

    // Version API
    // return this.http.put<Approvisionnement>(
    //   `${this.apiUrl}/approvisionnements/${id}`, 
    //   appro, 
    //   { headers: this.headers }
    // );
  }

  /**
   * Supprime un approvisionnement
   */
  deleteApprovisionnement(id: string): Observable<void> {
    // Version mockée
    this.mockApprovisionnements = this.mockApprovisionnements.filter(a => a.id !== id);
    return of(void 0).pipe(delay(500));

    // Version API
    // return this.http.delete<void>(`${this.apiUrl}/approvisionnements/${id}`);
  }

  /**
   * Change le statut d'un approvisionnement
   */
  changeStatut(id: string, statut: 'En attente' | 'Reçu' | 'Annulé'): Observable<Approvisionnement> {
    return this.updateApprovisionnement(id, { statut });

    // Version API
    // return this.http.patch<Approvisionnement>(
    //   `${this.apiUrl}/approvisionnements/${id}/statut`, 
    //   { statut }, 
    //   { headers: this.headers }
    // );
  }

  /**
   * Valide la réception d'un approvisionnement
   */
  validerReception(id: string): Observable<Approvisionnement> {
    return this.changeStatut(id, 'Reçu');
  }

  // ==================== GÉNÉRATION DE RÉFÉRENCE ====================

  /**
   * Génère une référence unique pour un approvisionnement
   */
  genererReference(): Observable<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const reference = `APP-${year}${month}-${random}`;
    
    return of(reference).pipe(delay(100));

    // Version API - vérifier l'unicité
    // return this.http.post<{reference: string}>(
    //   `${this.apiUrl}/approvisionnements/generer-reference`, 
    //   {}, 
    //   { headers: this.headers }
    // ).pipe(map(response => response.reference));
  }

  /**
   * Vérifie si une référence existe déjà
   */
  verifierReference(reference: string): Observable<boolean> {
    // Version mockée
    const exists = this.mockApprovisionnements.some(a => a.reference === reference);
    return of(exists).pipe(delay(200));

    // Version API
    // return this.http.get<{exists: boolean}>(
    //   `${this.apiUrl}/approvisionnements/verifier-reference/${reference}`
    // ).pipe(map(response => response.exists));
  }

  // ==================== STATISTIQUES ====================

  /**
   * Récupère les statistiques des approvisionnements
   */
  getStatistiques(dateDebut?: Date, dateFin?: Date): Observable<any> {
    // Version mockée
    const total = this.mockApprovisionnements.reduce((sum, a) => sum + a.montantTotal, 0);
    
    return of({
      totalMontant: total,
      nombreApprovisionnements: this.mockApprovisionnements.length,
      enAttente: this.mockApprovisionnements.filter(a => a.statut === 'En attente').length,
      recus: this.mockApprovisionnements.filter(a => a.statut === 'Reçu').length
    }).pipe(delay(300));

    // Version API
    // const params = new URLSearchParams();
    // if (dateDebut) params.append('dateDebut', dateDebut.toISOString());
    // if (dateFin) params.append('dateFin', dateFin.toISOString());
    // return this.http.get<any>(`${this.apiUrl}/approvisionnements/statistiques?${params}`);
  }

  // ==================== EXPORT ====================

  /**
   * Exporte les approvisionnements en CSV
   */
  exportCSV(approvisionnements: Approvisionnement[]): void {
    const headers = ['Référence', 'Date', 'Fournisseur', 'Montant Total', 'Statut'];
    const data = approvisionnements.map(a => [
      a.reference,
      a.date,
      a.fournisseur || '',
      a.montantTotal,
      a.statut
    ]);

    let csv = headers.join(',') + '\n';
    data.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `approvisionnements_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
