import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';

@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | number): string {
    if (!value) return '';
    const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
    return formatDistanceToNow(date, { addSuffix: true });
  }
}
