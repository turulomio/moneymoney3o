<template>
    <div>
        <h1 class="mb-2">{{ $t("Change selling price") }}</h1>
        <div v-html="$t('Table with all investments with the same product as current investment:')"></div>
        <EasyDataTable ref="table" v-model:items-selected="data_selected" :headers="tableHeaders" :items="data" class="elevation-1 mt-2" :disable-pagination="true" dense height="300" @select-row="calculate()" @deselect-row="calculate()">
            <template #item-fullname="item">
                {{ getObjectPropertyByUrl("investments",item.url,"fullname") }}
            </template>            
            <template #item-selling_price="item">
                <div class="right">{{ currency_string(item.selling_price, item.currency)}}</div>
            </template>
            <template #item-average_price="item">
                <div class="right">{{ currency_string(item.average_price, item.currency)}}</div>
            </template>
            <template #item-invested_investment="item">
                <div class="right">{{ currency_string(item.invested_investment, item.currency)}}</div>
            </template>
            <template #item-balance_investment="item">
                <div class="right">{{ currency_string(item.balance_investment, item.currency)}}</div>
            </template>
        </EasyDataTable>
        <DisplayValues :items="displayvalues()" :minimized_items="5" :key="key"></DisplayValues>

        <v-tabs  background-color="primary" dark v-model="tab" grow>
            <v-tab key="percentage">{{ $t("Set a gains percentage") }}</v-tab>
            <v-tab key="gain">{{ $t("Set a gain") }}</v-tab>
            <v-tab key="price">{{ $t("Set a price") }}</v-tab>
            <v-tab key="range" v-if="this.data_selected.length==1 && this.investment.id==this.data_selected[0].id">{{ $t("Set a range for current investment strategy") }}</v-tab>
        </v-tabs>
        <v-window v-model="tab">
            <v-window-item key="percentage">      
                <v-card class="pa-3" outlined>
                    <v-text-field :name="this.$t('Set a gains percentage')" v-model.number="percentage" :counter="10" :label="this.$t('Set a gains percentage')" :placeholder="this.$t('Enter an amount')" :rules="this.RulesFloat(10,true,6)" autofocus></v-text-field>
                </v-card>
            </v-window-item>
            <v-window-item key="gain">     
                <v-card class="pa-3" outlined>
                    <v-text-field :name="this.$t('Set a gain')" v-model.number="gains" :counter="10" :label="this.$t('Set a gain')" :placeholder="this.$t('Enter an amount')" :rules="this.RulesFloat(10,true,6)"></v-text-field>
                </v-card>
            </v-window-item>
            <v-window-item key="price">     
                <v-card class="pa-3" outlined>
                    <v-text-field :name="this.$t('Set a price')" v-model.number="price" :counter="10" :label="this.$t('Set a price')" :placeholder="this.$t('Enter an amount')" :rules="this.RulesFloat(10,true,6)"></v-text-field>
                </v-card>
            </v-window-item>
            <v-window-item key="range">     
                <v-card class="pa-3" outlined>
                    <v-select :items="strategies" v-model="strategy" :label="$t('Set current investment strategy')"  item-title="name" return-object :rules="RulesSelection(true)"></v-select>  
                    <v-select :items="strategy_ranges" v-model="strategy_range" :label="$t('Set a strategy range')"  item-title="name" item-value="value" :rules="RulesSelection(true)"></v-select>  
                </v-card>
            </v-window-item>
        </v-window>    
        <v-card class="pa-4" width="100%">
            <v-form ref="form" v-model="form_valid" lazy-validation>
                <MyDatePicker v-model="selling_expiration" :label="$t('Selling expiration')"></MyDatePicker>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="submit()">{{ button_text }}</v-btn>
                    <v-btn color="error" @click="submit_null()">{{ $t("Set null values") }}</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-form>
        </v-card>
    </div>
