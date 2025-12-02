import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'distance',
    standalone: false
})
export class DistancePipe implements PipeTransform {

  transform(value: number): string {
    if (!value) {
      return ''
    }
    return `${value}km - `
  }

}
