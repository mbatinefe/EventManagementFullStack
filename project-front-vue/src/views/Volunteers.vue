<script setup>
import { ref, onMounted, watch, computed } from "vue";
import Square from "../components/SquareLoading.vue";

import router from '../router/index';

const volunteers = ref([]);
const names = ref([]);
const emails = ref([]);
const contacts = ref([]);
const ids = ref([]);

const total = ref(0);
const isLoading = ref(true);
const totalPages = ref(1);

const page = ref(1);
const userRole = ref(localStorage.getItem('userRole') || '');

const showVolunteersOption = ref(userRole.value == 'admin');  // Added a ref for conditional rendering
const showMyEventsOption = ref(userRole.value == 'volunteer');  // Added a ref for conditional rendering

// Watch for changes in the isLoggedIn state
watch(userRole.value, (newValue) => {

  if(userRole.value === 'admin'){
      // Update showVolunteersOption based on the login status
      showVolunteersOption.value = newValue;
  } else if (userRole.value ==='volunteer'){
      // Update showVolunteersOption based on the login status
      showMyEventsOption.value = newValue;
  } else{
        // Update showVolunteersOption based on the login status
      showMyEventsOption.value = false;  
      showVolunteersOption.value = false;
  }

});

const loadAsyncData = () => {
    // Get the token from local storage    
    const token = localStorage.getItem('token');

    const params = [
        `page=${page.value}`
    ].join("&");
    isLoading.value = true;
    fetch(`/api/volunteers?${params}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    
    )
    .then((response) => {
        if (!response.ok) {
            alert('Please Sign-in with Authorized Credentials.', response.statusText);
            router.push({ name: 'login' });
            throw new Error(response.statusText);
        }
        return response.json();
    })
    .then((result) => {
        let currentTotal = result.total;
        
        total.value = currentTotal;
        totalPages.value = result.totalPages; // Assign totalPages from the response

        // Clear existing data
        names.value = [];
        emails.value = [];
        contacts.value = [];
        ids.value = [];

        volunteers.value = result.volunteers.map((item) => {
            // Assuming item has properties: name, email, contact, id
            names.value.push(item.name);
            emails.value.push(item.email);
            contacts.value.push(item.contact);
            ids.value.push(item._id);
            return item;
        });
        
        isLoading.value = false;
    })
        .catch((error) => {
            volunteers.value = [];
            total.value = 0;
            isLoading.value = false;
            throw error;
        });
};

const onPageChange = (p) => {
        page.value = p;
        loadAsyncData();
  };

onMounted(() => {
      loadAsyncData();
});

</script>

<template>
    <div class="container col-12" id="containerWhole" v-if="!isLoading">
        <div class="row" id="containerHead">
            <div class="container" id="containerVol">
                <span  style="color: blue;">Home / </span> Volunteers   
            </div>
            <div class="col" id="buttonNew">
                <router-link :to="'/volunteer'" class="btn btn-primary btn-lg" >
                    New
                </router-link>
            </div>
        </div>
        
        <div class="row">
            <div class="col-3">
                <o-table :data="isEmpty ? [] : volunteers" :mobile-cards="false">
                <o-table-column v-slot="props" field="first_name" label="Volunteer name">
                    {{ props.row.name !== '' ? props.row.name : '#NULL#' }}
                </o-table-column>
                </o-table>
            </div>

            <div class="col-3">
                <o-table :data="isEmpty ? [] : volunteers" :mobile-cards="false">
                    <o-table-column v-slot="props" field="email" label="Email">
                        {{ props.row.email !== '' ? props.row.email : '#NULL#' }}
                    </o-table-column>
                </o-table>
            </div>

            <div class="col-3">
                <o-table :data="isEmpty ? [] : volunteers" :mobile-cards="false">
                    <o-table-column v-slot="props" field="contact" label="Contact">
                        {{ props.row.phone !== '' ? props.row.phone : '#NULL#' }}
                    </o-table-column>
                </o-table>
            </div>
            
            <div class="col-3" >
                <o-table 
                :data="isEmpty ? [] : volunteers"
                :mobile-cards=false>
                    <o-table-column 
                        v-slot="props"
                        field="edit-action"
                        label="Action">
                        <div class="container" id="buttonEdit">
                            <router-link :to="'/volunteer/' + props.row._id" class="my-button">Edit</router-link>
                        </div>

                    </o-table-column>

                </o-table>

            </div>

            <div class="container" id="pages2">
                <nav aria-label="Page navigation example">
                <ul class="pagination">
                    <li v-for="i in totalPages" :key="i" class="page-item" :class="{ active: i === page}">
                    <a class="page-link" @click="() => onPageChange(i)">{{ i }}</a>
                    </li>
                </ul>
                </nav>
            </div>

        </div>

    </div> 
    
    <div v-else class="loading-container">
        <Square :loading="isLoading"></Square>
    </div>
    
</template>


<style scoped>
    .my-button {
      display: inline-block;
      padding: 0px 20px; 
      font-size: 16px;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
      border: px solid #ccc;
      border-radius: 5px;
      background-color: #6C757D;
      color: #ffffff;
    }

    #buttonEdit{
        text-align: left;
        bottom: 3rem;
        margin-bottom: 0rem;
        padding: 0;

    }

    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    #containerWhole{
        top: 4rem;
        padding: 0;
    }

    #containerHead{
        margin-bottom: 20px;
    }

    #containerVol{
        background-color: #E9ECEF;
        border-radius: 10px;
        margin-bottom: 1rem;
        font-size:18px; 
        width:fit-content; 
        width:-webkit-fit-content; 
        width:-moz-fit-content;
        padding: 0.5rem;
    }

    #buttonNew{
        text-align: right;
    }
    
    #pages2{
    margin-top: 1rem;
    top:1rem;
    bottom: 0;
    left:0;
    
    }
</style>