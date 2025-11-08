import { Component, OnInit } from '@angular/core';
import { Approvisionnement, ApprovisionnementService, Article, Fournisseur } from '../../approvisionnement.service';
import { CommonModule, NgFor } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-approvisionnement',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, CommonModule,FormsModule,RouterLink],
  templateUrl: './list-approvisionnement.component.html',
  styleUrl: './list-approvisionnement.component.scss'
})
export class ListApprovisionnementComponent  implements OnInit {
  approvisionnements: Approvisionnement[] = [];
  approvisionnementsFiltres: Approvisionnement[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  totalItems = 0;
  
  // Pagination affichée
  get paginatedApprovisionnements(): Approvisionnement[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.approvisionnementsFiltres.slice(startIndex, endIndex);
  }
  
  // Numéros de pages à afficher
  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5; // Nombre maximum de numéros à afficher
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    // Ajuster si on est près de la fin
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
  
  // Information de pagination
  get paginationInfo(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end} sur ${this.totalItems}`;
  }
  
  // Vérifier si on peut aller à la page précédente
  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }
  
  // Vérifier si on peut aller à la page suivante
  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }
  
  // Filtres
  searchTerm = '';
  selectedFournisseur = '';
  selectedArticle = '';
  dateDebut = '';
  dateFin = '';
  dateFilter = '';
  
  // Listes pour les filtres
  fournisseurs: Fournisseur[] = [];
  articles: Article[] = [];
  
  // État de chargement
  isLoading = false;

  constructor(
    private router: Router,
    private approvisionnementService: ApprovisionnementService
  ) {}

  ngOnInit(): void {
    this.loadApprovisionnements();
    this.loadFiltres();
  }

  /**
   * Charge les approvisionnements
   */
  loadApprovisionnements(): void {
    this.isLoading = true;
    
    this.approvisionnementService.getApprovisionnements().subscribe({
      next: (data) => {
        this.approvisionnements = data.map(a => ({
          ...a,
          nbArticles: a.articles?.length || 0,
          montant: a.montantTotal
        }));
        this.approvisionnementsFiltres = [...this.approvisionnements];
        this.updatePagination();
        this.isLoading = false;
        console.log('✅ Approvisionnements chargés:', data.length);
      },
      error: (error) => {
        console.error('❌ Erreur chargement:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Charge les listes pour les filtres
   */
  loadFiltres(): void {
    // Charger les fournisseurs
    this.approvisionnementService.getFournisseurs().subscribe({
      next: (data) => {
        this.fournisseurs = data.map(f => f);
      },
      error: (error) => console.error('Erreur fournisseurs:', error)
    });

    // Charger les articles
    this.approvisionnementService.getArticles().subscribe({
      next: (data) => {
        this.articles = data.map(a => a);
      },
      error: (error) => console.error('Erreur articles:', error)
    });
  }

  /**
   * Met à jour les informations de pagination
   */
  updatePagination(): void {
    this.totalItems = this.approvisionnementsFiltres.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Ajuster la page courante si nécessaire
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
  }

  /**
   * Va à une page spécifique
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      console.log('📄 Page:', page);
    }
  }

  /**
   * Va à la page précédente
   */
  previousPage(): void {
    if (this.canGoPrevious) {
      this.currentPage--;
      console.log('◀️ Page précédente:', this.currentPage);
    }
  }

  /**
   * Va à la page suivante
   */
  nextPage(): void {
    if (this.canGoNext) {
      this.currentPage++;
      console.log('▶️ Page suivante:', this.currentPage);
    }
  }

  /**
   * Va à la première page
   */
  firstPage(): void {
    this.goToPage(1);
  }

  /**
   * Va à la dernière page
   */
  lastPage(): void {
    this.goToPage(this.totalPages);
  }

  /**
   * Change le nombre d'éléments par page
   */
  changeItemsPerPage(newSize: number): void {
    this.itemsPerPage = newSize;
    this.currentPage = 1; // Retour à la première page
    this.updatePagination();
    console.log('📊 Éléments par page:', newSize);
  }

  /**
   * Applique les filtres
   */
  filtrer(): void {
    this.approvisionnementsFiltres = this.approvisionnements.filter(appro => {
      // Filtre par recherche (référence ou fournisseur)
      const matchSearch = !this.searchTerm || 
        appro.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (appro.fournisseur || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtre par fournisseur
      const matchFournisseur = !this.selectedFournisseur || 
        appro.fournisseur === this.selectedFournisseur;
      
      // Filtre par date début
      const matchDateDebut = !this.dateDebut || 
        appro.date >= this.dateDebut;
      
      // Filtre par date fin
      const matchDateFin = !this.dateFin || 
        appro.date <= this.dateFin;
      
      return matchSearch && matchFournisseur && matchDateDebut && matchDateFin;
    });
    
    // Retour à la première page après filtrage
    this.currentPage = 1;
    this.updatePagination();
    
    console.log('🔍 Filtres appliqués:', this.approvisionnementsFiltres.length, 'résultats');
  }

  /**
   * Réinitialise les filtres
   */
  reinitialiser(): void {
    this.searchTerm = '';
    this.selectedFournisseur = '';
    this.selectedArticle = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.dateFilter = '';
    
    this.approvisionnementsFiltres = [...this.approvisionnements];
    this.currentPage = 1;
    this.updatePagination();
    
    console.log('🔄 Filtres réinitialisés');
  }

  /**
   * Navigation vers le formulaire de création
   */
  nouvelApprovisionnement(): void {
    this.router.navigate(['/new']);
  }

  /**
   * Navigation vers le formulaire d'édition
   */
  editer(appro: Approvisionnement): void {
    this.router.navigate(['/approvisionnements', appro.id || appro.reference, 'modifier']);
  }

  /**
   * Voir les détails
   */
  voirDetails(appro: Approvisionnement): void {
    console.log('👁️ Voir détails:', appro);
    // Implémenter la navigation vers les détails
  }

  /**
   * Supprimer un approvisionnement
   */
  supprimer(appro: Approvisionnement): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'approvisionnement ${appro.reference} ?`)) {
      if (appro.id) {
        this.approvisionnementService.deleteApprovisionnement(appro.id).subscribe({
          next: () => {
            console.log('✅ Approvisionnement supprimé');
            this.loadApprovisionnements(); // Recharger la liste
          },
          error: (error) => {
            console.error('❌ Erreur suppression:', error);
            alert('Erreur lors de la suppression');
          }
        });
      } else {
        // Suppression locale si pas d'ID
        this.approvisionnements = this.approvisionnements.filter(a => a.reference !== appro.reference);
        this.filtrer();
      }
    }
  }
}
