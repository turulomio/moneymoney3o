<template>
    <div>
    <v-btn @click="dialog = true"  prepend-icon="mdi-account">
        {{ $t("Log in") }}
    </v-btn>    
    <v-dialog v-model="dialog" max-width="600" persistent>
        <v-card  class="pa-6">
            <h1 class="mb-2">{{ $t("Enter your credentials") }}</h1>
            <v-form ref="form" v-model="form_valid" lazy-validation>
                <v-text-field v-model="user" :readonly="loading" type="text" :counter="75" :label="$t('User')" :placeholder="$t('Enter user')" autofocus :rules="RulesString(75,true)"/>
                <v-text-field v-model="password" :readonly="loading" type="password" :label="$t('Password')" :counter="75" :placeholder="$t('Enter password')" :rules="RulesString(75,true)"/>
            </v-form>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" :loading="loading" @click="login" :disabled="!form_valid">{{ $t("Log in") }}</v-btn>
                <v-btn color="error" :disabled="loading" @click="cancel">{{ $t("Cancel") }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    data () {
        return {
            user: "",
            password: "",
            dialog: false,         
            loading:false,       
            
            form_valid:false,
        }
    },
    methods: {
        login(){
            var start=new Date()
            if (this.$refs.form.validate()==false) return
            if (this.loading==true) return
            this.loading=true
            axios.post(`${this.store().apiroot}/login/`, {username: this.user, password:this.password}, this.myheaders_noauth())
            .then((response) => {
                if (this.parseResponse(response,this.store())==true){
                    console.log("Authenticated");
                    this.store().setToken(response.data)
                    this.store().updateAll()
                    .then(()=>{
                        this.$refs.form.reset()
                        this.loading=false
                        this.$router.push({name:'home'})
                        console.log(`Login and catalogs load took ${new Date()-start} ms`)
                        this.dialog=false

                    })
                } else { //Response=false 
                    setTimeout(() => { //Delay of 1 second
                        this.$refs.form.reset()
                        this.dialog=false
                        this.loading=false
                    }, 2000);
                }
            }, (error) => {
                this.parseResponseError(error,this.store())
            })
        },
        cancel(){
            this.$refs.form.reset()
            this.dialog = false
        }
    },
    mounted(){
        this.$router.push({name:'home'}) //On reload F5 browser always in home
    }
}
</script>