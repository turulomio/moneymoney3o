<template>
    <div>
       <h1 class="mb-3">{{ $t("Last operation investments list") }}</h1>
 
        <v-layout style="justify-content: center;">
            <v-card width="40%" class="pa-6">
                <v-select :label="$t('Select the way to show results')" v-model="method" :items="method_results" item-value="id" item-title="name"></v-select>
                <v-text-field v-model="limit"   :label="$t('Percentage gains of the last operation to highlight')"  :placeholder="$t('Enter a number')"></v-text-field>
            </v-card>
        </v-layout>
        <p></p>
        <EasyDataTable dense :headers="tableHeaders" :items="tableData" class="elevation-1 ma-4" disable-pagination  hide-default-footer item-key="id" :key="refreshKey"  :sort-by="['percentage_last']" :sort-desc="[true]" >        
            <template v-slot:[`item.datetime`]="{ item}">
                    {{ localtime(item.datetime)  }} 
            </template>  
            <template v-slot:[`item.balance`]="{ item }">
                <div v-html="localcurrency_html(item.balance)"></div>
            </template> 
            <template v-slot:[`item.gains`]="{ item }">
                <div v-html="localcurrency_html(item.gains)"></div>
            </template>
            <template v-slot:[`item.percentage_last`]="{ item }">
                <div  :class="item.percentage_last<limit/100 ? 'boldred' : ''" v-html="percentage_html(item.percentage_last)"></div>
            </template>
            <template v-slot:[`item.percentage_invested`]="{ item }">
                <div v-html="percentage_html(item.percentage_invested)"></div>
            </template>
            <template v-slot:[`item.percentage_sellingpoint`]="{ item }">
                <div v-html="percentage_html(item.percentage_sellingpoint)"></div>
            </template>
            <template v-slot:[`item.actions`]="{ item }">                    
                <v-row class="text-nowrap" justify="center">
                    <v-icon small @click="orderAtPercentage(item)">mdi-cart</v-icon>   
                    <div @click="reinvestAtPercentage(item)"> <v-img color="#757575" src="@/assets/reinvest.png"  :height="16" :width="16"  ></v-img></div>
                </v-row>

            </template>
        </EasyDataTable>

        <!-- Order CU dialog -->
        <v-dialog v-model="dialog_cu" max-width="550">
            <v-card class="pa-4">
                <OrdersCU :order="order" mode="C" :key="refreshKey" @cruded="on_OrdersCU_cruded()"></OrdersCU>
            </v-card>
        </v-dialog>


        <!-- Reinvest dialog -->
        <v-dialog v-model="dialog_reinvest">
            <v-card class="pa-4">
                <InvestmentsoperationsReinvest :shares="reinvest_shares" :price="reinvest_price" :investments="reinvest_investments" :key="refreshKey"></InvestmentsoperationsReinvest>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import axios from 'axios'
    import {empty_order} from '../empty_objects.js'
    import OrdersCU from './OrdersCU.vue'
    import InvestmentsoperationsReinvest from './InvestmentsoperationsReinvest.vue'
    export default {
        components:{
            OrdersCU,
            InvestmentsoperationsReinvest,
        },
        data(){ 
            return{
                tableHeaders: [
                    { text: this.$t('Name'), value: 'name', sortable: true},
                    { text: this.$t('Date and time'), value: 'datetime', sortable: true, align:'end'},
                    { text: this.$t('Last shares'), value: 'last_shares', sortable: true, align:'end', width:"7%" },
                    { text: this.$t('Total shares'), value: 'shares', sortable: true, align:'end', width:"7%" },
                    { text: this.$t('Balance'), value: 'balance', sortable: true, align:'end', width:"7%" },
                    { text: this.$t('Gains'), value: 'gains', sortable: true, align:'end', width:"7%" },
                    { text: this.$t('% last'), value: 'percentage_last', sortable: true, align:'end', width:"7%" },
                    { text: this.$t('% invested'), value: 'percentage_invested', sortable: true, align:'end', width:"7%" },
                    { text: this.$t('% selling point'), value: 'percentage_sellingpoint', sortable: true, align:'end', width:"7%" },
                    { text: this.$t('Actions'), value: 'actions', sortable: true, cellClass: "text-nowrap" , width:"6%" },
                ],   
                tableData: [],
                method_results: [
                    { id:0, name:this.$t('Show separated investments')},
                    { id:1, name:this.$t('Show merging current investment operations')},
                ],
                limit: -40,
                method: 0,
                refreshKey: 0,


                dialog_cu:false,
                order: null,
                loading:false,

                //Reinvest
                dialog_reinvest:false,
                reinvest_investments:[],
                reinvest_shares:0,
                reinvest_price:0,
            }
        },
        watch:{
            method: function(){
                this.refreshTable()
            }
        },
        methods:{
            empty_order,
            on_OrdersCU_cruded(){
                this.dialog_cu=false
            },
            orderAtPercentage(item){
                this.order=this.empty_order()
                this.order.price=this.my_round(item.last_price*(1+this.limit/100), item.decimals)
                this.order.investments=item.url
                this.refreshKey=this.refreshKey+1
                this.dialog_cu=true
            },
            reinvestAtPercentage(item){
                this.reinvest_price=this.my_round(item.last_price*(1+this.limit/100), item.decimals)
                this.reinvest_shares=0
                this.reinvest_investments=item.investments_urls
                this.refreshKey=this.refreshKey+1
                this.dialog_reinvest=true
            },
            refreshTable(){
                this.loading=true
                axios.get(`${this.store().apiroot}/reports/investments/lastoperation/?method=${this.method}` , this.myheaders())
                .then( (response)=> {
                    this.tableData=response.data;
                    this.refreshKey=this.refreshKey+1;
                    this.loading=false
                }) 
                .catch((error) => {
                    this.parseResponseError(error)
                });
            }
        },
        mounted(){
            this.refreshTable()
        }
    }
</script>