</template>
<script>
    import axios from 'axios'
    import DisplayValues from './DisplayValues.vue'
    import MyDatePicker from './MyDatePicker.vue'
    import {empty_products_ranges} from '../empty_objects.js'

    
    export default {
        props:{
            //Current investment to be selected by default.
            //Investment object
            // Needs:
            // - url
            // - product url
            // - selling_price
            // - selling_expiration
            investment:{
                required:true,
            }
        },
        components:{
            MyDatePicker,
            DisplayValues,
        },
        data(){ 
            return{
                tab:2,
                form_valid:false,
                plio:null,
                data:[],
                data_selected:[],
                tableHeaders: [
                    { text: this.$t('Id'), value: 'id', sortable: true },
                    { text: this.$t('Name'), value: 'fullname', sortable: true},
                    { text: this.$t('Shares'), value: 'shares', sortable: true, align: 'right'},
                    { text: this.$t('Selling price'), value: 'selling_price', sortable: true, align: 'right'},
                    { text: this.$t('Selling expiration'), value: 'selling_expiration', sortable: true, align: 'right'},
                    { text: this.$t('Average price'), value: 'average_price', sortable: true, align: 'right'},
                    { text: this.$t('Invested'), value: 'invested_investment', sortable: true, align: 'right'},
                    { text: this.$t('Balance'), value: 'balance_investment', sortable: true, align: 'right'},
                ],
                selected_invested:0,
                selling_expiration: new Date().toISOString().substring(0, 10),
                menu_selling_expiration: false,
                selected_selling_price: NaN,
                selected_average_price:0,
                selected_shares:0,
                button_text: this.$t("Calculate your selling price"),
                gains:500,
                price: 0,
                percentage: 10,
                key:0,
                loading_ios:false,

                product:null, // Object loaded at created

                //Strategies for product ranges
                strategies:[],
                strategy: null,
                strategy_ranges:[],
                strategy_range: null,
                
            }
        },
        watch: {
            gains: function() {
                this.calculate()
            },
            percentage: function() {
                this.calculate()
            },
            price: function() {
                this.calculate()
            },
            tab: function(){
                this.calculate()
            },
            strategy: function(item){
                var pr=this.empty_products_ranges()
                pr.product=`${this.store().apiroot}/api/products/${item.additional1}/`
                pr.percentage_between_ranges=item.additional2
                pr.percentage_gains=item.additional3
                pr.amount_to_invest=item.additional4
                pr.recomendation_methods=item.additional5
                pr.totalized_operations=item.additional6
                pr.investments=[this.investment.id] // Is a string due tu uses api/strategies an in db is a string
                var headers={...this.myheaders(),params:pr}
                axios.get(`${this.store().apiroot}/products/ranges/`, headers)
                .then((response) => {
                    this.strategy_ranges=[]


                    response.data.pr.forEach(element => {

                        var investments_string=""
                        element.investments_inside.forEach(o => {
                            investments_string=investments_string+ o.name
                        })


                        this.strategy_ranges.push({name:`${element.value} ${investments_string}`, value: element.value})
                        
                    });
                }, (error) => {
                    this.parseResponseError(error)
                });
            },
            strategy_range: function(){
                this.calculate()
            },
        },
        computed:{

            investments_same_product(){
                //Returns an array of integers
                var r=[]
                this.store().investments.forEach(inv=>{
                    if (inv.products==this.product.url && inv.active){
                        r.push(inv.id)
                    }
                })
                return r
            }
        },
        methods:{
            displayvalues(){
                return [
                    {title:this.$t('Selected invested amount'), value: this.currency_string(this.selected_invested,this.product.currency)},
                    {title:this.$t('Number of shares selected'), value: this.selected_shares},
                    {title:this.$t('Average price of selected shares'), value: this.currency_string(this.selected_average_price,this.product.currency)},
                    {title:this.$t('Product leverage'), value: this.getObjectPropertyByUrl("leverages", this.product.leverages, "multiplier") },
                    {title:this.$t('Product real leverage'), value: this.product.real_leveraged_multiplier},
                ]
            },
            empty_products_ranges,
            selling_price_to_gain_money(money){
                var PF=0
                if (this.selected_shares>0){
                    PF=(money+this.selected_average_price*this.selected_shares*this.product.real_leveraged_multiplier)/(this.selected_shares*this.product.real_leveraged_multiplier)        
                } 
                else if (this.selected_shares<0){
                    PF=(-money+this.selected_average_price*this.selected_shares*this.product.real_leveraged_multiplier)/(this.selected_shares*this.product.real_leveraged_multiplier)        
                }
                return PF
            },    
            selling_price_to_gain_percentage_of_invested(percentage){
                var gains=this.selected_invested*percentage/100
                return this.selling_price_to_gain_money(gains)
            },
            submit(){                               
                if (this.$refs.form.validate()==false) return
                if (this.selling_expiration != null && new Date(this.selling_expiration).setHours(0,0,0,0)<new Date().setHours(0,0,0,0)) {
                    alert(this.$t("Selling expiration date is in the past"))
                }

                var s= new Array()
                this.data_selected.forEach(v=> s.push(v.url))
                var p={
                    selling_expiration:this.selling_expiration,
                    investments: s,
                    selling_price: this.my_round(this.selected_selling_price,  this.product.decimals),
                }
                axios.post(`${this.store().apiroot}/investments/changesellingprice/`, p, this.myheaders())
                .then(() => {
                    console.log(this.getObjectById("investments", 456).selling_price)
                    this.store().updateInvestments()
                    .then(()=>{
                        this.loading_ios=false
                        this.key=this.key+1
                        alert(this.$t("Remember to set your order in the bank"))
                console.log(this.getObjectById("investments", 456).selling_price)
                        this.$emit("cruded")
                    })
                }, (error) => {
                    this.parseResponseError(error)
                });
            },
            submit_null(){   
                var s= new Array()
                this.data_selected.forEach(v=> s.push(v.url))
                var p={
                    selling_expiration:null,
                    investments: s,
                    selling_price: 0,
                }
                axios.post(`${this.store().apiroot}/investments/changesellingprice/`, p, this.myheaders())
                .then(() => {
                    this.store().updateInvestments()
                    .then(()=>{
                        this.key=this.key+1
                        alert(this.$t("Remember to set your order in the bank"))
                        this.$emit("cruded")
                    })
                }, (error) => {
                    this.parseResponseError(error)
                });
            },
            calculate(){
                // this.console_log("DATA_SELECTED", newValue.length, this.data_selected.length, oldValue.length)
                this.selected_shares=this.data_selected.reduce((accum,item) => accum + item.shares, 0)
                this.selected_invested=this.data_selected.reduce((accum,item) => accum + item.invested_investment, 0)
                if (this.selected_shares!=0){
                    var selected_sharesbyaverage=this.data_selected.reduce((accum,item) => accum + item.shares*item.average_price, 0)
                    this.selected_average_price=selected_sharesbyaverage/this.selected_shares
                } else {
                    this.selected_average_price=0
                }
                if (this.tab==0){
                    this.selected_selling_price=this.selling_price_to_gain_percentage_of_invested(this.percentage)
                } else if (this.tab==1) {
                    this.selected_selling_price=this.selling_price_to_gain_money(this.gains)
                } else if (this.tab==2) {
                    this.selected_selling_price=this.price
                } else if (this.tab==3) {
                    this.selected_selling_price=this.strategy_range
                }
                    
                var gai=(this.selected_selling_price-this.selected_average_price)*this.selected_shares*this.product.real_leveraged_multiplier
                this.button_text=this.$t("Set selected investments selling price to [0] to gain [1]").format(
                    this.currency_string(this.selected_selling_price, this.product.currency, this.product.decimals),
                    this.currency_string(gai,this.product.currency, 2)
                )

            },
            refreshInvestments(select_current){
                this.loading_ios=true
                var headers={...this.myheaders(),params:{investments: this.investments_same_product,mode:2}}
                axios.get(`${this.store().apiroot}/investmentsoperations/full/`, headers )
                .then((response) => {
                    this.plio=response.data
                    var o
                    var plio_id

                    this.investments_same_product.forEach( investments_id => {
                        plio_id=this.plio[investments_id.toString()]
                        var inv=this.getObjectById("investments",investments_id)
                        o={
                            id: investments_id,
                            url: inv.url,
                            name: (this.investment.url==inv.url) ? inv.fullname+" (current)" : inv.fullname,
                            shares: plio_id.total_io_current.shares,
                            selling_price: inv.selling_price,
                            selling_expiration: inv.selling_expiration,
                            average_price: plio_id.total_io_current.average_price_investment,
                            invested_investment: plio_id.total_io_current.invested_investment,
                            balance_investment: plio_id.total_io_current.balance_investment,
                            currency: plio_id.data.currency_product,
                            
                        }
                        this.data.push(o)
                        //Adds current invesment to selection
                        if (select_current == true && o.url==this.investment.url){
                            this.data_selected.push(o)
                        }
                        this.calculate()

                    })
                    this.loading_ios=false
                    this.key=this.key+1
                }, (error) => {
                    this.parseResponseError(error)
                });
            },
            refreshStrategies(){
                axios.get(`${this.store().apiroot}/api/strategies/?investment=${this.investment.url}&active=true&type=2`, this.myheaders())
                .then((response) => {
                    this.strategies=response.data
                }, (error) => {
                    this.parseResponseError(error)
                });
            },
        },
        created(){
            this.product=this.getObjectByUrl("products",this.investment.products)
            this.selling_expiration=this.investment.selling_expiration
            this.price=this.investment.selling_price
            this.refreshStrategies()
            this.refreshInvestments(true)
        }
    }
</script>