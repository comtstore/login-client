import FingerprintJS from '@fingerprintjs/fingerprintjs'

const getFingerPrint = async () => {
    if(localStorage.getItem('finger')){
        return localStorage.getItem('finger') ?? ''
    }
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    localStorage.setItem('finger', result.visitorId)
    return result.visitorId ?? ''
}

export default getFingerPrint
