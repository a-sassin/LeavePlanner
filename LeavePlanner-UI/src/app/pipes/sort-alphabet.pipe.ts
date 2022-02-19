import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'sortAlphabet',
})
export class SortAlphabetPipe implements PipeTransform {
  transform(value: Array<any>, ...args: any[]): any {
    return value.sort((a, b) => {
      const x = a.name.toLowerCase();
      const y = b.name.toLowerCase();
      if (x < y) {
        return -1;
      } else {
        return 1;
      }
    });
  }
}
