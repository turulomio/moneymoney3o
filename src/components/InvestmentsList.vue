<template>
    <div>    
        <h1>{{ $t('Investments list') }}
            <MyMenuInline :items="menuinline_items" :context="this"></MyMenuInline>
        </h1>
            <v-row class="pa-4">
                <v-checkbox class="ml-6 mr-10" v-model="showActive" :label="setCheckboxLabel()" />
                <v-text-field class="ml-10 mr-6" v-model="search" append-icon="mdi-magnify" :label="$t('Filter')" single-line hide-details :placeholder="$t('Add a string to filter table')"></v-text-field>

                <v-btn color="primary" class="mr-4" @click="products_autoupdate()" :loading="products_updating">{{ $t("Products autoupdate")}}
                    <v-badge inline v-show="update_errors>0" color="error" class="ml-2" :content="$t('{0} errors').format(update_errors)"/>
                </v-btn>
                
            </v-row>
            <v-data-table dense fixed-footer items-per-page="100" :headers="investments_headers" :search="search" :items="investments_items" :sort-by="table_sort_by()" class="elevation-1 ma-4 cursorpointer" hide-default-footer disable-pagination :loading="loading_investments" fixed-header :key="key" @click:row="viewItem">
                <template v-slot:[`item.fullname`]="{ item }">
                    <v-icon :class="'mr-2 fi fib fi-'+item.raw.flag" small :title="this.getCountryNameByCode(item.raw.flag)"></v-icon>{{item.raw.fullname}}
                </template>                  
                <template v-slot:[`item.last_datetime`]="{ item }">
                    <div v-html="(item.raw.last_datetime) ? localtime(item.raw.last_datetime) : $t('Update product quotes')" :class="(item.raw.last_datetime) ? '' : 'boldred'"></div>
                </template>  
                <template v-slot:[`item.last`]="{ item }">
                    <div v-html="currency_html(item.raw.last,item.raw.currency )"></div>
                </template>   
                <template v-slot:[`item.balance_user`]="{ item }">
                    <div v-html="localcurrency_html(item.raw.balance_user )"></div>
                </template>     
                <template v-slot:[`item.invested_user`]="{ item }">
                    <v-row class="text-nowrap" justify="end">
                        <div v-html="localcurrency_html(item.raw.invested_user )"></div>
                        <v-icon small class="ml-1" v-if="item.raw.shares>=0" color="blue" :title="$t('Long position')">mdi-arrow-up-circle-outline</v-icon>
                        <v-icon small class="ml-1" v-if="item.raw.shares<0" color="orange" :title="$t('Short position')">mdi-arrow-down-circle-outline</v-icon>
                    </v-row>
                </template>    
                <template v-slot:[`item.gains_user`]="{ item }">
                    <div v-html="localcurrency_html(item.raw.gains_user )"></div>
                </template>     
                <template v-slot:[`item.daily_difference`]="{ item }">
                    <div v-html="localcurrency_html(item.raw.daily_difference )"></div>
                </template>   
                <template v-slot:[`item.daily_percentage`]="{ item }">
                    <div v-html="percentage_html(item.raw.daily_percentage )"></div>
                </template>  
                <template v-slot:[`item.percentage_invested`]="{ item }">
                    <div v-html="percentage_html(item.raw.percentage_invested )"></div>
                </template>  
                <template v-slot:[`item.percentage_selling_point`]="{ item }">  
                    <v-tooltip left :text="tooltip_selling_percentage(item.raw)">
                        <template v-slot:activator="{ props }">
                            <div v-bind="props" :class="item.raw.percentage_selling_point<0.05 ? 'boldgreen' : ''" v-html="percentage_html(item.raw.percentage_selling_point)"></div>
                        </template>
                    </v-tooltip>   
                </template>              
                <template v-slot:[`item.actions`]="{ item }">
                    <v-icon small class="ml-1" @click.stop="addQuote(item.raw)">mdi-plus</v-icon>
                    <v-icon small class="ml-1" @click.stop="editItem(item.raw)">mdi-pencil</v-icon>
                    <v-icon small class="ml-1" @click.stop="deleteItem(item.raw)" v-if="item.raw.is_deletable">mdi-delete</v-icon>
                    <v-icon small class="ml-1" v-if="(new Date().setHours(0,0,0,0)>new Date(item.raw.selling_expiration).setHours(0,0,0,0)) && item.raw.selling_expiration!=null" @click="changeSellingPrice(item.raw)" color="#9933ff" style="font-weight:bold">mdi-alarm</v-icon>     
                </template>         
                <template v-slot:[`tbody`]>
                    <tr class="totalrow pa-6">
                        <td>{{ $t("Total ({0}):", [investments_items.length])}}</td>
                        <td></td>
                        <td></td>
                        <td class="right" v-html="localcurrency_html(listobjects_sum(investments_items,'daily_difference'))"></td>
                        <td class="right" v-html="percentage_html(listobjects_sum(investments_items,'daily_difference')/listobjects_sum(investments_items,'balance_user'))"></td>
                        <td class="right" v-html="localcurrency_html(listobjects_sum(investments_items,'invested_user'))"></td>
                        <td class="right" v-html="localcurrency_html(listobjects_sum(investments_items,'gains_user'))"></td>
                        <td class="right" v-html="localcurrency_html(listobjects_sum(investments_items,'balance_user'))"></td>
                        <td class="right" v-html="percentage_html(listobjects_sum(investments_items,'gains_user')/listobjects_sum(investments_items,'invested_user'))"></td>
                        <td></td>
                        <td></td>
                    </tr>
                </template>
            </v-data-table>
            <div v-html="foot" class="pa-4"></div>
        <!-- DIALOG CU INVESTMERNT -->
        <v-dialog v-model="dialog" max-width="550">
            <v-card class="pa-6">
                <InvestmentsCU :investment="investment" :mode="investment_mode" :key="key" @cruded="on_InvestmentsCU_cruded"></InvestmentsCU>
            </v-card>
        </v-dialog>
        <!-- DIALOG  VIEW INVESTMERNT -->
        <v-dialog v-model="dialog_view" v-if="investment">
            <v-card class="pa-4">
                <InvestmentsView :investment_id="investment.id" :key="key" @cruded="on_InvestmentView_cruded"></InvestmentsView>
            </v-card>
        </v-dialog>
        <!-- DIALOG  ADD QUOTE -->
        <v-dialog v-model="dialog_quotescu" width="450">
            <v-card class="pa-4">
                <QuotesCU :quote="quote" :mode="quote_mode" :key="key" @cruded="on_QuotesCU_cruded"></QuotesCU>
            </v-card>
        </v-dialog>

        <!-- INVESTMENT change selling price-->
        <v-dialog v-model="dialog_change_selling_price">
            <v-card class="pa-3">
                <InvestmentsChangeSellingPrice :investment="investment" :key="key" @cruded="on_InvestmentsChangeSellingPrice_cruded()"></InvestmentsChangeSellingPrice>
            </v-card>
        </v-dialog>

    </div>
