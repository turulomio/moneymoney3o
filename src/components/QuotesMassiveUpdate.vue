<template>
    <div class="pa-6">
        <h1>{{ $t("Quotes massive update of '[0]''").format(this.product.fullname)}}</h1>
        <v-card class="pa-5">
            <v-form  method="post">
                    <v-file-input 
                        name="csv_file1" 
                        accept="text/csv" 
                        show-size 
                        truncate-length="100"
                        v-model="filename" 
                        :label="$t('Select a file')"
                    ></v-file-input>
                    <v-card-actions class="justify-center">
                        <v-btn color="primary" @click="submmit()" :disabled="isButtonDisabled()">{{ $t("Send file")}}</v-btn>

                        <v-btn color="primary" @click="submmit_auto()">{{ $t("Auto update")}}</v-btn>
                    </v-card-actions>
            </v-form>
        </v-card>   

        <EasyDataTable dense :headers="headers" :items="items" sort-by="product" class="elevation-1 pt-6" hide-default-footer  disable-pagination :loading="loading"></EasyDataTable>
    </div>
</template>  
<script>     

    import axios from 'axios'
    export default {
        components:{
        },
        props:{
            product: {
                required: true
            },
        },
        data () {
            return {
                filename:[], //Must be an array 
                loading:false,
                items: [],
                headers: [
                    { text: this.$t('Code'), sortable: true, value: 'code'},
                    { text: this.$t('Product'), sortable: true, value: 'product'},
                    { text: this.$t('Log'), sortable: true, value: 'log'},
                ],
            }
        },
        methods: {
            submmit(){
                this.loading=true
                let data=new FormData()
                data.append('csv_file1', this.filename)
                data.append('product',this.product.url)
                data.append('type',1)
                axios.post(`${this.store().apiroot}/quotes/massive_update/`, data, this.myheaders_formdata())
                .then((response) => {
                        this.items=response.data.data
                        //this.filename=[]
                        this.loading=false
                }, (error) => {
                    this.parseResponseError(error)
                })
            },
            submmit_auto(){
                this.loading=true
                axios.post(`${this.store().apiroot}/quotes/massive_update/`, {auto:true,}, this.myheaders())
                .then((response) => {
                        this.items=response.data.data
                        this.loading=false
                }, (error) => {
                    this.parseResponseError(error)
                })
            },
            isButtonDisabled(){
                if (this.loading==true) return true
                if (this.filename=="") return true
                return false
            }

        }
        
    }
</script>

