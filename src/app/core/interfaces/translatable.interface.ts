import { ILocale } from 'src/app/core/interfaces/locale.interface'

export interface ITranslatable {
    translations: {
        language: string | ILocale,
        projects?: string[],
        [key: string]: any,
    }[]
}
