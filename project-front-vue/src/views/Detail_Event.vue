<script setup>
import { ref, onMounted, watch } from "vue";
import Square from "../components/SquareLoading.vue";

import { useRoute} from "vue-router";
const route = useRoute();

const isLoading = ref(true);

const event = ref({
    title: '',
    organizer: '',
    description:'',
    datetime:'',
    quota: 10,
    location: '',
    image: '',
    highlight: false,
    volunteers: []
})

const volunteers = ref([]);

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


// a function to get the booking from the backend
const getEvent = async function () {
  isLoading.value = true;
  try {
      const response = await fetch('/api/event/detail/' + route.params.id);
      const json = await response.json();
      
      event.value = json.events;
      
      if(userRole.value === 'admin'){
        getEventAdmin();
      } else{
        isLoading.value = false;
      }
  } catch (error) {
      console.error('Error fetching event:', error);
  }
}

// a function to get the booking from the backend
const getEventAdmin = async function () {
  isLoading.value = true;

  // Get the token from local storage    
  const token = localStorage.getItem('token');
  try {
      const response = await fetch('/api/event/detailadmin/' + route.params.id,
          {   
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
              },
          });

      const json = await response.json();
      
      volunteers.value = json.event_volunteers;
      
  } catch (error) {
      console.error('Error fetching event:', error);
  } finally {
      isLoading.value = false;
  }
}

const removeVolunteer = async function (volID) {
    isLoading.value = true;
    // Get the token from local storage    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/event/removeVol/' + volID,
        {   
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                 Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                eventID: route.params.id,
                volID: volID,
            })
        });
        
      if (!response.ok) {
        alert(response.message);
        throw new Error(response.message);
      } else{
        alert("Succesfully removed the event.")
      }

    } catch (error) {
        alert(error);
        //alert('Error fetching to the event. Please try to Sign-in with Authorized Credentials.');
    } finally {
        isLoading.value = false;
        location.reload();
    }
  }


onMounted(async () => {
    // if there is an id in the route
    if (route.params.id) {
        getEvent();
    }
});

</script>

<template>
    <div class="container col-12" id="containerWhole" v-if="!isLoading">
        <div class="col-md-3" id="containerVol">
          <span style="color: blue;">Home / Events </span> / {{ event.title }}
        </div>
        <div class="card-group wrap" id="rowW">
          <div class="card col-md-6 mb-3" id="leftCard">
            <div class="card-body">
              <h2>{{ event.title }}</h2>
              <h4 class="text-muted"> </h4>
              <p>{{ event.description }}</p>
            </div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item">Date: {{ event.datetime }}</li>
              <li class="list-group-item">Location: {{ event.location }}</li>
              <li class="list-group-item">Quota: {{ event.quota }}</li>
              <li class="list-group-item">Available Quota: {{ event.currentQuota }}</li>
            </ul>
          </div>
          <div class="card col-md-6 mb-3" id="rightCard">
            <img class="card-img-top" :src="event.image">
            
            <div class="card-body" v-if="showVolunteersOption">
              <div class="row" id="eventsTitle">
                    <div class="col-4">
                        <o-table :data="isEmpty ? [] : volunteers" :mobile-cards="false">
                        <o-table-column v-slot="props" field="name" label="Volunteer name">
                            {{ props.row.name !== '' ? props.row.name : '#NULL#' }}
                        </o-table-column>
                        </o-table>
                    </div>
                    <div class="col-4">
                        <o-table :data="isEmpty ? [] : volunteers" :mobile-cards="false">
                        <o-table-column v-slot="props" field="phone" label="Contact">
                            {{ props.row.phone !== '' ? props.row.phone : '#NULL#' }}
                        </o-table-column>
                        </o-table>
                    </div>

                    <div class="col-4" >
                        <o-table 
                        :data="isEmpty ? [] : volunteers"
                        :mobile-cards=false
                        >
                            <o-table-column 
                                v-slot="props"
                                field="edit-action"
                                label="Action"
                                id="buttonEditEvent">
                                <div class="container">
                                  <router-link :to="'/volunteer/' + props.row._id" class="my-button">Edit</router-link>
                                </div>
                            </o-table-column>

                            <o-table-column 
                                v-slot="props"
                                field="delete-action"
                                id="buttonDelVolEvent">
                                <div class="container">
                                    <button @click="removeVolunteer(props.row._id)" class="btn btn-danger btn-sm">X</button>
                                </div>
                            </o-table-column>

                        </o-table>
                    </div>

              </div>
            </div>
            <div class="card-body" v-else>
                <h5 class="card-title text-muted">Become a volunteer!</h5>
                <p class="card-text text-muted">Your time and talent can make a real difference in people's lives.</p>
            </div>
            

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

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  #containerWhole{
  top: 3rem;
  right: 0;
  left: 0;
  }

  #containerVol{
  background-color: #E9ECEF;
  padding: 10px;
  border-radius: 10px;
  text-align: center;
  left: 1rem;
  top: 1rem;

  }

  #rowW{
  margin-top: 3rem;
  top: 14rem;
  }

  #rightCard{
  margin-right: 1rem;

  margin-left: 1rem;

  }

  .card-img-top{
  height: 300px;
  }

  #leftCard{
  margin-left: 1rem;

  margin-right: 1rem;

  }
</style>