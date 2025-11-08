import { Component, computed, OnInit, Pipe, signal } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApprovisionnementService } from '../../approvisionnement.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

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
  
  // Listes de données
  fournisseurs: Fournisseur[] = [
    { id: '1', nom: 'Textiles Dakar SARL', contact: '77 123 45 67' },
    { id: '2', nom: 'Mercerie Centrale', contact: '76 234 56 78' },
    { id: '3', nom: 'Tissus Premium', contact: '78 345 67 89' },
    { id: '4', nom: 'Distribution Moderne', contact: '70 456 78 90' }
  ];

  articles: Article[] = [
    { id: '1', nom: 'Coton blanc 100%', prixReference: 5000 },
    { id: '2', nom: 'Soie naturelle', prixReference: 15000 },
    { id: '3', nom: 'Lin premium', prixReference: 8000 },
    { id: '4', nom: 'Polyester résistant', prixReference: 3000 },
    { id: '5', nom: 'Laine mérinos', prixReference: 12000 },
    { id: '6', nom: 'Velours de luxe', prixReference: 18000 },
    { id: '7', nom: 'Denim brut', prixReference: 6000 },
    { id: '8', nom: 'Satin brillant', prixReference: 10000 }
  ];

  // Article en cours d'ajout
  currentArticle: ArticleAjoute = {
    articleId: '',
    quantite: 0,
    prixUnitaire: 0,
    montant: 0
  };

  // Articles ajoutés à l'approvisionnement
  articlesAjoutes: ArticleAjoute[] = [];

  // Montant total
  get montantTotal(): number {
    return this.articlesAjoutes.reduce((total, item) => total + item.montant, 0);
  }

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setDefaultDate();
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
   * Définit la date par défaut à aujourd'hui
   */
  private setDefaultDate(): void {
    const today = new Date().toISOString().split('T')[0];
    this.approForm.patchValue({ date: today });
  }

  /**
   * Génère automatiquement une référence unique
   */
  genererReference(): void {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const reference = `APP-${year}${month}-${random}`;
    this.approForm.patchValue({ reference });
  }

  /**
   * Calcule le montant total pour l'article en cours
   */
  calculerMontant(): void {
    this.currentArticle.montant = this.currentArticle.quantite * this.currentArticle.prixUnitaire;
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
      }
    } else {
      // Ajouter l'article à la liste
      this.articlesAjoutes.push({ ...this.currentArticle });
    }

    // Réinitialiser l'article courant
    this.resetCurrentArticle();
  }

  /**
   * Supprime un article de la liste
   */
  supprimerArticle(index: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      this.articlesAjoutes.splice(index, 1);
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
   * Soumet le formulaire
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

    // Préparer les données à envoyer
    const approvisionnement = {
      ...this.approForm.value,
      articles: this.articlesAjoutes,
      montantTotal: this.montantTotal,
      statut: 'En attente'
    };

    console.log('Approvisionnement à enregistrer:', approvisionnement);

    // Ici, vous feriez normalement un appel API
    // this.approvisionnementService.create(approvisionnement).subscribe(...)

    // Simuler l'enregistrement
    alert('Approvisionnement enregistré avec succès !');
    this.retourListe();
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

  /**
   * Remplit automatiquement le prix de référence quand un article est sélectionné
   */
  onArticleChange(): void {
    const article = this.articles.find(a => a.id === this.currentArticle.articleId);
    if (article && article.prixReference) {
      this.currentArticle.prixUnitaire = article.prixReference;
      this.calculerMontant();
    }
  }

  /**
   * Génère automatiquement la référence si le champ est vide
   */
  onFournisseurChange(): void {
    if (!this.approForm.get('reference')?.value) {
      this.genererReference();
    }
  }
}
