<template>
    <v-app>    
        <v-navigation-drawer v-model="drawer" absolute temporary app class="blue-grey lighten-5 " style="position:fixed; top:0; left:0" width="350">
            <v-card class="mx-auto" >
                <v-list>
                    <v-list-item>
                            <v-list-item-title class="title">Money Money</v-list-item-title>
                            <v-list-item-subtitle>{{ store().version }} ({{ store().versiondate.toISOString().slice(0,10)}})</v-list-item-subtitle>
                            <v-list-item-subtitle class="boldred" v-if="store().catalog_manager"><span class="vuered">{{ $t("With catalog manager role") }}</span></v-list-item-subtitle>
                    </v-list-item>

                    <v-divider></v-divider>

                </v-list>
            </v-card>
        </v-navigation-drawer>
        
        <v-app-bar color="primary" dark  fixed fill-height app >
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-btn :to="{ name: 'home'}"><v-icon icon="mdi-home" dark></v-icon></v-btn>
            <!-- <v-btn :to="{ name: 'settings'}" v-if="store().logged"><v-icon icon="mdi-wrench" dark></v-icon></v-btn>  -->
            <!-- <v-btn :to="{ name: 'assetsreport'}" v-if="store().logged"><v-icon icon="mdi-book" dark></v-icon></v-btn> -->
            <v-spacer />
            <h1 class="font-weight-black text-no-wrap text-truncate" >{{ $t("Money Money. Another way to manage your finances") }}</h1>
            <v-spacer />            
            <!-- <v-btn :to="{ name: 'currencies'}" v-if="store().logged"><v-icon icon="mdi-currency-eur" dark></v-icon></v-btn> -->
            <!-- <SwitchLanguages /> -->
            <btnLogIn v-show="!store().logged"/>
            <btnLogOut v-show="store().logged"/>

        </v-app-bar>
        <v-main>   
            <router-view></router-view>
        </v-main>
    </v-app>
</template>

<script>
import btnLogIn from './components/btnLogIn';
import btnLogOut from './components/btnLogOut';
// import SwitchLanguages from './components/SwitchLanguages.vue';
export default {
    name: 'App',
    components: {
        btnLogIn,
        btnLogOut,
        // SwitchLanguages,
    },
    data () {
        return {
            logged:false,
            drawer: false,
            height:22,
            width:22,
        }
    },
    mounted(){

    }
};
</script>
<style >
h1   {
    text-align: center;
    font-weight: bold;
    padding-top: 6px;
}

h2 {
    text-align: center;
    font-weight: normal;
}

paragraph{
    text-align:justify;
    padding: 30px;
}

.v-card__title {
    margin-top: 0px;
    padding: 0px 0px 10px 0px;
}

span.vuered{
    color:red;
}

.cursorpointer {
    cursor: pointer;
}


.boldred{
    color: red;
    font-weight: 900;
}

.boldgreen{
    color: Green;
    font-weight: 900;
}

.bold{
    font-weight: 900;
}
.boldcenter{
    font-weight: 900;
    text-align: center;
}

.v-application .inform {
    margin-bottom: 1px;
    background-color: white !important;
}

.totalrow{
    background-color: WhiteSmoke;
    font-weight: 600;
}

</style>