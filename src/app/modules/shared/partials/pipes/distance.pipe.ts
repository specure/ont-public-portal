import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'distance'
})
export class DistancePipe implements PipeTransform {

  transform(value: number): string {
    if (!value) {
      return ''
    }
    return `${value}km - `
  }

}
