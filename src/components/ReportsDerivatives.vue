<template>
    <div>
        <h1>{{ $t("Derivatives report") }}</h1>

        <div class="pa-6">
            <v-tabs  background-color="primary" dark v-model="tab" next-icon="mdi-arrow-right-bold-box-outline" prev-icon="mdi-arrow-left-bold-box-outline" show-arrows>
                <v-tab key="0">{{ $t("Month evolution") }}</v-tab>
                <v-tabs-slider color="yellow"></v-tabs-slider>
            </v-tabs>
            <v-tabs-items v-model="tab">
                <v-window-item key="0">    
                    <p class="boldcenter my-4">{{$t("This report sums the following accounts operations: 'Derivatives. Daily adjustment', 'Derivatives. Operation commission', 'Derivatives. Swaps' and 'Fast investment operations'")}}</p>
                    <v-card class="pa-4" outlined >
                        <EasyDataTable dense :headers="derivatives_headers" :items="derivatives" class="elevation-1" disable-pagination  hide-default-footer  fixed-header :loading="loading">
                            <template v-slot:[`item.m1`]="{ item }"><div v-html="localcurrency_html(item.m1 )"></div></template>  
                            <template v-slot:[`item.m2`]="{ item }"><div v-html="localcurrency_html(item.m2 )"></div></template>  
                            <template v-slot:[`item.m3`]="{ item }"><div v-html="localcurrency_html(item.m3 )"></div></template>  
                            <template v-slot:[`item.m4`]="{ item }"><div v-html="localcurrency_html(item.m4 )"></div></template>  
                            <template v-slot:[`item.m5`]="{ item }"><div v-html="localcurrency_html(item.m5 )"></div></template>  
                            <template v-slot:[`item.m6`]="{ item }"><div v-html="localcurrency_html(item.m6 )"></div></template>  
                            <template v-slot:[`item.m7`]="{ item }"><div v-html="localcurrency_html(item.m7 )"></div></template>  
                            <template v-slot:[`item.m8`]="{ item }"><div v-html="localcurrency_html(item.m8 )"></div></template>  
                            <template v-slot:[`item.m9`]="{ item }"><div v-html="localcurrency_html(item.m9 )"></div></template>  
                            <template v-slot:[`item.m10`]="{ item }"><div v-html="localcurrency_html(item.m10 )"></div></template>  
                            <template v-slot:[`item.m11`]="{ item }"><div v-html="localcurrency_html(item.m11 )"></div></template>  
                            <template v-slot:[`item.m12`]="{ item }"><div v-html="localcurrency_html(item.m12 )"></div></template> 
                            <template v-slot:[`item.total`]="{ item }"><div v-html="localcurrency_html(item.total )"></div></template>  
                        </EasyDataTable>   
                    </v-card>
                    <p class="boldcenter my-4" v-html="$t('Total derivatives: {0}').format(localcurrency_html(this.listobjects_sum(derivatives,'total')))"></p>
                </v-window-item>
            </v-tabs-items>     
        </div>
    </div>
</template>
<script>     

    import axios from 'axios'
    export default {
        components:{
        },
        data(){
            return {
                tab:0,   
                derivatives: [],
                derivatives_headers: [
                    { title: this.$t('Year'), key: 'year', sortable: true },
                    { title: this.$t('January'), key: 'm1', sortable: true,align:'end' },
                    { title: this.$t('February'), key: 'm2', sortable: true, align:'end' },
                    { title: this.$t('March'), key: 'm3', sortable: true, align:'end' },
                    { title: this.$t('April'), key: 'm4', sortable: true, align:'end' },
                    { title: this.$t('May'), key: 'm5', sortable: true, align:'end' },
                    { title: this.$t('June'), key: 'm6', sortable: true, align:'end' },
                    { title: this.$t('July'), key: 'm7', sortable: true, align:'end' },
                    { title: this.$t('August'), key: 'm8', sortable: true, align:'end' },
                    { title: this.$t('September'), key: 'm9', sortable: true, align:'end' },
                    { title: this.$t('October'), key: 'm10', sortable: true, align:'end' },
                    { title: this.$t('November'), key: 'm11', sortable: true, align:'end' },
                    { title: this.$t('December'), key: 'm12', sortable: true, align:'end' },
                    { title: this.$t('Total'), key: 'total', sortable: true,align:'end' },
                ],
                loading: false

            }
        },
        computed:{
        },
        watch:{
        },
        methods:{
            refreshTables(){
                this.loading=true
                axios.get(`${this.store().apiroot}/derivatives/`, this.myheaders())
                .then((response) => {
                    this.derivatives=response.data.data
                    this.loading=false
                }, (error) => {
                    this.parseResponseError(error)
                })
            }
        },
        mounted(){
            this.refreshTables()

        }
    }
</script>
