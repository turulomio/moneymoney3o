<template>
    <v-card>   
        <v-select :items="payments" v-model="payment" :label="$t('Select an old payment')"  item-title="name" item-value="id" :rules="RulesSelection(true)"></v-select>  

        <TableCreditcardsOperations  showcc showtotal showbalance :items="items_cco" height="400" class=" flex-grow-1 flex-shrink-0" :key="key" />

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" @click="refundPayment()">{{ $t("Refund") }}</v-btn>
        </v-card-actions>
    </v-card>
</template>
<script>
    import axios from 'axios'
    import TableCreditcardsOperations from './TableCreditcardsOperations.vue'
    export default {
        components:{
            TableCreditcardsOperations,
        },
        props: {
            cc: {
                required: true
            },
        },
        data(){ 
            return{
                account:null,
                loading:false,

                key:0,

                items_cco:[],

                payments:[],
                payment: null,

            }
        },
        watch: {
            payment: function(){
                axios.get(`${this.store().apiroot}/api/creditcardsoperations/?accountsoperations_id=${this.payment}`, this.myheaders())
                .then((response) => {
                    this.items_cco=response.data
                }, (error) => {
                    this.parseResponseError(error)
                });
            },
        },
        methods: {
            refundPayment() {
                axios.post(`${this.store().apiroot}/api/accountsoperations/${this.payment}/ccpaymentrefund/`, {}, this.myheaders())
                .then(() => {
                    this.items_cco=[]
                    this.updatePayments()
                    this.$emit("cruded")
                    this.key=this.key+1
                    alert(this.$t("Payment was refund"))
                }, (error) => {
                    this.parseResponseError(error)
                });
            },
            updatePayments(){
                axios.get(`${this.cc.url}payments/`, this.myheaders())
                .then((response) => {
                    this.payments=[]
                    response.data.forEach(o=> {
                        this.payments.push({
                            id: o.accountsoperations_id,
                            name:this.$t("[0] were paid [1] ([2] operations)").format(this.localtime(o.datetime), this.currency_string(o.amount, this.account.currency), o.count),
                        })
                    });
                    this.loading=false
                }, (error) => {
                    this.parseResponseError(error)
                });

            },
        },
        created(){
            this.account=this.getObjectByUrl("accounts",this.cc.accounts)
            this.updatePayments()
        }
    }
</script>

