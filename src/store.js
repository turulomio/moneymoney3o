import { defineStore } from 'pinia'
import axios from 'axios'
import { myheaders, sortObjectsArray, my_round,capitalizeFirstLetter} from './my_commons.js'
import CurrencyList from 'currency-list'

import countries from 'flag-icons/country.json'

export const useStore = defineStore('global', {
  state: () => {
    return { 
        token:null,
        logged:false,
        count:0,
        version: "0.0.1",
        versiondate: new Date(2023, 2, 5, 7, 5),
        apiroot: import.meta.env.VITE_DJANGO_MONEYMONEY_URL,
        publicPath: import.meta.env.VUE_APP_PUBLIC_PATH,
        catalog_manager: false,
        accounts: [],
        banks: [],
        creditcards:[],
        concepts:[],
        countries:countries,
        currencies: [],
        investments: [],
        leverages: [],
        operationstypes: [],
        products: [],
        productstypes: [],
        profile: null,
        stockmarkets:[],
        strategiestypes:[],
        recomendation_methods:[],
    }
  },

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
    updateAccounts() {
        var start=new Date()
        return axios.get(`${this.apiroot}/api/accounts/`, myheaders())
        .then((response)=>{
          this.accounts = response.data
          console.log(`Updated ${response.data.length} accounts in ${new Date()-start} ms`)
        }, (error) => {
          console.log(error)
      });
    },
    updateBanks() {
        var start=new Date()
        return axios.get(`${this.apiroot}/api/banks/`, myheaders())
        .then((response)=>{
          this.banks = response.data
          console.log(`Updated ${response.data.length} banks in ${new Date()-start} ms`)
        }, (error) => {
          console.log(error)
      });
    },

    updateCatalogManager(){
      var start=new Date()
      return axios.get(`${this.apiroot}/catalog_manager/`, myheaders())
      .then((response) => {
          this.catalog_manager=response.data
          console.log(`Updated catalog manager in ${new Date()-start} ms`)
      }, (error) => {
          store.$app.parseResponseError(error)
      });
    },
    updateCreditCards() {
        var start=new Date()
        return axios.get(`${this.apiroot}/api/creditcards/`, myheaders())
        .then((response)=>{
          this.creditcards = response.data
          console.log(`Updated ${response.data.length} credit cards in ${new Date()-start} ms`)
        }, (error) => {
          console.log(error)
      });
    },
    updateCurrencies(){
        var start=new Date()
        var locale="en_US"
        console.log("Missing locale in currencies")
        // console.log(this)
        // if (this.$i18n.locale=='es'){
        //     locale="es_ES"
        // }
        // CurrencyList falló en versión 1.0.7 y se arreglo en 1.0.8
        var currencies_object=CurrencyList.getAll(locale)
        var currencies_list=[]
        Object.entries(currencies_object).forEach(o => currencies_list.push(o[1]))
        currencies_list.forEach(o=> o["fullname"]=`${capitalizeFirstLetter(o.name)} (${o.code} - ${o.symbol})`)
        this.currencies=currencies_list
        console.log(`Updated ${currencies_list.length} currencies in ${new Date()-start} ms`)
    },
    updateInvestments() {
        var start=new Date()
        return axios.get(`${this.apiroot}/api/investments/`, myheaders())
        .then((response)=>{
          this.investments = response.data
          console.log(`Updated ${response.data.length} investments in ${new Date()-start} ms`)
        }, (error) => {
          console.log(error)
      });
    },
    updateLeverages() {
        var start=new Date()
        return axios.get(`${this.apiroot}/api/leverages/`, myheaders())
        .then((response)=>{
          this.leverages = response.data
          console.log(`Updated ${response.data.length} leverages in ${new Date()-start} ms`)
        }, (error) => {
          console.log(error)
      });
    },
    updateConcepts() {
        var start=new Date()
        return axios.get(`${this.apiroot}/api/concepts/`, myheaders())
        .then((response)=>{
          this.concepts = response.data
          console.log(`Updated ${response.data.length} concepts in ${new Date()-start} ms`)
        }, (error) => {
          console.log(error)
      });
    },
    updateOperationstypes() {
        var start=new Date()
        return axios.get(`${this.apiroot}/api/operationstypes/`, myheaders())
        .then((response)=>{
          this.operationstypes = response.data
          console.log(`Updated ${response.data.length} operations types in ${new Date()-start} ms`)
        }, (error) => {
          console.log(error)
      });
    },
    updateProducts() {
        var start=new Date()
        return axios.get(`${this.apiroot}/api/products/`, myheaders())
        .then((response)=>{
          this.products = response.data
          console.log(`Updated ${response.data.length} products in ${new Date()-start} ms`)
        }, (error) => {
          console.log(error)
      });
    },
    updateProductstypes() {
        var start=new Date()
        return axios.get(`${this.apiroot}/api/productstypes/`, myheaders())
        .then((response)=>{
          this.productstypes = response.data
          console.log(`Updated ${response.data.length} products types in ${new Date()-start} ms`)
        }, (error) => {
          console.log(error)
      });
    },
    updateRecomendationsMethos() {
        var start=new Date()
        return axios.get(`${this.apiroot}/recomendationmethods/`, myheaders())
        .then((response)=>{
          this.recomendation_methods = response.data
          console.log(`Updated ${response.data.length} recomendation methods in ${new Date()-start} ms`)
        }, (error) => {
          console.log(error)
      });
    },
    updateProfile() {
        var start=new Date()
        return axios.get(`${this.apiroot}/profile/`, myheaders())
        .then((response)=>{
          this.profile = response.data
          console.log(`Updated ${response.data.length} profile in ${new Date()-start} ms`)
        }, (error) => {
          console.log(error)
      });
    },
    updateStockmarkets() {
        var start=new Date()
        return axios.get(`${this.apiroot}/api/stockmarkets/`, myheaders())
        .then((response)=>{
          this.stockmarkets = response.data
          console.log(`Updated ${response.data.length} stock markets in ${new Date()-start} ms`)
        }, (error) => {
          console.log(error)
      });
    },
    updateStrategiestypes() {
        var start=new Date()
        console.log("Strategies types missing translation")
        this.strategiestypes=[
            {id:1, name: "Pairs in same account"},
            {id:2, name: "Product ranges"},
            {id:3, name: "Generic"},
        ]
        console.log(`Updated ${this.strategiestypes.length} strategies types in ${new Date()-start} ms`)
    },
    updateAll(){
      return Promise.all([
        this.updateAccounts(),
        this.updateBanks(),
        this.updateCatalogManager(),
        this.updateCreditCards(),
        this.updateCurrencies(),
        this.updateInvestments(),
        this.updateLeverages(),
        this.updateConcepts(),
        this.updateOperationstypes(),
        this.updateProducts(),
        this.updateProductstypes(),
        this.updateRecomendationsMethos(),
        this.updateProfile(),
        this.updateStockmarkets(),
        this.updateStrategiestypes(),
      ])
    },
  }
})
