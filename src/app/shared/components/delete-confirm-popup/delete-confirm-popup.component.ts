import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-delete-confirm-popup',
  standalone: true,
  imports: [MatDialogModule, CommonModule, FormsModule],
  templateUrl: './delete-confirm-popup.component.html',
  styleUrl: './delete-confirm-popup.component.scss'
})
export class DeleteConfirmPopupComponent {
  constructor(public dialogRef: MatDialogRef<DeleteConfirmPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
