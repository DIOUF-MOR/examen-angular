import { Component, OnInit } from '@angular/core';
import { ApprovisionnementService } from '../../approvisionnement.service';
import { CommonModule, NgFor } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
interface Approvisionnement {
  reference: string;
  date: string;
  fournisseur: string;
  nbArticles: number;
  montant: number;
  statut: 'Reçu' | 'En attente';
}
@Component({
  selector: 'app-list-approvisionnement',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, CommonModule,FormsModule,RouterLink],
  templateUrl: './list-approvisionnement.component.html',
  styleUrl: './list-approvisionnement.component.scss'
})
export class ListApprovisionnementComponent  implements OnInit {
  approvisionnements: Approvisionnement[] = [
    {
      reference: 'APP-2023-001',
      date: '15/04/2023',
      fournisseur: 'Textiles Dakar SARL',
      nbArticles: 8,
      montant: 760000,
      statut: 'Reçu'
    },
    {
      reference: 'APP-2023-002',
      date: '10/04/2023',
      fournisseur: 'Mercerie Centrale',
      nbArticles: 8,
      montant: 320000,
      statut: 'Reçu'
    },
    {
      reference: 'APP-2023-003',
      date: '05/04/2023',
      fournisseur: 'Tissus Premium',
      nbArticles: 8,
      montant: 450000,
      statut: 'En attente'
    },
    {
      reference: 'APP-2023-004',
      date: '01/04/2023',
      fournisseur: 'Textiles Dakar SARL',
      nbArticles: 8,
      montant: 680000,
      statut: 'Reçu'
    },
    {
      reference: 'APP-2023-005',
      date: '26/03/2023',
      fournisseur: 'Mercerie Centrale',
      nbArticles: 8,
      montant: 520000,
      statut: 'Reçu'
    }
  ];

  // Listes pour les filtres
  fournisseurs: string[] = [
    'Textiles Dakar SARL',
    'Mercerie Centrale',
    'Tissus Premium'
  ];

  articles: string[] = [
    'Coton',
    'Soie',
    'Lin',
    'Polyester'
  ];

  // Variables de filtrage
  searchTerm: string = '';
  selectedFournisseur: string = '';
  selectedArticle: string = '';
  dateDebut: string = '2006/2025';
  dateFin: string = '20/07/2025';
  dateFilter: string = '';

  ngOnInit(): void {
    // Initialisation du composant
  }

  // Méthodes pour les actions
  voirDetails(appro: Approvisionnement): void {
    console.log('Voir détails:', appro);
  }

  editer(appro: Approvisionnement): void {
    console.log('Éditer:', appro);
  }

  supprimer(appro: Approvisionnement): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'approvisionnement ${appro.reference} ?`)) {
      this.approvisionnements = this.approvisionnements.filter(a => a.reference !== appro.reference);
    }
  }

  nouvelApprovisionnement(): void {
    console.log('Nouvel approvisionnement');
  }

  filtrer(): void {
    console.log('Filtrer les résultats');
    // Logique de filtrage à implémenter
  }

  reinitialiser(): void {
    this.searchTerm = '';
    this.selectedFournisseur = '';
    this.selectedArticle = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.dateFilter = '';
  }

}