</template>
<script>
    import axios from 'axios'
    import MyMenuInline from './MyMenuInline.vue'
    import InvestmentsCU from './InvestmentsCU.vue'
    import InvestmentsChangeSellingPrice from './InvestmentsChangeSellingPrice.vue'
    import InvestmentsView from './InvestmentsView.vue'
    import QuotesCU from './QuotesCU.vue'
    import {empty_quote, empty_investment} from '../empty_objects.js'
    export default {
        components:{
            MyMenuInline,
            InvestmentsCU,
            InvestmentsView,
            QuotesCU,
            InvestmentsChangeSellingPrice,
        },
        data(){ 
            return{
                showActive:true,
                investments_headers: [
                    { title: this.$t('Name'), sortable: true, key: 'fullname'},
                    { title: this.$t('Last datetime'), key: 'last_datetime',  width: "9%"},
                    { title: this.$t('Last'), key: 'last',  width: "7%", align:'end'},
                    { title: this.$t('Daily difference'), key: 'daily_difference',  width: "7%", align:'end'},
                    { title: this.$t('Daily percentage'), key: 'daily_percentage',  width: "7%", align:'end'},
                    { title: this.$t('Invested'), key: 'invested_user', align:'end',  width: "7%"},
                    { title: this.$t('Gains'), key: 'gains_user', align:'end',  width: "7%"},
                    { title: this.$t('Balance'), key: 'balance_user', align:'end',  width: "7%"},
                    { title: this.$t('% Invested'), key: 'percentage_invested', align:'end',  width: "7%"},
                    { title: this.$t('% Selling point'), key: 'percentage_selling_point', align:'end',  width: "7%"},
                    { title: this.$t('Actions'), key: 'actions', sortable: false , width: "6%"},
                ],
                investments_items:[],
                menuinline_items: [
                    {
                        subheader: this.$t("Investment options"),
                        children: [
                            {
                                name: this.$t("Add a new investment"),
                                icon: "mdi-pencil",
                                code: function(this_){
                                    this_.investment=this_.empty_investment()
                                    this_.investment_mode="C"
                                    this_.key=this_.key+1
                                    this_.dialog=true
                                },
                            },
                        ]
                    },
                ],
                dialog:false,
                investment: null,
                investment_mode: null,
                loading_investments:false,
                search:"",

                dialog_view:false,
                foot:"",
                key:0,

                // QuoteCU add
                dialog_quotescu:false,
                quote:null,
                quote_mode:null,

                // CHange selling price
                dialog_change_selling_price:false,
                selling_product:null,

                //Products auto update
                products_updating:false,
                update_errors:0,
            }
        },
        watch:{
            showActive () {
                this.update_table()
            },
        },
        methods: { 
            addQuote(item){
                this.quote=this.empty_quote()
                this.quote.products=item.products
                this.quote_mode="C"
                this.dialog_quotescu=true
                this.key=this.key+1

            },
            deleteItem (item) {
                this.investment=item
                this.investment_mode="D"
                this.key=this.key+1
                this.dialog=true
            },
            editItem (item) {
                this.investment=item
                this.investment_mode="U"
                this.key=this.key+1
                this.dialog=true
            },
            changeSellingPrice(item){
                this.investment=item
                this.key=this.key+1
                this.dialog_change_selling_price=true
            },
            empty_investment,
            empty_quote,
            on_InvestmentView_cruded(){
                this.key=this.key+1
                this.update_table()
            },
            on_QuotesCU_cruded(){
                this.dialog_quotescu=false
                this.update_table()
            },
            on_InvestmentsCU_cruded(){
                this.dialog=false
                this.update_table()
            },
            on_InvestmentsChangeSellingPrice_cruded(){
                this.dialog_change_selling_price=false
                this.update_table()
            },
            on_chkActive(){
                this.update_table()
            },
            tooltip_selling_percentage(item){
                return this.$t("Selling price: {0}.<br>Selling point gains {1}.<br>Order valid until {2}.",[
                    this.currency_string(item.selling_price,item.currency),
                    this.currency_string(item.gains_at_selling_point_investment,item.currency),
                    item.selling_expiration
                ])
            },
            setCheckboxLabel(){
                if (this.showActive== true){
                    return this.$t("Uncheck to see inactive investments")
                } else {
                    return this.$t("Check to see active investments")
                }
            },
            update_foot(){
                var positives=this.listobjects_sum(this.investments_items.filter((o) => o.gains_user >=0), "gains_user")
                var negatives=this.listobjects_sum(this.investments_items.filter((o) => o.gains_user <0), "gains_user")
                this.foot= "<p>" + this.$t("Positive gains - Negative gains = {0} {1} = {2}", [
                    this.localcurrency_html(positives),
                    this.localcurrency_html(negatives),
                    this.localcurrency_html(positives+negatives)
                ]) + "</p>"
            },
            update_table(){
                this.loading_investments=true
                axios.get(`${this.store().apiroot}/api/investments/withbalance/?active=${this.showActive}`, this.myheaders())
                .then((response) => {
                    this.investments_items=response.data
                    this.update_foot()
                    this.loading_investments=false
                }, (error) => {
                    this.parseResponseError(error)
                });
            },
            viewItem (item) {
                this.investment=item
                this.key=this.key+1
                this.dialog_view=true
            },
            table_sort_by(){
                if (this.showActive){
                    return [{key:'percentage_selling_point', order: 'asc'}]
                } else {
                    return [{key:'fullname', order: 'asc'}]
                }
            },
            products_autoupdate(){
                this.products_updating=true
                axios.post(`${this.store().apiroot}/products/update/`, {auto:true,}, this.myheaders())
                .then((response) => {
                        this.update_errors=0
                        response.data.forEach(o=>{
                            if (o.log.includes("Product")) this.update_errors=this.update_errors+1
                        })
                        this.update_table()
                        this.products_updating=false
                }, (error) => {
                    this.parseResponseError(error)
                })
            },
        },
        mounted(){
            this.update_table()
        }
    }
</script>

