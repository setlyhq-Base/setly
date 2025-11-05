import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyCompact',
  standalone: true
})
export class CurrencyCompactPipe implements PipeTransform {
  transform(value: number): string {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  }
}
