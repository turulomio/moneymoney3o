<template>
    <div>
        <h1>{{ $t("Concepts report") }}</h1>
        <MyMonthPicker v-model="ym" @update:ModelValue="refreshTables()"/>


        <div class="mx-4">
            <v-tabs  background-color="primary" dark v-model="tab" next-icon="mdi-arrow-right-bold-box-outline" prev-icon="mdi-arrow-left-bold-box-outline" show-arrows>
                <v-tab key="positive">{{ $t("Positive balance concepts") }}</v-tab>
                <v-tab key="negative">{{ $t("Negative balance concepts") }}</v-tab>
                <v-tabs-slider color="yellow"></v-tabs-slider>
            </v-tabs>
            <v-tabs-items v-model="tab">
                <v-window-item key="positive">
                    <v-card outlined>
                        <EasyDataTable dense :headers="itemsHeaders" :items="itemsPositive"  class="elevation-1 cursorpointer" disable-pagination  hide-default-footer :loading="loading" height="300" @click-row="viewHistoricalReport">
                            <template v-slot:[`item.concept`]="{ item }">
                                <div v-html="getObjectPropertyByUrl('concepts',item.concept,'name')"></div>
                            </template> 
                            <template v-slot:[`item.total`]="{ item }">
                                <div v-html="localcurrency_html(item.total)"></div>
                            </template>   
                            <template v-slot:[`item.median`]="{ item }">
                                <div v-html="localcurrency_html(item.median)"></div>
                            </template>  
                            <template v-slot:[`item.percentage_total`]="{ item }">
                                <div v-html="percentage_html(item.percentage_total)"></div>
                            </template>       
                            <template v-slot:[`body.append`]="{headers}">
                                <tr class="totalrow" ref="lr">
                                    <td v-for="(header,i) in headers" :key="i" >
                                        <div v-if="header.value == 'concept'">
                                            Total
                                        </div>
                                        <div v-if="header.value == 'total'" class="d-flex justify-end">
                                            <div v-html="localcurrency_html(listobjects_sum(itemsPositive,'total'))"></div>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </EasyDataTable>   
                    </v-card>
                </v-window-item>
                <v-window-item key="negative">     
                    <v-card outlined>
                        <EasyDataTable dense :headers="itemsHeaders" :items="itemsNegative"  class="elevation-1 cursorpointer" disable-pagination  hide-default-footer :sort-by="['year']" :loading="loading" @click-row="viewHistoricalReport">
                            <template v-slot:[`item.concept`]="{ item }">
                                <div v-html="getObjectPropertyByUrl('concepts',item.concept,'name')"></div>
                            </template> 
                            <template v-slot:[`item.total`]="{ item }">
                                <div v-html="localcurrency_html(item.total)"></div>
                            </template>   
                            <template v-slot:[`item.median`]="{ item }">
                                <div v-html="localcurrency_html(item.median)"></div>
                            </template>  
                            <template v-slot:[`item.percentage_total`]="{ item }">
                                <div v-html="percentage_html(item.percentage_total)"></div>
                            </template>                   
                            <template v-slot:[`body.append`]="{headers}">
                                <tr class="totalrow" ref="lr">
                                    <td v-for="(header,i) in headers" :key="i" >
                                        <div v-if="header.value == 'concept'">
                                            Total
                                        </div>
                                        <div v-if="header.value == 'total'" class="d-flex justify-end">
                                            <div v-html="localcurrency_html(listobjects_sum(itemsNegative,'total'))"></div>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </EasyDataTable>  
                    </v-card>
                </v-window-item>
            </v-tabs-items>    
        </div>
        <!-- VIEW HISTORICAL REPORT dialog -->
        <v-dialog v-model="dialog_historical">
            <v-card class="pa-4">
                <ReportsConceptsHistorical :concept="concept" :key="key" ></ReportsConceptsHistorical>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>     
    import axios from 'axios'
    import ReportsConceptsHistorical from './ReportsConceptsHistorical'
    import MyMonthPicker from './MyMonthPicker.vue'

    export default {
        components:{
            ReportsConceptsHistorical,
            MyMonthPicker,
        },
        data(){
            return {
                tab:1,
                ym: null,
                itemsHeaders: [
                    { title: this.$t('Concept'), key: 'concept',sortable: true },
                    { title: this.$t('Total'), key: 'total',sortable: true, align:'end'},
                    { title: this.$t('Total percentage'), key: 'percentage_total',sortable: true, align:'end'},
                    { title: this.$t('Median'), key: 'median',sortable: true, align:'end'},
                ],   
                itemsPositive: [],
                itemsNegative: [],
                loading:false,
                key: 0,
                dialog_historical: false,
                concept:null,
            }
        },
        methods:{
            refreshTables(){
                this.loading=true
                axios.get(`${this.store().apiroot}/reports/concepts/?year=${this.ym.year}&month=${this.ym.month}`, this.myheaders())
                .then((response) => {
                    this.itemsPositive=response.data.positive
                    this.itemsNegative=response.data.negative
                    this.loading=false
                    this.key=this.key+1
                }, (error) => {
                    this.parseResponseError(error)
                });
            },
            viewHistoricalReport(item){
                this.dialog_historical=true
                this.concept=item.concept
                this.key=this.key+1
            }
        },
        mounted(){

            this.refreshTables()

        }
    }
</script>
