<template>
    <v-autocomplete :readonly="readonly" :items="store().products" v-model="new_value" :label="mylabel" item-title="fullname" :return-object="returnObject" item-value="url" :rules="$attrs.rules" @change="on_change">
        <!-- <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props"><v-icon :class="'mr-3 fi fib fi-'+item.flag" small :title="this.getCountryNameByCode(item.flag)"></v-icon>
                {{item.fullname}}
            </v-list-item>
        </template>

        <template v-slot:selection="{ props, item }">    
            <v-list-item v-bind="props" :title="item.fullname"><v-icon :class="'mr-3 fi fib fi-'+item.flag" small :title="this.getCountryNameByCode(item.flag)"></v-icon>
            </v-list-item>
      </template> -->

    </v-autocomplete>
</template>

<script>
export default {
    name: "AutocompleteProducts",
    props:{
        // value: { 
        //     required: true,
        // },
        returnObject:{
            type: Boolean,
            required:false,
            default:false,
        },
        readonly: {
            type: Boolean,
            required: false,
            default: false
        },
    },
    computed:{
        mylabel(){
            if ('label' in this.$attrs) return this.$attrs.label
            return this.$t('Select a product')
        }
    },
    data(){ 
        return {
            new_value:null,
        }
    },
    methods:{
        on_change(item){
            this.new_value=item
            this.$emit("input", this.new_value)
        },
    },
    created(){
        this.new_value=this.value
        //console.log(this.$attrs)
    }
}
</script>