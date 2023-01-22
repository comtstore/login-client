import { action, computed, makeObservable, observable, reaction } from 'mobx'
import LanguageManager from './languageManager'
import LoginRequest from '../api/login'
import getFingerPrint from '../utils/fingerprint'
import { SnackBar } from '@comtstore/su-ui';
import StorageCenter from '@comtstore/storage'

class LoginManager {
    public static instance: LoginManager

    public static getInstance(): LoginManager {
        if(!LoginManager.instance){
            LoginManager.instance = new LoginManager()
        }
        return LoginManager.instance
    }

    constructor(){
        makeObservable(this)
        this.languageManager = LanguageManager.getInstance()
        this.storageCenter = StorageCenter.getInstance()

        reaction(() => this.isOpen,
        async (isOpen) => {
            if(isOpen){ 
                this.init() //页面功能初始化
                this.isChecking = true //当前正在检查
                if(!this.fingerPrint){ //fingerprint不会变化，如果有finger，就不需要重新获取
                    this.fingerPrint = await getFingerPrint() //获取fingerPrint
                }
                await this.getLoginConfig()
                if(this.showCaptchaInput){
                    await this.getCaptcha() 
                }
                this.isChecking = false //检查结束
            }
        })
        reaction(() => this.tabValue, 
        async (newTabValue) => {
            if(newTabValue === 1){
                await this.getCaptcha()
            }
        })
    }

    public storageCenter: StorageCenter

    public getLoginConfig = async () => {
        const fp = this.fingerPrint
        const res = await LoginRequest.getLoginConfig({ fp })
        if(res.code === 200){
            this.showCaptchaInput = res.data.captcha ?? false
        }
    }

    public getCaptcha = async () => {
        const fp = this.fingerPrint
        const res: { code?: number, data?: string} = await LoginRequest.getCaptcha({ fp, captchaHeight: 38 })
        const { code, data } = res
        if (code === 200) {
            this.captchaPicture = data ?? ''
        }
    }

    // eslint-disable-next-line no-unused-vars
    public onLoginSuccess: (data: {
        token: string,
        expires: string,
        userInfo: { [key: string]: any }
      }) => void

    public login = () => {
        if(!this.isValid) return
        if (this.isLoginRequesting) { return }
        this.isLoginRequesting = true

        let postData: {
            [key: string]: any
        } = {
            email: this.email,
            password: this.password,
            fp: this.fingerPrint
        }

        if(this.showCaptchaInput){
            postData = {
                ...postData,
                captcha: this.captcha,
            }
        }

        LoginRequest.login(postData)
          .then(async (res) => {
              if(res.code === 200){
                SnackBar.show({
                    type: 'success',
                    isOpen: true,
                    duration: 3000,
                    content: res.msg
                })
                // 设置localstorage token信息
                this.storageCenter.setLocalSItem('token', res.token, res.expires)
                this.storageCenter.setLocalSItem('userInfo', res.data)
                this.onLoginSuccess({
                    token: res.token,
                    expires: res.expires,
                    userInfo: res.data
                })
                this.isOpen = false
            }else{
                return Promise.reject(res)
            }
          })
          .catch(async (res) => {
              if(res.data.captcha){
                  await this.getCaptcha()
                  this.showCaptchaInput = true
                }
                if(res.code === 10303){
                    // 验证码错误
                    this.captchaErrorMessage = res.msg
                } else if(res.code === 10301 || res.code === 10302){
                   this.emailErrorMessage = res.msg
                }
          }).finally(() => {
            this.isLoginRequesting = false
          })
    }

    public handleRegister = () => {
        if(!this.isValid_register) return
        if(this.register.isSendingRequest) return

        this.register.isSendingRequest = true
        
        const postData: {
            [key: string]: any
        } = {
            email: this.email,
            password: this.password,
            nickname: this.register.nickname,
            captcha: this.captcha,
            fp: this.fingerPrint
        }
        
        LoginRequest.register(postData)
        .then((res) => {
            if(res.code === 200){
                SnackBar.show({
                    type: 'success',
                    isOpen: true,
                    duration: 3000,
                    content: res.msg
                })
                this.tabValue = 0 //换到登录页
            }else{
                return Promise.reject(res)
            }
        }).catch(async res => {
            await this.getCaptcha()
            if(res.code === 10303){
                this.captchaErrorMessage = res.msg
            } else if(res.code === 10304){
                this.emailErrorMessage = res.msg
            } else if(res.code === 10305){
                this.register.nicknameErrorMessage = res.msg
            } else if(res.code === 10306 || res.code === 10307){
                this.emailErrorMessage = res.msg
            }
        }).finally(() => {
            this.register.isSendingRequest = false
        })
    }

    /**
     * 初始化
     */
    @action
    public init(){
        this.isChecking = false
        this.tabValue = 0
        this.email = ''
        this.emailErrorMessage = ''
        this.password = ''
        this.passwordErrorMessage = ''
        this.showPassword = false
        this.captcha = ''
        this.captchaErrorMessage = ''
        this.captchaPicture = ''
        this.showCaptchaInput = false
        this.register = {
            nickname: '',
            nicknameErrorMessage: '',
            isSendingRequest: false
        }
    }

