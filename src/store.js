import { defineStore } from 'pinia'
import axios from 'axios'
import { myheaders } from './my_commons'


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
        banks:[],
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
    },
    myheaders(){
        return {
            headers:{
                'Authorization': `Token ${this.token}`,
                //'Accept-Language': `${this.$i18n.locale}-${this.$i18n.locale}`,
                'Content-Type':'application/json'
            }
        }
    },
    updateBanks() {
      console.log(this.myheaders())
        var start=new Date()
        return axios.get(`${this.apiroot}/api/banks/`, this.myheaders())
        .then((response)=>{
          this.banks = response.data
          console.log(`Updated ${response.data.length} banks in ${new Date()-start} ms`)
        }, (error) => {
          console.log(error)
      });
    },
    updateAll(){
      return Promise.all([
        this.updateBanks()
      ])
    },
  }
})
