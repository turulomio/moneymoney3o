<template>
    <div>
   
        <h1>{{ $t("Investment classes") }}</h1>   
        <v-card class="pa-5">
            <v-select label="Select a method to calculate charts" v-model="method" :items="method_products" @change="key=key+1"></v-select>
                <v-tabs  background-color="primary" dark v-model="tab" next-icon="mdi-arrow-right-bold-box-outline" prev-icon="mdi-arrow-left-bold-box-outline" show-arrows>
                    <v-tab key="product">{{ $t("By investment product") }}</v-tab>
                    <v-tab key="pci">{{ $t("By Put / Call / Inline") }}</v-tab>
                    <v-tab key="percentage">{{ $t("By variable percentage") }}</v-tab>
                    <v-tab key="type">{{ $t("By investment type") }}</v-tab>
                    <v-tab key="leverage">{{ $t("By leverage") }}</v-tab>
                    <v-tabs-slider color="yellow"></v-tabs-slider>
                </v-tabs>
                <v-window v-model="tab" v-if="data!=null">
                    <v-window-item key="product">
                        <ChartPie name="Investments by product" :items="echart_products_items" save_name="prueba.png" :key="key"></ChartPie>
                    </v-window-item>
                    <v-window-item key="pci">
                        <ChartPie name="Investments by pci" :items="echart_pci_items" :key="key"></ChartPie>
                    </v-window-item>
                    <v-window-item key="percentage">
                        <ChartPie name="Investments by variable percentage" :items="echart_percentage_items" :key="key"></ChartPie>
                    </v-window-item>
                    <v-window-item key="type">
                        <ChartPie name="Investments by product type" :items="echart_producttype_items" :key="key"></ChartPie>
                    </v-window-item>
                    <v-window-item key="leverage">
                        <ChartPie name="Investments by leverage" :items="echart_leverage_items" :key="key"></ChartPie>
                    </v-window-item>
                </v-window>
        </v-card>
    </div>
</template>
<script>      
    import axios from 'axios'
    import ChartPie from './ChartPie.vue'
    export default {
        components:{
            ChartPie,
        },
        data(){ 
            return {
                tab:null,
                key:0,
                method: "Current",
                method_products:["Invested", "Current"],
                data:null,
                loading:false,
            }
        },
        computed:{
            echart_products_items: function(){
                var products= this.data.by_product
                var adapted
                if (this.method=="Current"){
                    adapted= products.map(el => ({name: el.name, value: this.my_round(el.balance, 2)}))
                } else {//Invested
                    adapted= products.map(el => ({name: el.name, value: this.my_round(el.invested,2)}))
                }
                adapted=adapted.filter(o => o.value!=0)
                return adapted
            },
            echart_pci_items: function(){
                var products= this.data.by_pci
                var adapted
                if (this.method=="Current"){
                    adapted= products.map(el => ({name: el.name, value: this.my_round(el.balance, 2)}))
                } else {//Invested
                    adapted= products.map(el => ({name: el.name, value: this.my_round(el.invested,2)}))
                }
                adapted=adapted.filter(o => o.value!=0)
                return adapted
            },
            echart_percentage_items: function(){
                var products= this.data.by_percentage
                var adapted

                if (this.method=="Current"){
                    adapted= products.map(el => ({name: el.name, value: this.my_round(el.balance, 2)}))
                } else {//Invested
                    adapted= products.map(el => ({name: el.name, value: this.my_round(el.invested,2)}))
                }
                adapted=adapted.filter(o => o.value!=0)
                return adapted
            },
            echart_producttype_items: function(){
                var products= this.data.by_producttype
                var adapted
                if (this.method=="Current"){
                    adapted= products.map(el => ({name: el.name, value: this.my_round(el.balance, 2)}))
                } else {//Invested
                    adapted= products.map(el => ({name: el.name, value: this.my_round(el.invested,2)}))
                }
                adapted=adapted.filter(o => o.value!=0)
                return adapted
            },
            echart_leverage_items: function(){
                var products= this.data.by_leverage
                var adapted
                if (this.method=="Current"){
                    adapted= products.map(el => ({name: el.name, value: this.my_round(el.balance, 2)}))
                } else {//Invested
                    adapted= products.map(el => ({name: el.name, value: this.my_round(el.invested,2)}))
                }
                adapted=adapted.filter(o => o.value!=0)
                return adapted
            }
        },
        methods:{
            update_table(){
                this.loading=true
                axios.get(`${this.store().apiroot}/investments/classes/`, this.myheaders())
                .then((response) => {
                    this.data=response.data
                    this.loading=false
                    this.key=this.key+1
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
