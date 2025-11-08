import { Component, computed, OnInit, Pipe, signal } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApprovisionnementService, ArticleApprovisionnement } from '../../approvisionnement.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

interface Article {
  id: string;
  nom: string;
  prixReference?: number;
}

interface Fournisseur {
  id: string;
  nom: string;
  contact?: string;
}

interface ArticleAjoute {
  articleId: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
}
@Component({
  selector: 'app-new-approvisionnement',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterLink],
  templateUrl: './new-approvisionnement.component.html',
  styleUrl: './new-approvisionnement.component.scss'
})
export class NewApprovisionnementComponent implements OnInit {
 approForm!: FormGroup;
  
  // Mode d'édition
  isEditMode = false;
  approvisionnementId?: string;
  
  // États de chargement
  isLoading = false;
  isSaving = false;
  isLoadingFournisseurs = false;
  isLoadingArticles = false;
  
  // Messages d'erreur
  errorMessage = '';
  
  // Listes de données
  fournisseurs: Fournisseur[] = [];
  articles: Article[] = [];
  
  // Article en cours d'ajout
  currentArticle: ArticleApprovisionnement = {
    articleId: '',
    quantite: 0,
    prixUnitaire: 0,
    montant: 0
  };
  
  // Articles ajoutés à l'approvisionnement
  articlesAjoutes: ArticleApprovisionnement[] = [];
  
