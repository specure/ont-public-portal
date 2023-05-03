import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  private initColors = ['#F5A623', '#6990E8', '#50E3C2', '#F8E71C', '#B8E986', '#BD10E0', '#FA0D4D', '#AA0705', '#7EBC04']
  private graphColors = [...this.initColors]

  constructor() { }

  getColor() {
    return this.graphColors.length ? this.graphColors.shift() : this.getRandomColor(this.initColors)
  }

  private getRandomColor(colorArray: string[]) {
    return colorArray[Math.floor(Math.random() * colorArray.length)]
  }
}
