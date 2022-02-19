import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(value: any, searchTerm: any): any {
    if (!value.length) {
      return value;
    }
    return value.filter((search) => {
      return search.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }
}
