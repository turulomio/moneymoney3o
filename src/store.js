import { defineStore } from 'pinia'

export const useStore = defineStore('global', {
  state: () => {
    return { 
        token:null,
        logged:false,
        count:0,
        version: "0.0.1",
        versiondate: new Date(2023, 3, 5, 7, 5),
        apiroot: import.meta.env.VITE_DJANGO_MONEYMONEY_URL,
        publicPath: import.meta.env.VUE_APP_PUBLIC_PATH,
    }
  },
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
    increment() {
        this.count=this.count+1
    },
    setToken(token){
      this.token=token
      if (this.token){
        this.logged=true
      } else {
        this.logged=false
      }
    }
  },
})
