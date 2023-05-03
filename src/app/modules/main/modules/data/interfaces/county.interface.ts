import { ITranslatable } from 'src/app/core/interfaces/translatable.interface'

export interface ICounty extends ITranslatable {
    id: string
    name: string
    order: number
    website?: string
}
