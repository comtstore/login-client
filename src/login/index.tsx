import React from 'react'
import LoginManager from '../managers/loginManager'
import { useObserver } from 'mobx-react';
import Dialog from '@mui/material/Dialog';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Zoom from '@mui/material/Zoom';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { TransitionProps } from '@mui/material/transitions';
import { useTranslation } from 'react-i18next';
import LanguageManager from '../managers/languageManager';
import InputAdornment from '@mui/material/InputAdornment';
import Input from '@mui/material/Input';
import EmailIcon from '@mui/icons-material/Email';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PinIcon from '@mui/icons-material/Pin';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@comtstore/su-ui';
import './index.scss'

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Zoom ref={ref} {...props} />;
});

function Login(){
    const languageManager: LanguageManager = LanguageManager.getInstance()
    const loginManager: LoginManager = LoginManager.getInstance()

    const { t } = useTranslation('login', { i18n: languageManager.i18n })

    const onTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        loginManager.tabValue = newValue
    }

    const renderBase = (showCaptchaInput: boolean, insertList: Array<JSX.Element | null> = []): JSX.Element => {
        return (<React.Fragment>
                    <Box className='su-login-item'>
                        <InputAdornment position="start" className='su-icon'>
                            <EmailIcon />
                        </InputAdornment>
                        <TextField
                            fullWidth
                            error={loginManager.emailErrorMessage !== ''}
                            value={loginManager.email}
                            helperText={loginManager.emailErrorMessage}
                            variant="standard"
                            label={t('邮箱')}
                            onChange={loginManager.handleChangeEmail}
                            onBlur={loginManager.handleChangeEmail}
                        />
                    </Box>
                    { insertList.length >= 1 && insertList[0] }
                    <Box className='su-login-item'>
                        <InputAdornment position="start" className='su-icon'>
                            <VpnKeyIcon />
                        </InputAdornment>
                        <FormControl variant="standard" fullWidth>
                            <InputLabel error={loginManager.passwordErrorMessage !== ''}  htmlFor="outlined-adornment-password">{t('密码')}</InputLabel>
                            <Input
                                autoComplete='true'
                                error={loginManager.passwordErrorMessage !== ''} 
                                id="outlined-adornment-password"
                                type={loginManager.showPassword ? 'text' : 'password'}
                                value={loginManager.password}
                                onChange={loginManager.handleChangePassword}
                                endAdornment={
                                <InputAdornment position="end" style={{
                                    paddingRight: '10px'
                                }}>
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={loginManager.changeShowPassword}
                                        onMouseDown={loginManager.changeShowPassword}
                                        edge="end"
                                    >
                                    {loginManager.showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                                }
                            />
                            <FormHelperText error>{loginManager.passwordErrorMessage}</FormHelperText>
                        </FormControl>
                    </Box>
                    { insertList.length >= 2 && insertList[1] }
                    { showCaptchaInput? (
                        <Box className='su-login-item'>
                            <InputAdornment position="start" className='su-icon'>
                                <PinIcon />
                            </InputAdornment>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel error={loginManager.captchaErrorMessage !== ''}  htmlFor="outlined-adornment-captcha">{t('验证码')}</InputLabel>
                                <Input
                                    error={loginManager.captchaErrorMessage !== ''} 
                                    id="outlined-adornment-captcha"
                                    value={loginManager.captcha}
                                    onChange={loginManager.handleChangeCaptcha}
                                    onBlur={loginManager.handleChangeCaptcha}
                                    endAdornment={
                                        <div className="su-captcha-picture" onClick={loginManager.getCaptcha} dangerouslySetInnerHTML={{
                                            __html: loginManager.captchaPicture
                                        }}>
                                        </div>
                                    }
                                />
                                <FormHelperText error>{loginManager.captchaErrorMessage}</FormHelperText>
                                </FormControl>
                        </Box>
                    ): null }
                     { insertList.length >= 3 && insertList[2] }
            </React.Fragment>
        )
    }

    const renderLogin = (): JSX.Element => {
        return (
            <Box
                component="div"
                className="su-login-form"
            >
                { renderBase(loginManager.showCaptchaInput) }

                <Box className='su-login-button-group'>
                    <Button
                        width='100px'
                        height='30px'
                        disabled={!loginManager.isValid}
                        onClick={loginManager.login}
                    >
                      { t('登录') }
                    </Button>
                    <Button
                        type="text"
                        height='30px'
                    >
                      { t('忘记密码?') }
                    </Button>
                </Box>
            </Box>
        )
    }
    
    const renderRegister = (): JSX.Element => {
        const nickNameEle = (
            <Box className='su-login-item' key="nickname">
                <InputAdornment position="start" className='su-icon'>
                    <EmailIcon />
                </InputAdornment>
                <TextField
                    fullWidth
                    error={loginManager.register.nicknameErrorMessage !== ''}
                    value={loginManager.register.nickname}
                    helperText={loginManager.register.nicknameErrorMessage}
                    variant="standard"
                    label={t('昵称')}
                    onChange={loginManager.handleChangeNickname}
                    onBlur={loginManager.handleChangeNickname}
                />
            </Box>
        )

        return (
            <Box
                component="div"
                className="su-login-form"
            >
                { renderBase(true, [
                    null,
                    nickNameEle
                ]) }
                <Box className='su-login-button-group'>
                    <Button
                        width='100px'
                        height='30px'
                        disabled={!loginManager.isValid_register}
                        onClick={loginManager.handleRegister}
                    >
                      { t('创建新账号') }
                    </Button>
                </Box>
            </Box>
        )
    }

    const renderCloseBtn = (): JSX.Element => {
        return (
            <div className='su-login-close-button'>
                 <Button
                    type='icon'    
                    height='25px'
                    width='25px'
                    onClick={ loginManager.handleCloseBtnClick }
                >
                    <CloseIcon
                       sx={{ fontSize: 20 }}
                       className='su-login-close-button-icon'
                    />
                </Button>
            </div>
        )
    }

    return useObserver(() => (
        <Dialog 
            open={loginManager.isOpen}
            TransitionComponent={Transition}
            hideBackdrop
        >
            <div className='su-login-card'>
                <Box sx={{ width: '100%' }}>
                    <Box className="su-login-tabs">
                        <Tabs
                            value={ loginManager.tabValue }
                            onChange={onTabChange}
                            aria-label="log in or register"
                            centered
                        >
                            {
                                ['登录', '注册'].map((label, index) => (
                                    <Tab
                                        key={index}
                                        value={index}
                                        classes={{ selected: "su-login-tab-selected" }}
                                        label={t(label)}
                                    />
                                ))
                            }
                        </Tabs>
                    </Box>
                    { loginManager.tabValue === 0 ? renderLogin() : null }
                    { loginManager.tabValue === 1 ? renderRegister() : null }
                </Box>
                { renderCloseBtn() }
            </div>
        </Dialog>
     ))
}

export default Login