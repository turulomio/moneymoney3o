<template>
    <div>    
        <h1>{{ $t('Strategies list') }}
            <MyMenuInline :items="menuinline_items" :context="this"></MyMenuInline>
        </h1>
        <v-card outlined class="ma-4 pa-4">
            <v-checkbox v-model="showActive" :label="setCheckboxLabel()" @click="on_chkActive()" ></v-checkbox>
            <EasyDataTable alternating  :headers="strategies_headers" :items="strategies_items" sort-by="percentage_selling_point" class="elevation-1 cursorpointer" hide-default-footer disable-pagination :loading="loading_strategies" :key="key" @click-row="detailedviewItem">
                <!-- <template v-slot:[`item.name`]="{ item }">
                    <v-tooltip right>
                        <template v-slot:activator="{ on }">
                            <div v-on="on">{{ item.name }}</div>
                        </template>
                        <span>{{ item.comment }}</span>
                    </v-tooltip>
                </template> -->  
                <template #item-dt_from="item">
                    <div v-html="localtime(item.dt_from )"></div>
                </template>        
                <template #item-dt_to="item">
                    <div v-html="localtime(item.dt_to )"></div>
                </template>   
                <template #item-invested="item">
                    <div class="right" v-html="localcurrency_html(item.invested)"></div>
                </template>    
                <template #item-gains_current_net_user="item">
                    <div class="right" v-html="localcurrency_html(item.gains_current_net_user)"></div>
                </template>    
                <template #item-gains_historical_net_user="item">
                    <div class="right" v-html="localcurrency_html(item.gains_historical_net_user)"></div>
                </template>    
                <template #item-dividends_net_user="item">
                    <div class="right" v-html="localcurrency_html(item.dividends_net_user)"></div>
                </template>    
                <template #item-total_net_user="item">
                    <div class="right" v-html="localcurrency_html(item.total_net_user)"></div>
                </template>           

                <template #item-actions="item">
                    <v-icon small class="mr-2" @click.stop="viewItem(item)">mdi-eye</v-icon>
                    <v-icon small class="mr-2" @click.stop="editItem(item)">mdi-pencil</v-icon>
                    <v-icon small @click.stop="deleteItem(item)">mdi-delete</v-icon>
                </template>                  
                <template #body-append>
                    <tr class="totalrow">
                        <td>{{$t("Total ([0] strategies)", [strategies_items.length]) }}</td>
                        <td></td>
                        <td></td>
                        <td class="right" v-html="localcurrency_html(listobjects_sum(strategies_items,'invested'))"></td>
                        <td class="right" v-html="localcurrency_html(listobjects_sum(strategies_items,'gains_current_net_user'))"></td>
                        <td class="right" v-html="localcurrency_html(listobjects_sum(strategies_items,'gains_historical_net_user'))"></td>
                        <td class="right" v-html="localcurrency_html(listobjects_sum(strategies_items,'dividends_net_user'))"></td>
                        <td class="right" v-html="localcurrency_html(listobjects_sum(strategies_items,'total_net_user'))"></td>
                        <td></td>
                    </tr>
                </template>
            </EasyDataTable>
        </v-card>

        <!-- Strategy CU -->
        <v-dialog v-model="dialog_strategy_cu" max-width="550">
            <v-card class="pa-4">
                <StrategyCU :strategy="strategy" :deleting="strategy_deleting" :key="key" @cruded="on_StrategyCU_cruded" />
            </v-card>
        </v-dialog>

        <!-- View strategy -->
        <v-dialog v-model="dialog_view">
            <v-card class="pa-4">
                <StrategiesView :strategy="strategy" :key="key"></StrategiesView>
            </v-card>
        </v-dialog>

        <!-- Detailed view strategy -->
        <v-dialog v-model="dialog_detailedview">
            <v-card class="pa-4">
                <ProductsRanges :pr="pr" :key="key"></ProductsRanges>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
    import axios from 'axios'
    import MyMenuInline from './MyMenuInline.vue'
    import StrategiesView from './StrategiesView.vue'
    import StrategyCU from './StrategyCU.vue'
    import ProductsRanges from './ProductsRanges.vue'
    import {empty_products_ranges, empty_strategy} from '../empty_objects.js'
    export default {
        components:{
            MyMenuInline,
            StrategiesView,
            StrategyCU,
            ProductsRanges,
        },
        data(){ 
            return{
                showActive:true,
                strategies_headers: [
                    { text: this.$t('Name'), sortable: true, value: 'name'},
                    { text: this.$t('Date and time from'), sortable: true, value: 'dt_from',  width: "10%"},
                    { text: this.$t('Date and time to'), value: 'dt_to',  width: "10%"},
                    { text: this.$t('Invested'), value: 'invested',  width: "7%", align:'right'},
                    { text: this.$t('Current net gains'), value: 'gains_current_net_user',  width: "7%", align:'right'},
                    { text: this.$t('Historical net gains'), value: 'gains_historical_net_user',  width: "7%", align:'right'},
                    { text: this.$t('Net dividends'), value: 'dividends_net_user',  width: "7%", align:'right'},
                    { text: this.$t('Total'), value: 'total_net_user',  width: "7%", align:'right'},
                    { text: this.$t('Actions'), value: 'actions', sortable: false , width: "7%"},
                ],
                strategies_items:[],
                menuinline_items: [
                    {
                        subheader: this.$t("Strategy options"),
                        children: [
                            {
                                name: this.$t("Add a new strategy"),
                                icon: "mdi-pencil",
                                code: function(this_){
                                    this_.strategy=this_.empty_strategy()
                                    this_.key=this_.key+1
                                    this_.dialog_strategy_cu=true
                                },
                            },
                        ]
                    },
                ],
                // STRATEGY CU
                dialog_strategy_cu:false,
                strategy: null,
                strategy_deleting: false,



                loading_strategies:false,
                dialog_view:false,
                key:0,

                //Detailed view
                dialog_detailedview: false,
                pr: null,
            }
        },
        methods: {
            editItem (item) {
                this.strategy=item
                this.key=this.key+1
                this.dialog_strategy_cu=true
            },
            empty_products_ranges,
            empty_strategy,
            deleteItem(item){
                this.strategy=item
                this.strategy_deleting=true
                this.key=this.key+1
                this.dialog_strategy_cu=true
            },
            viewItem (item) {
                this.strategy=item
                this.key=this.key+1
                this.dialog_view=true
            },
            detailedviewItem (item) {
                if (item.type==2){//RANGES
                    this.pr=this.empty_products_ranges()
                    this.pr.product=`${this.store().apiroot}/api/products/${item.additional1}/`
                    this.pr.percentage_between_ranges=item.additional2
                    this.pr.percentage_gains=item.additional3
                    this.pr.amount_to_invest=item.additional4
                    this.pr.recomendation_methods=item.additional5
                    this.pr.totalized_operations=item.additional6
                    this.pr.investments=item.investments
                    this.key=this.key+1
                    this.dialog_detailedview=true
                } else {
                    alert(this.$t("Detailed view for this strategy type is not developed yet"))
                }
            },
            update_table(){
                this.loading_strategies=true
                axios.get(`${this.store().apiroot}/api/strategies/withbalance/?active=${this.showActive}`, this.myheaders())
                .then((response) => {
                    this.strategies_items=response.data
                    this.loading_strategies=false
                }, (error) => {
                    this.parseResponseError(error)
                });
            },
            on_chkActive(){
                this.update_table()
            },
            on_StrategyCU_cruded(){
                this.dialog_strategy_cu=false
                this.strategy_deleting=false
                this.update_table()
            },
            setCheckboxLabel(){
                if (this.showActive== true){
                    return this.$t("Uncheck to see inactive strategies")
                } else {
                    return this.$t("Check to see active strategies")
                }
            },
        },
        mounted(){
            this.update_table()
        }
    }
</script>

