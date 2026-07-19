import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import {
  ClienteService,
  ClienteRequest,
  ClienteResponse
} from '../../services/cliente';

export interface ClienteModalData {
  numeroDocumentoPrevio?: string;
}

@Component({
  selector: 'app-cliente-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatDividerModule,
  ],
  templateUrl: './cliente-modal.html',
  styleUrl: './cliente-modal.css'
})
export class ClienteModalComponent {

  tiposDocumento = ['DNI', 'RUC', 'CE'];

  form: ClienteRequest;

  guardando = signal(false);
  error = signal<string | null>(null);

  constructor(
    private clienteService: ClienteService,
    private dialogRef: MatDialogRef<ClienteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClienteModalData
  ) {
    this.form = {
      tipoDocumento: 'DNI',
      numeroDocumento: this.data?.numeroDocumentoPrevio ?? '',
      razonSocial: '',
      telefono: '',
      direccion: ''
    };
  }

  puedeGuardar(): boolean {
    return !!this.form.tipoDocumento &&
           !!this.form.numeroDocumento.trim() &&
           !!this.form.razonSocial.trim() &&
           !this.guardando();
  }

  guardar(): void {
    if (!this.puedeGuardar()) return;
    this.guardando.set(true);
    this.error.set(null);

    this.clienteService.crear(this.form).subscribe({
      next: (cliente: ClienteResponse) => {
        this.guardando.set(false);
        // Devuelve el cliente creado al componente que abrió el modal
        this.dialogRef.close(cliente);
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(
          err.error?.mensaje ?? 'Error al registrar el cliente'
        );
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}