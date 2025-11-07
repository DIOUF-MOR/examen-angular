import { Component, OnInit } from '@angular/core';
import { ApprovisionnementService } from '../../approvisionnement.service';
import { CommonModule, NgFor } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-approvisionnement',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, CommonModule,RouterLink],
  templateUrl: './list-approvisionnement.component.html',
  styleUrl: './list-approvisionnement.component.scss'
})
export class ListApprovisionnementComponent  implements OnInit {
  constructor(public service: ApprovisionnementService) {}

  ngOnInit() {
    this.service.refresh();
  }

}
