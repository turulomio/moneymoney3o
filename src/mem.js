
// import { ref, provide, inject } from 'vue'
import { useStore } from './store.js'
import { getCurrentInstance } from 'vue';
// const createI18n = config => ({
//   locale: ref(config.locale),
//   messages: config.messages,
//   t(key) {
//     return this.messages[this.locale.value][key];
//   }
// });

// const i18nSymbol = Symbol();

// export function provideI18n(i18nConfig) {
//   const i18n = createI18n(i18nConfig);
//   provide(i18nSymbol, i18n);
// }

// export function useI18n() {
//   const i18n = inject(i18nSymbol);
//   if (!i18n) throw new Error("No i18n provided!!!");

//   return i18n;
// }

// export function t(s){
//     //const { t } = useI18n() // call `useI18n`, and spread `t` from  `useI18n` returning
//     //const { t} = useI18n() // call `useI18n`, and spread `t` from  `useI18n` returning
//     return t(s) // call `useI18n`, and spread `t` from  `useI18n` returning

// }

export function store(){
    return useStore()    
}

// export function locale(){
//     return locale1
// }
export function myheaders(){
    const store= useStore()    
    return {
        headers:{
            'Authorization': `Token ${store.token}`,
            'Accept-Language': `${store.locale}-${store.locale}`,
            'Content-Type':'application/json'
        }
    }
}

export function app(){
    return getCurrentInstance()
}

export function myheaders_noauth(){ 
    const store= useStore()        
    return {
        headers:{
            'Accept-Language': `${store.locale}-${store.locale}`,
            'Content-Type':'application/json'
        }
    }
}


// returns true if everything is ok
// return false if there is something wrong
export function parseResponse(response){
    if (response.status==200){ //Good connection
        if (response.data == "Wrong credentials"){
            store().token=null
            store().logged=false
            alert("Wrong credentials")
            return false
        }
        return true
    } else if (response.status==201){// Created
        
    } else if (response.status==204){// Deleted
    } else {
        alert (`${response.status}: ${response.data}`)
        return false
    }
}

export function parseResponseError(error){
    if (error.response) {
      // Request made and server responded
        console.log("made and responded")
//       console.log(error.response.data);
//       console.log(error.response.status);
//       console.log(error.response.headers);
        if (error.response.status == 401){
            alert (this.t("You aren't authorized to do this request"))
            store().token=null;
            store().logged=false;
            if (this.$router.currentRoute.name != "home") this.$router.push("home")
            console.log(error.response)
        } else if (error.response.status == 400){ // Used for developer or app errors
            alert (this.t("Something wrong with your request"))
            console.log(error.response)
        } else if (error.response.status == 500){
            alert (this.t("There is a server error"))
            console.log(error.response)
        }
        
    } else if (error.request) {
        console.log("The request was made but no response was received")
        alert ("Server couldn't answer this request")
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
        console.log("OTROS")
        console.log('Error', error.message);
    }
}