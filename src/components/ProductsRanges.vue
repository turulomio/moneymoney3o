<template>
    <div>
        <h1> {{ $t('Product ranges') }}</h1>
        <v-card class="ma-4 pa-4">   
            
            <v-form ref="form" v-model="form_valid" lazy-validation>             
                <v-row class="pl-5 pr-5">
                <AutocompleteProducts v-model="newpr.product" :rules="RulesSelection(true)"  />
                <v-text-field class="mr-5" v-model="newpr.percentage_between_ranges"  :label="$t('Set percentage between ranges x1000')" :placeholder="$t('Set percentage between ranges x1000')" :rules="RulesInteger(10,true)" counter="10"/>
                <v-text-field class="mr-5" v-model="newpr.percentage_gains"  :label="$t('Set percentage gains x1000')" :placeholder="$t('Set percentage gains x1000')" :rules="RulesInteger(10,true)" counter="10"/>
                <v-text-field  v-model="newpr.amount_to_invest"  :label="$t('Set the amount to invest')" :placeholder="$t('Set the amount to invest')" :rules="RulesInteger(10,true)" counter="10"/>
                </v-row>
                <v-row class="pl-5 pr-5">
                <v-select class="mr-5" :items="store().recomendation_methods" v-model="newpr.recomendation_methods" :label="$t('Set recomendation method')"  item-title="name" item-value="id" :rules="RulesSelection(true)"></v-select>  
                <v-text-field class="mr-5" v-model.number="newpr.additional_ranges"  :label="$t('Additional ranges to show')" :placeholder="$t('Additional ranges to show')" :rules="RulesInteger(2,true)" counter="2"/>
                <v-checkbox class="mr-5" v-model="newpr.totalized_operations" :label="$t('Show totalized investments operations?')" ></v-checkbox>
                <v-autocomplete :items="this.getInvestmentsByProduct(newpr.product)" v-model="newpr.investments" :label="$t('Select investments to include')" item-title="fullname" item-value="id" multiple :rules="RulesSelection(true)" chips></v-autocomplete>
                <v-btn class="mt-4" color="primary" @click="accept()" :disabled="!form_valid">{{ $t("Show ranges") }}</v-btn>
                </v-row>
            </v-form>
        </v-card>

        <v-card class="ma-6 pa-6">
            <v-tabs v-model="tab">
                <v-tab key="0">{{ $t('Product ranges table') }}</v-tab>
                <v-tab key="1">{{ $t('Product ranges chart') }}</v-tab>
            </v-tabs>
            <v-window v-model="tab">
            <v-window-item key="0">
                <v-card flat>
                    <p >{{ currentpricelabel }}</p>
                    <EasyDataTable dense :headers="tableHeaders" :items="tableData" class="elevation-1" disable-pagination  hide-default-footer :sort-by="['value']" :sort-desc="[true]" fixed-header height="360">      

                        <template #item-value="item">
                            <div  @click="showLimits(item)" :class="item.current_in_range ? 'boldgreen' : ''">{{currency_string(item.value, prdata.product.currency) }}</div>
                        </template>    
                            <template #item-recomendation_invest="item">
                            <v-icon small v-if="item.recomendation_invest" >mdi-check-outline</v-icon>
                        </template>                        
                            <template #item-investments_inside="item">
                            <div v-for="o in item.investments_inside" :key="o.name" @click="on_investments_inside_click(o)">{{ $t("[0]. Invested: [1]").format(o.name, currency_string(o.invested, prdata.product.currency)) }}<br></div>
                        </template>                      
                            <template #item-orders_inside="item">
                            <div  v-for="o in item.orders_inside" :key="o.name" @click="on_orders_inside_click(o)">{{ $t("[0]. Amount: [1]").format(o.name, currency_string(o.amount, prdata.product.currency)) }}<br></div>
                        </template>
                            <template #item-actions="item">
                            <v-icon small class="mr-2" @click="addOrder(item)" :color="(item.recomendation_invest) ? '' : 'red'">mdi-cart</v-icon>
                        </template>
                    </EasyDataTable>   
                    </v-card>
                </v-window-item>
                <v-window-item key="1" >
                    <div style="height: 600px;">
                        <ChartProductsRanges :prdata="prdata" autoresize />
                    </div>
                </v-window-item>
            </v-window>
        </v-card>
        <!-- Order CU dialog -->
        <v-dialog v-model="dialog_ordercu" max-width="550">
            <v-card class="pa-4">
                <OrdersCU :order="order" mode="C" @cruded="on_OrdersCU_cruded()" :key="key"></OrdersCU>
            </v-card>
        </v-dialog>
        <!-- Orders LIST -->
        <v-dialog v-model="dialog_orders_list" @click:outside="on_dialog_orders_list_click_outside()">
            <v-card class="pa-4">
                <OrdersList :key="key"></OrdersList>
            </v-card>
        </v-dialog>
        <!-- Investment view  -->
        <v-dialog v-model="dialog_investment_view" @click:outside="on_dialog_investment_view_click_outside()">
            <v-card class="pa-4">
                <InvestmentsView :key="key" :investment="investment"></InvestmentsView>
            </v-card>
        </v-dialog>
    </div>
