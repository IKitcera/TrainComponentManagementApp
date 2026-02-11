import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNonNegative]',
  standalone: true
})
export class NonNegativeDirective {
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Remove any minus signs
    if (value.includes('-')) {
      input.value = value.replace(/-/g, '');
      input.dispatchEvent(new Event('input'));
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Prevent typing minus sign
    if (event.key === '-' || event.key === 'Minus') {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text');
    if (pastedText && pastedText.includes('-')) {
      event.preventDefault();
      const cleanedText = pastedText.replace(/-/g, '');
      document.execCommand('insertText', false, cleanedText);
    }
  }
}
