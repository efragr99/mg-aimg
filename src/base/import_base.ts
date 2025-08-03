import base_es from '../data/base_medicina_germanica_es.json'
import base_en from '../data/base_medicina_germanica_en.json'

const bases: Record<string, any[]> = {
    es: base_es,
    en: base_en,
}


export default function import_base(lang: string): any[] {
  return bases[lang] || bases['es']
}