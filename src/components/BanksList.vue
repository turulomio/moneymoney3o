
<template>
    <div>    
        <h1>{{ $t('Banks list') }}
            <MyMenuInline :items="menuinline_items" :context="this"></MyMenuInline>
        </h1>
        <v-card outlined class="ma-4 pa-4">
            <v-checkbox v-model="showActive" :label="chkLabel" />
            <EasyDataTable :headers="headers" :items="data" class="elevation-1 cursorpointer" :loading="loading_table" :sort-by="[{key:'localname', order: 'asc'}]" @click-row="viewItem" >
                <template #item-localname="item">
                    {{ item.localname }}
                </template>
                <template #item-active="item">
                    <v-icon small v-if="item.active" >mdi-check-outline</v-icon>
                </template>  
                <template #item-balance_accounts="item">
                    <div v-html="localcurrency_html(item.balance_accounts )"></div>
                </template>  
                <template #item-balance_investments="item">
                    <div v-html="localcurrency_html(item.balance_investments )"></div>
                </template>  
                <template #item-balance_total="item">
                    <div v-html="localcurrency_html(item.balance_total )"></div>
                </template>  
                <template #item-actions="item">
                    <v-icon small class="mr-2" @click.stop="editItem(item)">mdi-pencil</v-icon>
                    <v-icon small @click.stop="deleteItem(item)" v-if="item.is_deletable">mdi-delete</v-icon>
                </template>                            
                <template #body-append>
                    <tr class="totalrow pa-6">
                        <td>{{ $t("Total ([0] registers)", [data.length,]) }}</td>
                        <td></td>
                        <td v-html="localcurrency_html(listobjects_sum(data,'balance_accounts'))"></td>
                        <td v-html="localcurrency_html(listobjects_sum(data,'balance_investments'))"></td>
                        <td v-html="localcurrency_html(listobjects_sum(data,'balance_total'))"></td>
                        <td></td>
                    </tr>
                </template>
            </EasyDataTable>
        </v-card>
        <v-dialog v-model="dialog" width="35%">
            <v-card class="pa-4">
                <BanksCU :bank="bank" :mode="bank_mode" :key="key" @cruded="on_BanksCU_cruded"></BanksCU>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialog_view">
            <v-card class="pa-4">
                <BanksView :bank="bank" :key="key"></BanksView>
            </v-card>
        </v-dialog>

    </div>
</template>
<script>
    import axios from 'axios'
    import MyMenuInline from './MyMenuInline.vue'
    import BanksCU from './BanksCU.vue'
    import BanksView from './BanksView.vue'
    import {empty_bank} from '../empty_objects.js'
    export default {
        components:{
            MyMenuInline,
            BanksCU,
            BanksView,
        },
        data(){ 
            return{
                showActive:true,
                chkLabel:"",
                headers: [
                    { text: this.$t('Name'), sortable: true, value: 'localname'},
                    { text: this.$t('Active'), value: 'active',  width: "12%"},
                    { text: this.$t('Accounts balance'), value: 'balance_accounts', align:'end',  width: "12%"},
                    { text: this.$t('Investments balance'), value: 'balance_investments', align:'end',  width: "12%"},
                    { text: this.$t('Total balance'), value: 'balance_total', align:'end',  width: "12%"},
                    { text: this.$t('Actions'), value: 'actions', sortable: false , width: "7%"},
                ],
                data:[],
                menuinline_items: [
                    {
                        subheader: this.$t("Bank options"),
                        children: [
                            {
                                name:this.$t("Add a new bank"),
                                icon: "mdi-pencil",
                                code: function(this_){
                                    this_.editing=false
                                    this_.bank_mode="C"
                                    this_.bank=this_.empty_bank()
                                    this_.key=this_.key+1
                                    this_.dialog=true
                                },
                            },
                        ]
                    },
                ],
                dialog:false,
                bank: null,
                bank_mode:null,
                loading_table:false,

                dialog_view:false,
                key:0,
            }
        },
        watch:{
            showActive () {
                this.update_table()
            },
        },
        methods: {
            deleteItem (item) {
                this.bank=item
                this.bank_mode="D"
                this.key=this.key+1
                this.dialog=true
            },
            empty_bank,
            editItem (item) {
                this.bank=item
                this.bank_mode="U"
                this.key=this.key+1
                this.dialog=true
            },
            viewItem (item) {
                this.bank=item
                this.key=this.key+1
                this.dialog_view=true
            },

            update_table(){
                this.loading_table=true
                if (this.showActive){
                    this.chkLabel=this.$t("Uncheck to see inactive banks")
                } else {
                    this.chkLabel=this.$t("Check to see active banks")
                }
                axios.get(`${this.store().apiroot}/api/banks/withbalance/?active=${this.showActive}`, this.myheaders())
                .then((response) => {
                    this.data=response.data
                    this.loading_table=false
                }, (error) => {
                    this.parseResponseError(error)
                });
            },
            on_BanksCU_cruded(){
                this.dialog=false
                this.update_table()
            },

        },
        mounted(){
            this.update_table()
        }
    }
</script>

