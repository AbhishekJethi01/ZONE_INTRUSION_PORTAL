import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import { DeleteConfirmPopupComponent } from '../../shared/components/delete-confirm-popup/delete-confirm-popup.component';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(public dialog: MatDialog) { }

  showErrors(ids: string[]) {
    ids.forEach(id => {
      document.getElementById(id)?.classList.remove('d-none');
    });
  }

  hideErrors(ids: string[]) {
    ids.forEach(id => {
      document.getElementById(id)?.classList.add('d-none');
    });
  }


  formatDateTimeToAMPM(dateTime: string | Date) {
    if (!dateTime) return '';

    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;

    if (isNaN(date.getTime())) return ''; // Handle invalid dates

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  }

  openDeleteConfirmDialog(uniqValue?: any): Observable<boolean> {
    const dialogRef: MatDialogRef<DeleteConfirmPopupComponent> = this.dialog.open(DeleteConfirmPopupComponent, {
      data: {
        isAll: false,
        uniqValue
      },
    });
    return dialogRef.afterClosed().pipe(
      map((res) => {
        return res ? true : false;
      })
    );
  }

  blockNonNumericKeys(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    const isNumber = /^[0-9]$/.test(event.key);

    const isCtrlCombo =
      (event.ctrlKey || event.metaKey) &&
      ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase());

    if (!isNumber && !allowedKeys.includes(event.key) && !isCtrlCombo) {
      event.preventDefault();
    }
  }

  onPasteOnlyNumbers(event: ClipboardEvent) {
    event.preventDefault();

    const clipboardData = event.clipboardData?.getData('text') ?? '';
    const onlyNumbers = clipboardData.replace(/\D/g, ''); // Remove non-digits

    const input = event.target as HTMLInputElement;

    // Insert at cursor position
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentValue = input.value;

    const newValue = currentValue.slice(0, start) + onlyNumbers + currentValue.slice(end);
    input.value = newValue;

    // Move cursor to after the inserted text
    const cursorPosition = start + onlyNumbers.length;
    input.setSelectionRange(cursorPosition, cursorPosition);

    // Trigger input event if needed (Angular binding)
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    nativeInputValueSetter?.call(input, newValue);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

}
