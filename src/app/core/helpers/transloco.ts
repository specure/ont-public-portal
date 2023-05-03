import { TranslocoService } from '@ngneat/transloco'

export const getDefaultLang = (transloco: TranslocoService) => {
  const lang = transloco.getDefaultLang()
  if (lang === 'sr_ME-Latn') {
    return 'sr-Latn'
  }
  return lang
}
