<template>
    <div>
        <h1>{{ $t("Wellcome to Money Money") }}</h1>
        <h2>{{ `${store().version} (${store().versiondate.toISOString().slice(0,10)})` }}</h2>
        <p>{{ ym  }}</p>
        <v-img :src="imgUrl" height="200px" contain ></v-img>
        <v-alert dense class="ma-15 px-10" outlined type="error" v-if="message.length>0"> {{message}}</v-alert>            

    </div>
</template>
<script>
    import axios from 'axios'
    import imgUrl from '@/assets/moneymoney.png'
    export default {
        components:{
        },
        data(){
            return {
                message:"",
                imgUrl:imgUrl,

                ym:null
            }
        },
        methods:{
            check_time(){
                axios.get(`${this.store().apiroot}/time/`, this.myheaders())
                .then((response) => {
                    let local=new Date()
                    let server= new Date(response.data)
                    let diff=local-server
                    console.log(`Local time: ${local.toISOString()}`)
                    console.log(`Server time: ${server.toISOString()}`)
                    console.log(`Difference (ms): ${diff}`)
                    if (diff>=Math.abs(1000)) this.message=this.$t("There is a time difference between the browser and the server of {0} ms. Please contact server administrator.").format(diff)
                }, (error) => {
                    this.parseResponseError(error)
                });

            }

        },
        created(){
            this.check_time()
            console.log(imgUrl)
        }
    }
</script>
