<template>
    <div>
        <h1>{{ $t("Account details of '[0]'").format(account.localname) }}
        <MyMenuInline :items="items"  :context="this"></MyMenuInline>  </h1>
        <DisplayValues :items="displayvalues"></DisplayValues>

        <v-tabs v-model="tab" color="primary" grow>
            <v-tab key="ao">{{ $t("Account operations")}}</v-tab>
            <v-tab key="cc">{{ $t("Credit cards")}}</v-tab>
        </v-tabs>  
        <v-window v-model="tab">
            <v-window-item key="ao">     
                <v-card class="d-flex justify-center flex-column" outlined>
                    <MyMonthPicker v-model="ym" />
                    <TableAccountOperations ref="tao" showtotal showbalance :items="items_ao" :total_currency="account.currency" height="400" @cruded="on_TableAccountOperations_cruded()"></TableAccountOperations>
                </v-card>
            </v-window-item>
            <v-window-item key="cc">
                <v-card outlined>
                    <v-checkbox v-model="showActiveCC" :label="setCheckboxLabelCC()" @click="on_chkActive_cc()" ></v-checkbox>
                    <EasyDataTable dense :headers="table_cc_headers" :items="table_cc"  class="elevation-1 cursorpointer" disable-pagination  hide-default-footer sort-by="name" fixed-header max-height="400" :key="key" @click-row="viewCC">

                        <template #item-deferred="item">
                            <v-icon small v-if="item.deferred" >mdi-check-outline</v-icon>
                        </template>  

                        <template #item-maximumbalance="item">
                            <div v-html="currency_html(item.maximumbalance, item.account_currency )"></div>
                        </template>  

                        <template #item-balance="item">
                            <div v-html="currency_html(item.balance, item.account_currency )"></div>
                        </template>     

                        <template #item-actions="item">
                            <v-icon v-if="!item.deferred" small class="mr-2" @click="CCONotDeferred(item)">mdi-plus</v-icon>
                            <v-icon small class="mr-2" @click="editCC(item)">mdi-pencil</v-icon>
                            <v-icon small @click="deleteCC(item)" v-if="item.is_deletable">mdi-delete</v-icon>
                        </template>
                    </EasyDataTable>   
                </v-card>
            </v-window-item>
        </v-window>
        <!-- DIALOG ACCOUNTSOPERATIONS ADD/UPDATE -->
        <v-dialog v-model="dialog_ao" max-width="700">
            <v-card class="pa-8">
                <AccountsoperationsCU :ao="ao" :mode="ao_mode" :key="key" @cruded="on_AccountsoperationsCU_cruded"></AccountsoperationsCU>
            </v-card>
        </v-dialog>
        <!-- DIALOG CREDIT CARD ADD/UPDATE -->
        <v-dialog v-model="dialog_cc" max-width="550">
            <v-card class="pa-4">
                <CreditcardsCU :cc="cc" :mode="cc_mode" @cruded="on_CreditcardsCU_cruded()" :key="key" />
            </v-card>
        </v-dialog>

        <!-- DIALOG CREDIT CARD VIEW -->
        <v-dialog v-model="dialog_ccview">
            <v-card class="pa-4">
                <CreditcardsView :cc="cc" :account="account" @cruded="on_CreditcardsView_cruded()" :key="key"></CreditcardsView>
            </v-card>
        </v-dialog>

        <!-- DIALOG ACCOUNT TRANSFER -->
        <v-dialog v-model="dialog_transfer" width="550">
            <v-card class="pa-6">
                <AccountsTransfer :at="at" @cruded="on_AccountTransfer_cruded()" :key="key"></AccountsTransfer>
            </v-card>
        </v-dialog>

    </div>