</template>


<script>    
    import {empty_products_ranges, empty_order} from '../empty_objects.js'
    import axios from 'axios'
    import AutocompleteProducts from './AutocompleteProducts.vue'
    import ChartProductsRanges from './ChartProductsRanges.vue'
    import InvestmentsView from './InvestmentsView.vue'
    import OrdersList from './OrdersList.vue'
    import OrdersCU from './OrdersCU.vue'
    export default {
        components: {
            ChartProductsRanges,
            OrdersCU,
            OrdersList,
            InvestmentsView,
            AutocompleteProducts,
        },
        props:{
            pr:{
                required:false,
            }
        },
        data(){ 
            return {
                tab: null,
                chart: '',                
                tableHeaders: [
                    { text: 'Value', value: 'value',sortable: true, width:"7%"},
                    { text: 'Must Invest', value: 'recomendation_invest',sortable: false, width:"5%"},
                    { text: 'Investments',  sortable: false, value: 'investments_inside'},
                    { text: 'Orders',  sortable: false, value: 'orders_inside'},
                    { text: 'Actions', value: 'actions', sortable: false , width:"7%"},
                ],   
                newpr:this.empty_products_ranges(),
                currentpricelabel:"",
                prdata:null,
                form_valid:false,
                tableData:[],
                option: {},
                loading:false,

                //Dialog OrderCU
                dialog_ordercu:false,
                order: null,
                key:0,

                //Dialog orders list
                dialog_orders_list:false,

                //Dialog investment view
                dialog_investment_view:false,
                investment:null,
            }   
        },
        methods:{
            accept(){
                if (this.$refs.form.validate()==false) return
                this.refreshTable()

            },
            addOrder(item){
                this.order=this.empty_order()
                this.order.price=item.value
                this.order.current_price=this.prdata.product.last
                this.key=this.key+1
                this.dialog_ordercu=true
            },
            empty_order,
            empty_products_ranges,
            refreshTable(){
                this.loading=true
                var headers={...this.myheaders(),params:this.newpr}
                axios.get(`${this.store().apiroot}/products/ranges/`, headers)
                .then((response) => {
                    this.prdata=response.data
                    this.tableData=this.prdata.pr
                    this.currentpricelabel= this.$t("Current price: [0]").format(this.currency_string(this.prdata.product.last, this.prdata.product.currency))
                    this.loading=false
                }, (error) => {
                    this.parseResponseError(error)
                });
            },
            showLimits(item){
                let s=this.$t("Range center: [0]").format(this.currency_string(item.value, this.prdata.product.currency))
                
                
                alert(`${s}\n${item.limits}`)
            },
            on_OrdersCU_cruded(){
                this.dialog_ordercu=false
                this.refreshTable()
            },
            on_orders_inside_click(){
                this.dialog_orders_list=true
            },
            on_dialog_orders_list_click_outside(){
                this.dialog_orders_list=false
                this.refreshTable()
            },
            on_investments_inside_click(inv){
                this.investment=inv
                this.dialog_investment_view=true
            },
            on_dialog_investment_view_click_outside(){
                this.dialog_orders_list=false
                this.refreshTable()
            },
        
        },
        created(){
            if (this.pr!=null){
                this.newpr=Object.assign({},this.pr)
                this.refreshTable()
            }
        }
    }
</script>
