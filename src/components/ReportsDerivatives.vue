<template>
    <div>
        <h1>{{ $t("Derivatives report") }}</h1>

        <div class="pa-6">
            <v-tabs  background-color="primary" dark v-model="tab" next-icon="mdi-arrow-right-bold-box-outline" prev-icon="mdi-arrow-left-bold-box-outline" show-arrows>
                <v-tab key="0">{{ $t("Month evolution") }}</v-tab>
                <v-tabs-slider color="yellow"></v-tabs-slider>
            </v-tabs>
            <v-window v-model="tab">
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
            </v-window>     
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
                    { text: this.$t('Year'), value: 'year', sortable: true },
                    { text: this.$t('January'), value: 'm1', sortable: true,align:'end' },
                    { text: this.$t('February'), value: 'm2', sortable: true, align:'end' },
                    { text: this.$t('March'), value: 'm3', sortable: true, align:'end' },
                    { text: this.$t('April'), value: 'm4', sortable: true, align:'end' },
                    { text: this.$t('May'), value: 'm5', sortable: true, align:'end' },
                    { text: this.$t('June'), value: 'm6', sortable: true, align:'end' },
                    { text: this.$t('July'), value: 'm7', sortable: true, align:'end' },
                    { text: this.$t('August'), value: 'm8', sortable: true, align:'end' },
                    { text: this.$t('September'), value: 'm9', sortable: true, align:'end' },
                    { text: this.$t('October'), value: 'm10', sortable: true, align:'end' },
                    { text: this.$t('November'), value: 'm11', sortable: true, align:'end' },
                    { text: this.$t('December'), value: 'm12', sortable: true, align:'end' },
                    { text: this.$t('Total'), value: 'total', sortable: true,align:'end' },
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
