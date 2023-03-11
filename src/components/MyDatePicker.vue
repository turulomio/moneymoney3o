<!--
    Value:
        Can be:
            - A Date iso string  new Date().toISOString().split("T")[0] "2022-12-12"
            - null. Se grabaría como null
-->


<template>
        <div class="d-flex flex-row mx-auto pa-4">                       
            <v-icon  @click="dt=new Date()">mdi-calendar</v-icon>        
            <VueDatePicker v-model="dt" on :label="$attrs.label" :format="format"/>
            <v-icon x-small @click="new_value=null" v-if="!hidenullicon">mdi-backspace</v-icon>

        </div>
</template>
<script>
    export default {    
        props: {
            modelValue:{ //v-model in vue3
                required:true
            },
            readonly: {
                required: false,
                default: false,
            },
            rules: {
                type: Array,
                required: false
            },
            hidenullicon: { //Hides null icon
                type: Boolean,
                required: false,
                default: false,
            }
        },
        emits: ['update:modelValue'],
        data: function(){
            return {
                dt: null,
                new_value: null,
            }
        },
        watch: {
            new_value (newValue) {
                this.$emit('update:modelValue', newValue)
            },
            value (newValue) {
                this.new_value = newValue
            },
            dt(newValue){
                this.new_value=this.dt2string(newValue)
            }
        },
        methods: {
            format(){
                if (this.dt) {
                    return this.dt2string(this.dt)
                } else {
                    return ""
                }
            },

            string2dt(s){
                if (!s) return null
                return new Date(s)
            },
            dt2string(dt){
                if (!dt) return null
                return dt.toISOString().slice(0,10)
            }
        },
        created(){
            this.new_value=this.modelValue
            this.dt=this.string2dt(this.new_value)
        },
    }
</script>
