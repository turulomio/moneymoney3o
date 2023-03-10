<template>
    <div>
        <h1>{{ $t("Assets Report") }}</h1>
        <div class="d-flex justify-center mb-4" width="20%">                
            <v-card width="20%" class="pa-4">      
    
                <v-select class="pa-4" dense label="Select a format" v-model="format" :items="['pdf','odt','docx']"></v-select>       
                <v-alert dense class=" px-10" outlined :type="(unogenerator_working) ? 'success':'error'"> {{ (unogenerator_working) ? $t("UnoGenerator is ready"): $t("UnoGenerator is not working. Please contact system administrator")}}</v-alert>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn class="pa-4" :loading="loading" color="primary" :disabled="!can_launch()" @click="launch_report()">{{ $t("Generate report") }}</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>

            </v-card>
        </div>
        <div v-if="data">
            <ChartEvolutionAssets v-if="unogenerator_working" save_name="assetsreport_evolution" @finished="finished_evolution_assets=true;" ></ChartEvolutionAssets>
            <ChartPie name="Investments by product" :items="echart_products_items" save_name="assetsreport_classes_by_product" :heigth="height" :show_data="false" @finished="finished_by_product=true;" ></ChartPie>
            <ChartPie name="Investments by pci" :items="echart_pci_items" save_name="assetsreport_classes_by_pci" :heigth="height" :show_data="false" @finished="finished_by_pci=true;"></ChartPie>
            <ChartPie name="Investments by variable percentage" :items="echart_percentage_items" save_name="assetsreport_classes_by_percentage" :heigth="height" :show_data="false" @finished="finished_by_percentage=true;"></ChartPie>
            <ChartPie name="Investments by product type" :items="echart_producttype_items" save_name="assetsreport_classes_by_producttype" :heigth="height" :show_data="false" @finished="finished_by_producttype=true;"></ChartPie>
            <ChartPie name="Investments by leverage" :items="echart_leverage_items" save_name="assetsreport_classes_by_leverage" :heigth="height" :show_data="false" @finished="finished_by_leverage=true;"></ChartPie>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'
    import ChartEvolutionAssets from './ChartEvolutionAssets.vue'
    import ChartPie from './ChartPie.vue'
    export default {
        components:{
            ChartPie,
            ChartEvolutionAssets,
        },
        data(){
            return {
                loading:false,
                data:null,
                key:0,
                height:100,

                finished_by_product:false,
                finished_by_pci:false,
                finished_by_percentage:false,
                finished_by_producttype:false,
                finished_by_leverage:false,
                finished_evolution_assets:false,

                format:"pdf",
                unogenerator_working:false,
            }
        },        
        computed:{
            /// COPIED FROM REPORTSINVESTMENTSCLASSES
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
            can_launch(){
                if (this.finished_by_product && 
                this.finished_by_pci && 
                this.finished_by_percentage && 
                this.finished_by_producttype && 
                this.finished_by_leverage &&
                this.finished_evolution_assets) return true
                return false
            },
            launch_report(){
                this.loading=true
                axios.get(`${this.store().apiroot}/assets/report/?outputformat=${this.format}`, this.myheaders())
                .then((response) => {
                    this.loading=false      
                    var link = window.document.createElement('a');

                    link.href = `data:${response.data.mime};base64,${response.data.data}`
                    link.download = response.data.filename
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }, (error) => {
                    this.parseResponseError(error)
                });
            },

            update_pies(){
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
            check_unogenerator_server(){
                axios.get(`${this.store().apiroot}/unogenerator/working/`, this.myheaders())
                .then((response) => {
                    this.unogenerator_working=response.data.success
                    if (this.unogenerator_working){
                        this.update_pies()
                    }
                    this.key=this.key+1
                }, (error) => {
                    this.parseResponseError(error)
                });

            }
        },
        created(){
            this.check_unogenerator_server()
        }
    }
</script>