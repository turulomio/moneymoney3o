<template>
    <div>    
        <h1>{{ $t('Ranking investments report') }}</h1>
        <v-card outlined class="ma-4 pa-4">
            <v-row class="pa-4">
                <v-text-field class="ml-10 mr-6" v-model="search" append-icon="mdi-magnify" :label="$t('Filter')" single-line hide-details :placeholder="$t('Add a string to filter table')"></v-text-field>
                <v-checkbox dense v-model="only_current_investments" :label="$t('Show only current investments?')" ></v-checkbox>
            </v-row>
            <EasyDataTable dense rows-per-page="10000" :headers="headers" :search="search" :items="data" class="elevation-1" hide-footer disable-pagination :loading="loading_table">

                <template #item-current_net_gains="item">
                    <div class="right" v-html="localcurrency_html(item.current_net_gains )"></div>
                </template>  
                <template #item-historical_net_gains="item">
                    <div class="right" v-html="localcurrency_html(item.historical_net_gains )"></div>
                </template>  
                <template #item-dividends="item">
                    <div class="right" v-html="localcurrency_html(item.dividends )"></div>
                </template>  
                <template #item-total="item">
                    <div class="right" v-html="localcurrency_html(item.total )"></div>
                </template>  
                <template #item-actions="item">
                    <v-icon small class="mr-2" @click="viewInvestmentsMerged(item)">mdi-eye</v-icon>
                </template>    
                <template #body-append="{headers}">
                    <tr class="totalrow" ref="lr" v-if="search==''">
                        <td v-for="(header,i) in headers" :key="i" >
                            <div v-if="header.value == 'name'">
                                Total
                            </div>
                        
                            <div v-if="header.value == 'current_net_gains'" class="right">
                                <div v-html="localcurrency_html(listobjects_sum(data,'current_net_gains'))"></div>
                            </div>
                            <div v-if="header.value == 'historical_net_gains'" class="right">
                                <div v-html="localcurrency_html(listobjects_sum(data,'historical_net_gains'))"></div>
                            </div>
                            <div v-if="header.value == 'dividends'" class="right">
                                <div v-html="localcurrency_html(listobjects_sum(data,'dividends'))"></div>
                            </div>
                            <div v-if="header.value == 'total'" class="right">
                                <div v-html="localcurrency_html(listobjects_sum(data,'total'))"></div>
                            </div>
                        </td>
                    </tr>
                </template>                        
            </EasyDataTable>
        </v-card>
        <!-- Investments merged View dialog -->
        <v-dialog v-model="dialog_investments_merged_view">
            <v-card class="pa-4">
                <InvestmentsMergedView :investments="investments" :key="key"></InvestmentsMergedView>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
    import axios from 'axios'
    import InvestmentsMergedView from './InvestmentsMergedView.vue'
    export default {
        components:{
            InvestmentsMergedView,
        },
        data(){ 
            return{
                headers: [
                    { text: this.$t('Ranking'), sortable: true, value: 'ranking',  width: "3%"},
                    { text: this.$t('Name'), value: 'name'},
                    { text: this.$t('Current net gains'), value: 'current_net_gains', align:'end',  width: "10%"},

                    { text: this.$t('Historical net gains'), value: 'historical_net_gains', align:'end',  width: "10%"},
                    { text: this.$t('Net dividends'), value: 'dividends', align:'end',  width: "10%"},
                    { text: this.$t('Total'), value: 'total', align:'end',  width: "10%"},
                    { text: this.$t('Actions'), value: 'actions', sortable: false , width: "7%"},
                ],
                data:[
                ],
                loading_table:false,
                search:"",
                only_current_investments:false,

                // Investments merged view
                dialog_investments_merged_view:false,
                investments:null,
                key:0,
            }
        },
        watch: {
            only_current_investments(){
                this.update_table()
            }
        },
        methods: {
            viewInvestmentsMerged (item) {
                this.investments=item.investments
                this.key=this.key+1
                this.dialog_investments_merged_view=true
            },
            update_table(){
                this.loading_table=true

                axios.get(`${this.store().apiroot}/reports/ranking/`, this.myheaders())
                .then((response) => {
                    this.data=[]
                    response.data.forEach(o=>{
                        if (this.only_current_investments){
                            if (o.current_net_gains!=0){
                                this.data.push(o)
                            }
                        } else {
                            this.data.push(o)
                        }
                    })
                    this.loading_table=false
                }, (error) => {
                    this.parseResponseError(error)
                });
            },
        },
        created(){
            this.update_table()
        }
    }
</script>

