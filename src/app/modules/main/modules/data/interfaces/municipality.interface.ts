import { IImage } from 'src/app/core/interfaces/image.interface'
import { IMainPage } from '../../../interfaces/main-page.interface'
import { ICounty } from './county.interface'

export interface IMunicipality extends IMainPage {
  banner: IImage
  coat_of_arms: IImage
  code: string
  county: ICounty
  is_most_populated: boolean
  map_view: IImage
  order: number
  website?: string
}
