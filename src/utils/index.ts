import { v4 as uuid } from 'uuid'

export const getSid = (): string => {
   // 设置sid
   let sid: string | null = localStorage.getItem('sid')
   if(!sid){
       sid = uuid()
       localStorage.setItem('sid', sid as string)
   }
   return sid as string
}