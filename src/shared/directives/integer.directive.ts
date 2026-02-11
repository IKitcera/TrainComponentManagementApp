import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appInteger]',
  standalone: true
})
export class IntegerDirective {
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Remove any decimal points and characters after them
    if (value.includes('.') || value.includes(',')) {
      input.value = value.split(/[.,]/)[0];
      input.dispatchEvent(new Event('input'));
    }

    // Remove any non-digit characters except minus at the start
    const cleaned = value.replace(/[^\d-]/g, '');
    if (cleaned !== value) {
      input.value = cleaned;
      input.dispatchEvent(new Event('input'));
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    // Allow Ctrl/Cmd shortcuts
    if (event.ctrlKey || event.metaKey) {
      return;
    }

    // Allow allowed keys
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Prevent decimal point and comma
    if (event.key === '.' || event.key === ',' || event.key === 'Decimal') {
      event.preventDefault();
      return;
    }

    // Allow only digits
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text');
    if (pastedText) {
      // Check if pasted text contains decimal or non-numeric characters
      if (/[.,]/.test(pastedText) || !/^\d+$/.test(pastedText.replace(/-/g, ''))) {
        event.preventDefault();
        // Extract only integer part
        const integerValue = pastedText.split(/[.,]/)[0].replace(/[^\d]/g, '');
        if (integerValue) {
          const input = event.target as HTMLInputElement;
          const start = input.selectionStart || 0;
          const end = input.selectionEnd || 0;
          const currentValue = input.value;
          input.value = currentValue.substring(0, start) + integerValue + currentValue.substring(end);
          input.dispatchEvent(new Event('input'));
        }
      }
    }
  }
}
