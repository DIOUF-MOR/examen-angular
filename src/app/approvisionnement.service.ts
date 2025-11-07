import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  statut: 'reçu' | 'en cours';
}

@Injectable({ providedIn: 'root' })
export class ApprovisionnementService {
  private apiUrl = 'http://localhost:3000/approvisionnements';
  approvisionnements = signal<Approvisionnement[]>([]);

  constructor(private http: HttpClient) {}

  getAll(): Observable<Approvisionnement[]> {
    return this.http.get<Approvisionnement[]>(this.apiUrl);
  }

  add(data: Approvisionnement): Observable<Approvisionnement> {
    return this.http.post<Approvisionnement>(this.apiUrl, data);
  }

  refresh() {
    this.getAll().subscribe(data => this.approvisionnements.set(data));
  }
}