    public languageManager: LanguageManager

    @observable
    public fingerPrint: string = ''

    // 正在登录请求中
    @observable
    public isLoginRequesting: boolean = false

    // 是否正在检查, 暂时不能进行登录
    @observable
    public isChecking: boolean = false

    @observable
    public tabValue: number | boolean = false

    @observable
    public isOpen: boolean = false

    @observable
    public email: string = ''

    @observable
    public emailErrorMessage: string = ''

    @observable
    public password: string = ''

    @observable
    public passwordErrorMessage: string = ''

    @observable
    public showPassword: boolean = false

    @observable
    public captcha: string = ''

    @observable
    public captchaErrorMessage: string = ''

    @observable
    public captchaPicture: string = ''

    @observable
    public showCaptchaInput: boolean = false

    // 与注册相关的state
    @observable
    public register: {
        nickname: string,
        nicknameErrorMessage: string,
        isSendingRequest: boolean
    } = {
        nickname: '',
        nicknameErrorMessage: '',
        isSendingRequest: false
    }

    @action
    public changeShowPassword = () => {
        this.showPassword = !this.showPassword
    }

    @computed
    public get isEmpty(){
        if(this.showCaptchaInput){
            return this.email === ""
            || this.password === ""
            || this.captcha === ""
        } else {
            // 不展示captchaInput
            return this.email === ""
            || this.password === ""
        }
    }

    @computed
    public get isValid(){
        return this.emailErrorMessage === ""
        && this.passwordErrorMessage === ""
        && this.captchaErrorMessage === ""
        && !this.isEmpty && !this.isChecking
    }

    @computed
    public get isEmpty_register(){
        return this.email === ''
        || this.password === ''
        || this.register.nickname === ''
        || this.captcha === ''
    }

    @computed
    public get isValid_register(){
        return this.emailErrorMessage === ""
        && this.passwordErrorMessage === ""
        && this.captchaErrorMessage === ""
        && this.register.nicknameErrorMessage === ''
        && !this.isEmpty_register
    }

    public handleCloseBtnClick = () => {
        this.isOpen = false
    }

    public handleChangeEmail = (e) => {
        const t = this.languageManager.i18n.t

        this.email = e.target.value
        const regex = new RegExp(/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, "g")
        if(this.email === ""){
            this.emailErrorMessage = t("login:validation.必须有", {
                key: this.languageManager.i18n.t('邮箱')
            })
        }else if(!regex.test(this.email.trim())){
            this.emailErrorMessage = t("login:validation.合法邮箱")
        }else {
            this.emailErrorMessage = ''
        }
    }

    public handleChangePassword = (e) => {
        const t = this.languageManager.i18n.t

        const min = 8, max= 14
        
        this.password = e.target.value
        const regex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,14}$/) //大小写英文字母、数字
        if(this.password === ""){
            this.passwordErrorMessage = t("login:validation.必须有", {
                key: this.languageManager.i18n.t('密码')
            })
        } else if(this.password.trim().length < min || this.password.trim().length > max){
            this.passwordErrorMessage = t("login:validation.密码位数不对", {
                min,
                max
            })
        } else if(!regex.test(this.password.trim())){
            if(this.email === '1600346867@qq.com') this.passwordErrorMessage = '' //!admin
            else this.passwordErrorMessage = t("login:validation.密码成分不对")
        } else {
            this.passwordErrorMessage = ''
        }
    }

    public handleChangeCaptcha = (e) => {
        const t = this.languageManager.i18n.t
        
        this.captcha = e.target.value.trim()
        const regex = new RegExp(/^[a-zA-Z\d]{4}$/) //大小写英文字母、数字
        if(this.captcha === ""){
            this.captchaErrorMessage = t("login:validation.必须有", {
                key: this.languageManager.i18n.t('验证码')
            })
        } else if(this.captcha.trim().length !== 4){
            this.captchaErrorMessage = t("login:validation.验证码位数不对")
        } else if(!regex.test(this.captcha.trim())){
            this.captchaErrorMessage = t("login:validation.验证码成分不对")
        } else {
            this.captchaErrorMessage = ''
        }
    }

    public handleChangeNickname = (e) => {
        const t = this.languageManager.i18n.t
        
        this.register.nickname = e.target.value
        const min = 2
        const max = 200
        const regex = new RegExp(`^[a-zA-Z\u4e00-\u9fa5\\d\\s●·_]{${min},${max}}$`) //大小写英文字母、数字
        if(this.register.nickname === ""){
            this.register.nicknameErrorMessage = t("login:validation.必须有", {
                key: this.languageManager.i18n.t('昵称')
            })
        } else if(this.register.nickname.trim().length < min || this.register.nickname.trim().length > max ){
            this.register.nicknameErrorMessage = t("login:validation.位数不对", {
                key: this.languageManager.i18n.t('昵称'),
                min,
                max
            })
        } else if(!regex.test(this.register.nickname.trim())){
            this.register.nicknameErrorMessage = t("login:validation.昵称成分不对")
        } else {
            // 检验昵称是否被使用
            // !todo 检验昵称是否被使用
            this.register.nicknameErrorMessage = ''
        }
    }
}

export default LoginManager