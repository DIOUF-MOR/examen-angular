import { Component, computed, OnInit, Pipe, signal } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApprovisionnementService } from '../../approvisionnement.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-new-approvisionnement',
  standalone: true,
  imports: [ReactiveFormsModule, ReactiveFormsModule, CommonModule,RouterLink],
  templateUrl: './new-approvisionnement.component.html',
  styleUrl: './new-approvisionnement.component.scss'
})
export class NewApprovisionnementComponent implements OnInit {

   approForm!: FormGroup;

  constructor(private fb: FormBuilder, private service: ApprovisionnementService) {}

  ngOnInit() {
    this.approForm = this.fb.group({
      date: ['', Validators.required],
      reference: ['', Validators.required],
      fournisseur: ['', Validators.required],
      statut: ['en cours', Validators.required],
      articles: this.fb.array([]),
      montantTotal: [{ value: 0, disabled: true }],
    });
  }

  get articles() {
    return this.approForm.get('articles') as FormArray;
  }

  addArticle() {
    const article = this.fb.group({
      nom: ['', Validators.required],
      quantite: [1, Validators.required],
      prixUnitaire: [0, Validators.required],
      montant: [{ value: 0, disabled: true }],
    });
    article.valueChanges.subscribe(val => {
      const quantite = val?.quantite ?? 0;
      const prixUnitaire = val?.prixUnitaire ?? 0;
      const montant = quantite * prixUnitaire;
      article.get('montant')?.setValue(montant, { emitEvent: false });
      this.updateTotal();
    });
    this.articles.push(article);
  }

  removeArticle(i: number) {
    this.articles.removeAt(i);
    this.updateTotal();
  }

  updateTotal() {
    const total = this.articles.controls.reduce((sum, a) => {
      return sum + (a.get('montant')?.value || 0);
    }, 0);
    this.approForm.get('montantTotal')?.setValue(total);
  }

  submit() {
    if (this.approForm.valid) {
      const appro = { ...this.approForm.getRawValue() };
      this.service.add(appro).subscribe(() => {
        this.service.refresh();
        this.approForm.reset();
        this.articles.clear();
      });
    }
  }
}
