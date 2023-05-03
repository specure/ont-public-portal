import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'
import { ILocale } from './locale.interface'

export interface IUITranslation {
    key: string,
    language: ILocale,
    project?: IMainProject,
    value: string
}
