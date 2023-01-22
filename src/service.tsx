import React from 'react';
import ReactDOM from 'react-dom';
import LoginComponent from './login'
import LoginManager from './managers/loginManager'
import LanguageManager from './managers/languageManager'
import { action, configure, makeObservable, observable } from 'mobx';
import StorageCenter from '@comtstore/storage';

configure({
  enforceActions: 'never'
})

class LoginService {
    public static instance: LoginService

    public static getInstance(): LoginService {
        if(!LoginService.instance){
          LoginService.instance = new LoginService()
        }
        return LoginService.instance
    }

    constructor(){
        makeObservable(this)
        this.storageCenter = StorageCenter.getInstance()
        this.getLocalClientData()
        this.loginManager = LoginManager.getInstance()
        this.languageManager = LanguageManager.getInstance()
        this.loginManager.onLoginSuccess = this.onLoginSuccess
    }

    private loginManager: LoginManager

    private languageManager: LanguageManager

    private storageCenter: StorageCenter
    
    public isLoaded: boolean = false

    private isLoading: boolean = false
    
    public changeLanguage(lan: string){
        this.languageManager.changeLanguage(lan)
    }

    @observable
    public isLogin: boolean = false

    @observable
    public userInfo: { [key: string] : any } = {}

    @observable
    public token: string

    @action
    public onLoginSuccess = (data: {
      token: string,
      userInfo: { [key: string]: any }
    }) => {
      this.isLogin = true
      this.token = data.token
      this.userInfo = data.userInfo
    }

    public logout = () => {
      this.isLogin = false
      this.storageCenter.clearLocalSItem('token')
      this.storageCenter.clearLocalSItem('userInfo')
    }

    @action
    public getLocalClientData = () => {
      const token = this.storageCenter.getLocalSItem('token')
      if(token !== null){
          this.isLogin = true
          this.token = token
          this.userInfo = this.storageCenter.getLocalSItem('userInfo')
      }else{
          this.isLogin = false
      }
    }

    /**
     * 设置监听对象
     * @param i18nInstance 要监听的父i18n
     */
    public setMainI18n(i18nInstance){
       this.languageManager.setMainI18n(i18nInstance)
    }

    /**
     * 挂载实例
     * @param id 要挂载的元素
     */
    private load(id: string, cb){
        if(this.isLoaded) return
        if(this.isLoading) return
        this.isLoading = true
        const loginRoot = document.getElementById(id) as HTMLElement
        ReactDOM.render(
          <React.StrictMode>
            <LoginComponent />
          </React.StrictMode>,
          loginRoot,
          () => {
            this.isLoaded = true
            this.isLoading = false
            console.log('[login] boot up login service!')
            cb()
          }
        );
    }

    /**
     * 显示窗口
     */
    @action
    public show(tab?: number){
      const modifier = () => {
        this.loginManager.isOpen = true
        this.loginManager.tabValue = tab ?? 0
      }
      if (this.isLoaded) {
        modifier()
      }else {
        this.load('login-root', modifier)
      }
    }

    /**
     * 关闭窗口
     */
    public hide(){
      this.loginManager.isOpen = false
  }
}

export default LoginService