</template>  
<script>     
    import axios from 'axios' 
    import AccountsoperationsCU from './AccountsoperationsCU.vue'
    import AccountsTransfer from './AccountsTransfer.vue'
    import DisplayValues from './DisplayValues.vue'
    import MyMenuInline from './MyMenuInline.vue'
    import MyMonthPicker from './MyMonthPicker.vue'
    import CreditcardsCU from './CreditcardsCU.vue'
    import CreditcardsView from './CreditcardsView.vue'
    import TableAccountOperations from './TableAccountOperations.vue'
    import {empty_account_operation,empty_credit_card,empty_account_transfer} from '../empty_objects.js'
    export default {
        name:"AccountsView",
        components:{
            AccountsoperationsCU,
            AccountsTransfer,
            MyMenuInline,
            DisplayValues,
            TableAccountOperations,
            CreditcardsCU,
            CreditcardsView,
            MyMonthPicker,
        },
        props:{
            account:{
                required:true,
            }
        },
        data () {
            return {
                displayvalues:[
                    {title:this.$t('Bank'), value: this.getObjectPropertyByUrl("banks",this.account.banks,"name")},
                    {title:this.$t('Number'), value: this.account.number},
                    {title:this.$t('Currency'), value: this.account.currency},
                    {title:this.$t('Active'), value: this.account.active},
                    {title:this.$t('Id'), value: this.account.id},
                ],
                ym: null,
                tab:0,
                key:0,
                items_ao: [],           
                items: [
                    { subheader:this.$t('Account orders'), children: [
                            { 
                                name:this.$t('Add an account transfer'), 
                                code: function(this_){
                                    this_.key=this_.key+1
                                    this_.at=this_.empty_account_transfer()
                                    this_.at.account_origin=this_.account.url
                                    this_.dialog_transfer=true
                                },
                                icon: "mdi-plus" 
                            },
                        ]
                    },
                    { subheader:this.$t('Account operations orders'), children: [
                            { 
                                name:this.$t('Add an account operation'), 
                                code: function(this_){
                                    this_.ao=this_.empty_account_operation()
                                    this_.ao_mode="C"
                                    this_.ao.accounts=this_.account.url
                                    this_.key=this_.key+1
                                    this_.ao_deleting=false
                                    this_.dialog_ao=true
                                },
                                icon: "mdi-plus" 
                            },

                        ]
                    },
                    { subheader:this.$t('Credit card orders'), children: [
                            { 
                                name:this.$t('Add a credit card'), 
                                code: function(this_){
                                    this_.cc=this_.empty_credit_card()
                                    this_.cc.accounts=this_.account.url
                                    this_.cc_mode="C"
                                    this_.key=this_.key+1
                                    this_.dialog_cc=true
                                },
                                icon: "mdi-plus" 
                            },
                        ]
                    },
                ],
                // DIALOG CREDIT CARDS
                table_cc_headers:[
                    { text: this.$t('Name'), value: 'name',sortable: true },
                    { text: this.$t('Number'), value: 'number',sortable: false},
                    { text: this.$t('Deferred'), value: 'deferred',sortable: false},
                    { text: this.$t('Maximum balance'), value: 'maximumbalance',sortable: false, align:'end'},
                    { text: this.$t('Balance'), value: 'balance',sortable: true ,align:'end'},
                    { text: this.$t('Actions'), value: 'actions', sortable: false },
                ],
                table_cc:[],
                showActiveCC:true,
                dialog_cc:false,
                cc: null,
                cc_mode: null,

                // DIALOG ACCOUNT TRANSFER
                at: null,

                // DIALOG CREDIT CARDS VIEW
                dialog_ccview:false,

                // DIALOG CREDIT CARDS VIEW
                dialog_transfer:false,

                // DIALOG ACCOUNT OPERATIONS
                dialog_ao:false,
                ao: null,
                ao_mode: null,
            }  
        },
        watch:{
            ym () {
                this.refreshTable()
            },
        },
        methods: {
            CCONotDeferred(item){
                this.ao=this.empty_account_operation()
                this.ao.accounts=this.account.url
                this.ao.comment=item.name + ". "
                this.key=this.key+1
                this.dialog_ao=true
            },
            empty_account_operation,
            empty_account_transfer,
            empty_credit_card,
            refreshTable(){
                this.console_log("refreshTable",this.account)
                axios.get(`${this.account.url}monthoperations/?year=${this.ym.year}&month=${this.ym.month}`, this.myheaders())                
                .then((response) => {
                    this.items_ao=response.data;
                    if (this.$refs.tao) this.$refs.tao.gotoLastRow()
                }) 
                .catch((error) => {
                    this.parseResponseError(error)
                });
            },
            refreshTableCC(){
                axios.get(`${this.store().apiroot}/api/creditcards/withbalance/?account=${this.account.id}&active=${this.showActiveCC}`, this.myheaders())                
                .then((response) => {
                    this.table_cc=response.data;
                }) 
                .catch((error) => {
                    this.parseResponseError(error)
                });
            },
          
            editCC(item){
                this.cc=item
                this.cc_mode="U"
                this.key=this.key+1
                this.dialog_cc=true
            },
            viewCC(item){
                if (item.deferred==false){
                    alert(this.$t("This is a debit credit card. Your operations are added to account directly"))
                    return
                }
                this.cc=item
                this.key=this.key+1
                this.dialog_ccview=true
            },
            deleteCC(item){
                this.cc=item
                this.cc_mode="D"
                this.key=this.key+1
                this.dialog_cc=true
            },
            on_AccountsoperationsCU_cruded(following){
                this.dialog_ao=following
                this.refreshTable()
                this.$emit('cruded')
            },
            on_CreditcardsCU_cruded(){
                this.dialog_cc=false
                this.refreshTableCC()
            },
            on_CreditcardsView_cruded(){
                this.refreshTable()//Due to payments, must refresh account operations
                this.refreshTableCC()
                this.$emit('cruded')
            },
            on_chkActive_cc(){
                this.refreshTableCC()
            },
            on_AccountTransfer_cruded(){
                this.dialog_transfer=false 
                this.refreshTable()    
                this.$emit('cruded')
            },
            on_TableAccountOperations_cruded(){
                this.refreshTable()
                this.$emit('cruded')
            },
            setCheckboxLabelCC(){
                if (this.showActiveCC == true){
                    return this.$t("Uncheck to see inactive credit cards")
                } else {
                    return this.$t("Check to see active credit cards")
                }
            },
        },
        mounted(){
            // this.refreshTable() Not needed due to a MyMonthPicker Input
            this.console_log("AccountsView", this.account)
            this.refreshTable()
            this.refreshTableCC()
            console.log(this.account.name)
        }
    }
</script>

