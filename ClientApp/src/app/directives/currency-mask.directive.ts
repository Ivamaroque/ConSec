import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
  selector: '[appCurrencyMask]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CurrencyMaskDirective),
    multi: true
  }]
})
export class CurrencyMaskDirective implements ControlValueAccessor {
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    let value = event.target.value;
    
    // Remove tudo que não é número
    value = value.replace(/\D/g, '');
    
    if (value === '' || value === '0') {
      this.el.nativeElement.value = 'R$ 0,00';
      this.onChange(0);
      return;
    }

    // Converte para número (em centavos)
    const numericValue = parseInt(value, 10) / 100;
    
    // Formata como moeda brasileira
    const formatted = this.formatCurrency(numericValue);
    
    // Atualiza o input
    this.el.nativeElement.value = formatted;
    
    // Notifica o Angular Forms com o valor numérico
    this.onChange(numericValue);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
    
    // Garante formatação correta no blur
    let value = this.el.nativeElement.value.replace(/\D/g, '');
    
    if (value === '' || value === '0') {
      this.el.nativeElement.value = 'R$ 0,00';
      this.onChange(0);
      return;
    }

    const numericValue = parseInt(value, 10) / 100;
    
    if (!isNaN(numericValue)) {
      this.el.nativeElement.value = this.formatCurrency(numericValue);
      this.onChange(numericValue);
    }
  }

  writeValue(value: any): void {
    if (value !== null && value !== undefined && value !== 0) {
      this.el.nativeElement.value = this.formatCurrency(value);
    } else {
      this.el.nativeElement.value = 'R$ 0,00';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  private formatCurrency(value: number): string {
    return 'R$ ' + value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
