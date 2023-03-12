<template>
    <div>    
        <h1>{{ $t('Accounts list') }}
            <MyMenuInline :items="menuinline_items" :context="this"></MyMenuInline>
        </h1>
        <v-card outlined class="ma-4 pa-4">
            <v-checkbox v-model="showActive" :label="chkLabel" ></v-checkbox>
            <EasyDataTable dense :headers="accounts_headers" :items="accounts_items" sort-by="datetime" sort-type="asc" class="elevation-1 cursorpointer" hide-default-footer disable-pagination :loading="loading_accounts" :key="key" @click-row="viewItem">
                <template #item-last_datetime="item">
                    {{localtime(item.last_datetime)}}
                </template>             
                <template #item-banks="item">
                    <div v-html="getObjectPropertyByUrl('banks',item.banks,'localname')"></div>
                </template>     
                <template #item-balance_user="item">
                    <div class="right" v-html="localcurrency_html(item.balance_user)"></div>
                </template>     
                <template #item-balance_account="item">
                    <div class="right" v-html="currency_html(item.balance_account, item.currency )"></div>
                </template>                   
                <template #item-active="item">
                    <v-icon small v-if="item.active" >mdi-check-outline</v-icon>
                </template>         

                <template #item-actions="item">
                    <v-icon small class="mr-2" @click.stop="editItem(item)">mdi-pencil</v-icon>
                    <v-icon small @click.stop="deleteItem(item)" v-if="item.is_deletable">mdi-delete</v-icon>
                </template>             
                <template #body-append>
                    <tr class="totalrow pa-6">
                        <td>{{ $t("Total ({0} registers)", [accounts_items.length,]) }}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </template>              
                <!-- <template v-slot:[`body.append`]="{headers}">
                    <tr class="totalrow">
                        <td v-for="(header,i) in headers" :key="i">
                            <div v-if="header.value == 'localname'">
                                Total
                            </div>
                            <div v-if="header.value == 'balance_user'" class="d-flex justify-end" v-html="localcurrency_html(listobjects_sum(accounts_items,'balance_user'))">
                            </div>
                        </td>
                    </tr>
                </template> -->
            </EasyDataTable>
        </v-card>
        <v-dialog v-model="dialog" width="35%">
            <v-card class="pa-4">
                <AccountsCU :account="account" :deleting="account_deleting" :key="key" @cruded="on_AccountsCU_cruded()"></AccountsCU>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialog_view">
            <v-card class="pa-4">
                <AccountsView :account="account" :key="key" @cruded="on_AccountsView_cruded()"></AccountsView>
            </v-card>
        </v-dialog>
        <!-- ACCOUNTS OPERATIONS SEARCH -->
        <v-dialog v-model="dialog_search">
            <v-card class="pa-4">
                <AccountsoperationsSearch :key="key"  @cruded="on_AccountsoperationsSearch_cruded()"></AccountsoperationsSearch>
            </v-card>
        </v-dialog>

        <!-- DIALOG ACCOUNT TRANSFER -->
        <v-dialog v-model="dialog_transfer" width="35%">
            <v-card class="pa-6">
                <AccountsTransfer :at="at" @cruded="on_AccountTransfer_cruded()" :key="key"></AccountsTransfer>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
    import axios from 'axios'
    import MyMenuInline from './MyMenuInline.vue'
    import AccountsoperationsSearch from './AccountsoperationsSearch.vue'
    import AccountsCU from './AccountsCU.vue'
    import AccountsView from './AccountsView.vue'
    import AccountsTransfer from './AccountsTransfer.vue'
    import {empty_account,empty_account_transfer} from '../empty_objects.js'
    export default {
        name:"AccountsList",
        components:{
            MyMenuInline,
            AccountsCU,
            AccountsView,
            AccountsTransfer,
            AccountsoperationsSearch,
        },
        data(){ 
            return{
                showActive:true,
                chkLabel:"",
                accounts_headers: [
                    { text: this.$t('Name'), sortable: true, value: 'localname', width:"21%"},
                    { text: this.$t('Bank'), sortable: true, value: 'banks', width:"21%"},
                    { text: this.$t('Active'), value: 'active',  width: "8%"},
                    { text: this.$t('Currency'), value: 'currency',  width: "8%"},
                    { text: this.$t('Number'), value: 'number',  width: "10%", align:'end'},
                    { text: this.$t('Balance'), value: 'balance_account',  width: "12%", align:'end'},
                    { text: this.$t('Balance user currency'), value: 'balance_user', width: "12%", align:'end'},
                    { text: this.$t('Actions'), value: 'actions', sortable: false , width: "7%"},
                ],
                accounts_items:[],
                menuinline_items: [
                    {
                        subheader: this.$t("Account options"),
                        children: [
                            {
                                name: this.$t("Add a new account"),
                                icon: "mdi-pencil",
                                code: function(this_){
                                    this_.account=this_.empty_account()
                                    this_.account_deleting=false
                                    this_.dialog=true
                                },
                            },
                            { 
                                name:this.$t('Add an account transfer'), 
                                code: function(this_){
                                    this_.at=this_.empty_account_transfer()
                                    this_.key=this_.key+1
                                    this_.dialog_transfer=true
                                },
                                icon: "mdi-plus" 
                            },
                        ]
                    },
                    {
                        subheader: this.$t("Account operations options"),
                        children: [
                            {
                                name: this.$t("Search by string"),
                                icon: "mdi-magnify",
                                code: function(this_){
                                    this_.key=this_.key+1
                                    this_.dialog_search=true
                                },
                            },
                        ]
                    },
                ],
                dialog:false,
                form_valid: false,
                account: null,
                account_deleting: false,
                loading_accounts:false,

                dialog_view:false,
                key:0,

                // Accountsoperations search
                dialog_search:false,

                //AccountsTransfer
                at:null,
                dialog_transfer:false,
            }
        },
        watch:{
            showActive () {
                this.update_table()
            },
        },
        methods: {
            empty_account,
            empty_account_transfer,
            editItem (item) {
                this.account=item
                this.account_deleting=false
                this.key=this.key+1
                this.dialog=true
            },
            viewItem (item) {
                console.log(item)
                this.account=item
                this.key=this.key+1
                this.dialog_view=true
            },
            deleteItem (item) {
                this.account=item
                this.key=this.key+1
                this.account_deleting=true
                this.dialog=true
            },
            update_table(){
                if (this.showActive== true){
                    this.chkLabel=this.$t("Uncheck to see inactive accounts")
                } else {
                    this.chkLabel=this.$t("Check to see active accounts")
                }
                this.loading_accounts=true
                axios.get(`${this.store().apiroot}/api/accounts/withbalance/?active=${this.showActive}`, this.myheaders())
                .then((response) => {
                    this.accounts_items=response.data
                    this.loading_accounts=false
                }, (error) => {
                    this.parseResponseError(error)
                });
            },
            on_AccountsoperationsSearch_cruded(){
                this.update_table()
            },
            on_AccountsCU_cruded(){
                this.dialog=false
                this.update_table()
            },
            on_AccountsView_cruded(){
                this.update_table()
            },
            on_AccountTransfer_cruded(){
                this.dialog_transfer=false
                this.update_table()
            },
        },
        mounted(){
            this.update_table()
        }
    }
</script>