  // Montant total
  get montantTotal(): number {
    return this.articlesAjoutes.reduce((total, item) => total + item.montant, 0);
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private approvisionnementService: ApprovisionnementService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    
    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.approvisionnementId = params['id'];
        this.loadApprovisionnement(params['id']);
      } else {
        this.setDefaultDate();
        this.genererReference();
      }
    });
  }

  /**
   * Initialise le formulaire avec les validations
   */
  private initForm(): void {
    this.approForm = this.fb.group({
      date: ['', Validators.required],
      fournisseur: ['', Validators.required],
      reference: ['', Validators.required],
      observations: ['']
    });
  }

  /**
   * Charge les données (fournisseurs et articles) depuis JSON Server
   */
  private loadData(): void {
    this.isLoading = true;

    // Charger les fournisseurs
    this.isLoadingFournisseurs = true;
    this.approvisionnementService.getFournisseurs().pipe(
      finalize(() => this.isLoadingFournisseurs = false)
    ).subscribe({
      next: (data) => {
        this.fournisseurs = data;
        console.log('✅ Fournisseurs chargés:', data.length);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des fournisseurs:', error);
        this.errorMessage = 'Erreur lors du chargement des fournisseurs. Vérifiez que JSON Server est démarré.';
      }
    });

    // Charger les articles
    this.isLoadingArticles = true;
    this.approvisionnementService.getArticles().pipe(
      finalize(() => {
        this.isLoadingArticles = false;
        this.isLoading = false;
      })
    ).subscribe({
      next: (data) => {
        this.articles = data;
        console.log('✅ Articles chargés:', data.length);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des articles:', error);
        this.errorMessage = 'Erreur lors du chargement des articles. Vérifiez que JSON Server est démarré.';
      }
    });
  }

  /**
   * Charge un approvisionnement existant pour l'édition
   */
  private loadApprovisionnement(id: string): void {
    this.isLoading = true;

    this.approvisionnementService.getApprovisionnementById(id).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data) => {
        console.log('✅ Approvisionnement chargé:', data);
        
        // Remplir le formulaire
        this.approForm.patchValue({
          date: data.date,
          fournisseur: data.fournisseurId,
          reference: data.reference,
          observations: data.observations
        });

        // Charger les articles
        this.articlesAjoutes = [...data.articles];
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement:', error);
        alert('Erreur lors du chargement de l\'approvisionnement');
        this.retourListe();
      }
    });
  }

  /**
   * Définit la date par défaut à aujourd'hui
   */
  private setDefaultDate(): void {
    const today = new Date().toISOString().split('T')[0];
    this.approForm.patchValue({ date: today });
  }

  /**
   * Génère automatiquement une référence unique via JSON Server
   */
  genererReference(): void {
    this.approvisionnementService.genererReference().subscribe({
      next: (reference) => {
        this.approForm.patchValue({ reference });
        console.log('✅ Référence générée:', reference);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la génération de la référence:', error);
        // Fallback : générer localement
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.approForm.patchValue({ reference: `APP-${year}${month}-${random}` });
      }
    });
  }

  /**
   * Calcule le montant total pour l'article en cours
   */
  calculerMontant(): void {
    this.currentArticle.montant = this.currentArticle.quantite * this.currentArticle.prixUnitaire;
  }

  /**
   * Remplit automatiquement le prix de référence quand un article est sélectionné
   */
  onArticleChange(): void {
    const article = this.articles.find(a => a.id === this.currentArticle.articleId);
    if (article && article.prixReference) {
      this.currentArticle.prixUnitaire = article.prixReference;
      this.calculerMontant();
      console.log('✅ Prix de référence appliqué:', article.prixReference);
    }
  }

  /**
   * Ajoute un article à la liste
   */
  ajouterArticle(): void {
    if (!this.currentArticle.articleId || !this.currentArticle.quantite || !this.currentArticle.prixUnitaire) {
      alert('Veuillez remplir tous les champs de l\'article');
      return;
    }

    // Vérifier si l'article n'est pas déjà ajouté
    const existant = this.articlesAjoutes.find(a => a.articleId === this.currentArticle.articleId);
    if (existant) {
      if (confirm('Cet article est déjà dans la liste. Voulez-vous mettre à jour la quantité ?')) {
        existant.quantite += this.currentArticle.quantite;
        existant.montant = existant.quantite * existant.prixUnitaire;
        console.log('✅ Article mis à jour:', existant);
      }
    } else {
      // Ajouter l'article à la liste
      this.articlesAjoutes.push({ ...this.currentArticle });
      console.log('✅ Article ajouté:', this.currentArticle);
    }

    // Réinitialiser l'article courant
    this.resetCurrentArticle();
  }

  /**
   * Supprime un article de la liste
   */
  supprimerArticle(index: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      const removed = this.articlesAjoutes.splice(index, 1);
      console.log('✅ Article supprimé:', removed);
    }
  }

  /**
   * Réinitialise l'article en cours
   */
  private resetCurrentArticle(): void {
    this.currentArticle = {
      articleId: '',
      quantite: 0,
      prixUnitaire: 0,
      montant: 0
    };
  }

  /**
   * Récupère le nom d'un article par son ID
   */
  getArticleNom(articleId: string): string {
    const article = this.articles.find(a => a.id === articleId);
    return article ? article.nom : 'Article inconnu';
  }

  /**
   * Soumet le formulaire - Envoie vers JSON Server
   */
  onSubmit(): void {
    if (this.approForm.invalid) {
      this.markFormGroupTouched(this.approForm);
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.articlesAjoutes.length === 0) {
      alert('Veuillez ajouter au moins un article');
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    // Récupérer le nom du fournisseur
    const fournisseur = this.fournisseurs.find(f => f.id === this.approForm.value.fournisseur);

    // Préparer les données
    const approvisionnement = {
      reference: this.approForm.value.reference,
      date: this.approForm.value.date,
      fournisseurId: this.approForm.value.fournisseur,
      fournisseur: fournisseur ? fournisseur.nom : '',
      observations: this.approForm.value.observations || '',
      articles: this.articlesAjoutes,
      montantTotal: this.montantTotal,
      statut: 'En attente' as const
    };

    console.log('📤 Envoi vers JSON Server:', approvisionnement);

    // Créer ou mettre à jour
    if (this.isEditMode && this.approvisionnementId) {
      // Mode édition
      this.approvisionnementService.updateApprovisionnement(this.approvisionnementId, approvisionnement)
        .pipe(finalize(() => this.isSaving = false))
        .subscribe({
          next: (response) => {
            console.log('✅ Approvisionnement mis à jour:', response);
            alert('Approvisionnement mis à jour avec succès !');
            this.retourListe();
          },
          error: (error) => {
            console.error('❌ Erreur lors de la mise à jour:', error);
            this.errorMessage = 'Erreur lors de la mise à jour. Vérifiez que JSON Server est démarré.';
            alert('Erreur lors de la mise à jour de l\'approvisionnement');
          }
        });
    } else {
      // Mode création
      this.approvisionnementService.createApprovisionnementSimple(approvisionnement)
        .pipe(finalize(() => this.isSaving = false))
        .subscribe({
          next: (response) => {
            console.log('✅ Approvisionnement créé:', response);
            alert('Approvisionnement créé avec succès !');
            this.retourListe();
          },
          error: (error) => {
            console.error('❌ Erreur lors de la création:', error);
            this.errorMessage = 'Erreur lors de la création. Vérifiez que JSON Server est démarré.';
            alert('Erreur lors de la création de l\'approvisionnement');
          }
        });
    }
  }

  /**
   * Annule et retourne à la liste
   */
  annuler(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les données non enregistrées seront perdues.')) {
      this.retourListe();
    }
  }

  /**
   * Retourne à la liste des approvisionnements
   */
  retourListe(): void {
    this.router.navigate(['/list']);
  }

  /**
   * Marque tous les champs du formulaire comme touchés
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
