<!--
    Value:
        Can be:
            - A Zulu zulu js string in utc new Date().toISOString()
            - null. Se grabaría como null
            - emptystring genera now en zulu string
            

    Representation is showed in local
    Tuple is in local

-->

<template>
    <div class="d-flex flex-row mx-auto pa-4">                       
        <v-icon  @click="dt=new Date()">mdi-calendar</v-icon>        
        <VueDatePicker v-model="dt" :label="$attrs.label" :format="format"/>
        <v-icon x-small @click="dt=null" v-if="!hidenullicon">mdi-backspace</v-icon>

    </div>
</template>
<script>
export default {    
    name: "MyDateTimePicker",
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
        new_value () {
            this.$emit('update:modelValue', this.new_value)
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
            return dt.toISOString()
        }
    },
    created(){
        this.new_value=this.modelValue
        this.dt=this.string2dt(this.new_value)
    },
}
</script>
