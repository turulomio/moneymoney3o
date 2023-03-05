<template>
    <v-btn @click="dialog = true" color="primary" >
        <v-icon icon="mdi-account"></v-icon>
        {{ t("Log in") }}
    </v-btn>    
    <v-dialog v-model="dialog" max-width="600" persistent>
        <v-card  class="pa-6">
            <h1 class="mb-2">{{ t("Enter your credentials") }}</h1>
            <v-form ref="form" v-model="form_valid" lazy-validation>
                <v-text-field v-model="user" :readonly="loading" type="text" :counter="75" :label="t('User')" :placeholder="t('Enter user')" autofocus :rules="RulesString(75,true)"/>
                <v-text-field v-model="password" :readonly="loading" type="password" :label="t('Password')" :counter="75" :placeholder="t('Enter password')" :rules="RulesString(75,true)"/>
            </v-form>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" :loading="loading" @click="login()" :disabled="!form_valid">{{ t("Log in") }}</v-btn>
                <v-btn color="error" :disabled="loading" @click="cancel()">{{ t("Cancel") }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
    import { useI18n } from 'vue-i18n'
    import {store,myheaders_noauth,parseResponse,parseResponseError} from '@/mem.js'
    import axios from 'axios'
    import { ref } from 'vue'
    import { RulesString } from '@/rules';
    const { t } = useI18n()

    var user = ref("")
    var password = ref("")
    var dialog = ref(false)
    var loading = ref(false)
    var form_valid = ref(false)
    
	const form = ref(null)

    function login(){
        var start=new Date()
        console.log(form)
        if (form.value.validate()==false) return
        if (loading==true) return
        loading=true
        axios.post(`${store().apiroot}/login/`, {username: user.value, password:password.value}, myheaders_noauth())
        .then((response) => {
            if (parseResponse(response,store())==true){
                console.log("Authenticated");
                store().setToken(response.data)
                store().updateAll()
                .then(()=>{
                    console.log("AHORA")
                    console.log(store().banks[0].url)
                    form.value.reset()
                    loading=false
                    //if ($router.history.current.name !== 'home' ) $router.push({name:'home'})
                    console.log(`Login and catalogs load took ${new Date()-start} ms`)
                    dialog=false
                    console.log(dialog)

                })
            } else { //Response=false 
                setTimeout(() => { //Delay of 1 second
                    form.value.reset()
                    dialog=false
                    loading=false
                }, 2000);
            }
        }, (error) => {
            parseResponseError(error,store())
        })
    }
    function cancel(){
        $refs.form.reset()
        dialog = false
    }
</script>