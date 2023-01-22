import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import i18nMap from '../assets/i18n'

class LanguageManager {
    public static instance: LanguageManager

    public static getInstance(): LanguageManager {
        if(!LanguageManager.instance){
            LanguageManager.instance = new LanguageManager()
        }
        return LanguageManager.instance
    }

    constructor(){
        this.init()
    }

    public i18n

    public init(){
        const i18nInstance = i18n.createInstance() 
        i18nInstance.use(initReactI18next).init({
            resources: i18nMap,
            lng: 'zh_CN',
            fallbackLng: 'zh_CN',
            interpolation: {
                escapeValue: false
            }
        })
        this.i18n = i18nInstance
    }

    public changeLanguage(lan: string){
        this.i18n.changeLanguage(lan)
    }

    public setMainI18n(i18nInstance){
        i18nInstance.on('languageChanged', (lng: string) => {
          this.i18n.changeLanguage(lng)
        })
    }
}

export default LanguageManager