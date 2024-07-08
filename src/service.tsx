import React from 'react';
import ReactDOM from 'react-dom';
import LoginComponent from './login'
import LoginManager from './managers/loginManager'
import LanguageManager from './managers/languageManager'
import { action, configure, makeObservable, observable, reaction } from '@comtstore/mobx';
import StorageCenter from '@comtstore/storage';
import { setAxiosBaseUrl, getAxiosBaseUrl, getDefualtAxiosBaseUrl } from './api/login'
import EventEmitter from '@comtstore/event-emitter';

configure({
  enforceActions: 'never'
})

class LoginService extends EventEmitter {
    public static instance: LoginService

    public static getInstance(): LoginService {
        if(!LoginService.instance){
          LoginService.instance = new LoginService()
        }
        return LoginService.instance
    }

    constructor(){
        super()
        makeObservable(this)
        reaction(() => this.isLogin, (newValue) => {
          this.emit(newValue ? 'login' : 'logout')
        })
        this.storageCenter = StorageCenter.getInstance()
        this.getLocalClientData()
        this.loginManager = LoginManager.getInstance()
        this.languageManager = LanguageManager.getInstance()
        this.loginManager.on('login-success', this.onLoginSuccess)
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

    /**
     * 当已登录时执行
     * @param cb
     */
    public exeIfLogin = (cb: () => void) => {
      if(this.isLogin){ cb() }
      this.on('login', cb)
    }

    /**
     * 当没有登录时执行
     * @param cb
     */
    public exeIfLogout = (cb: () => void) => {
      if(!this.isLogin){ cb() }
      this.on('logout', cb)
    }

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
      this.token = '' // 清除token
      this.userInfo = {} // 清除用户信息
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

    public setAxiosBaseUrl = setAxiosBaseUrl

    public getAxiosBaseUrl = getAxiosBaseUrl

    public getDefualtAxiosBaseUrl = getDefualtAxiosBaseUrl

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