<script setup>
import { ref, onMounted, watch, computed } from "vue";
import Square from "../components/SquareLoading.vue";

import { useRoute} from "vue-router";
import router from "../router";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const route = useRoute();

const isLoading = ref(true);
let previousDatetime = ''; 
let previousQuota = ref(0); 
let previousCurrentQuota = ref(0);

const event = ref({
    title: '',
    organizer: '',
    description:'',
    datetime:'',
    quota: 10,
    location: '',
    image: '',
    highlight: false,
    currentQuota: 0,
    volunteers: []
})

// a function to get the booking from the backend
const getEvent = async function () {
    isLoading.value = true;
    // Get the token from local storage    
    const token = localStorage.getItem('token');

  try {
      const response = await fetch('/api/event/edit/' + route.params.id,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
      
      );
      const json = await response.json();  
      if (!response.ok) {
            alert('Please Sign-in with Authorized Credentials.', response.statusText);
            router.push({ name: 'login' });
            throw new Error(response.statusText);
        } 
        event.value = json.events;
        previousDatetime = event.value.datetime;
        previousQuota.value = event.value.quota;
        previousCurrentQuota.value = event.value.currentQuota;
        isLoading.value = false;
  } catch (error) {
      // console.error('Error fetching event:', error);
      alert('Error fetching event. Please Sign-in with Authorized Credentials.');
      router.push("/login");
  } finally {
      isLoading.value = false;
  }
}

onMounted(async () => {
    // if there is an id in the route
    if (route.params.id) {
        getEvent();
    }
});

const submitEvent = async function () {
    isLoading.value = true;
    var url = '/api/event/update/' + event.value._id;
    var method = 'PUT';

    // Check if event.quota is smaller or equal to the size of the event.volunteers array
    if (event.value.quota < event.value.volunteers.length) {
        // Show a warning to the user
        alert('Warning: Quota is equal to or smaller than the number of volunteers.');
        alert('Please adjust the quota. Bigger or equal than ' + event.value.volunteers.length);
        location.reload();
        return;
    }

    // Get the token from local storage    
    const token = localStorage.getItem('token');
    try{
        if (!event.value.datetime) {
            event.value.datetime = previousDatetime;
        }

        let quotaDifference = event.value.quota - previousQuota.value;
        let impCurrent = quotaDifference;

        event.value.impCurrent = impCurrent;

        // post the booking to the backend
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
                
            },
            body: JSON.stringify(event.value)
        });

        if (!response.ok) {
            alert('Please Sign-in with Authorized Credentials.', response.statusText);
            router.push({ name: 'login' });
            //throw new Error(response.statusText);
        } 
        // convert the response to json
        const json = await response.json();

        // log the json
        console.log(json);
        // alert the user
        alert(JSON.stringify(json));
    } catch (error) {
      console.log('Error submitting. Please Sign-in with Authorized Credentials.');
      //router.push("/login");
    } finally {
        isLoading.value = false;
    }
    

}

const deleteEvent = async function () {
    isLoading.value = true;
    // Get the token from local storage    
    const token = localStorage.getItem('token');
    try{
        // post the booking to the backend
        const response = await fetch('/api/event/delete/' + event.value._id, {
            method: 'DELETE',
            headers: {
                    Authorization: `Bearer ${token}`
                }
        });

        if (!response.ok) {
                alert('Please Sign-in with Authorized Credentials.', response.statusText);
                router.push({ name: 'login' });
                throw new Error(response.statusText);
        }
        // convert the response to json
        const json = await response.json();
        // alert the user
        alert(JSON.stringify(json));
        isLoading.value = false;
    } catch (error) {
      alert('Error deleting. Please Sign-in with Authorized Credentials.');
      router.push("/login");
    } finally {
        isLoading.value = false;
    }

}

</script>

<template>
    <main>
        <div class="container" id="containerWhole" v-if="!isLoading" @submit.prevent="submitEvent">
            <form id="headForm" action="/event" method="POST" >
                
                <div class="row" id="containerHead">
                    <div class="container" id="containerVol">
                        <span  style="color: blue;">Home / Events </span> / Edit Event   
                    </div>
                    <div class="col" id="buttonDel">
                        <router-link :to="'/event'">
                            <button type="button" class="btn btn-danger btn-lg" v-on:click="deleteEvent">Delete</button>
                        </router-link>
                    </div>
                </div>

                
                <div class="form-row" >
                    <div class="form-group col-md-6">
                        <label for="title3" class="form-label">Event title</label>
                        <input type="text" class="form-control" v-model="event.title" id="title3" required>
                        
                        <label for="organizer3" class="form-label">Organizer</label>
                        <input type="text" class="form-control" v-model="event.organizer" id="organizer3" required>
                        
                    </div>

                    <div class="form-group col-md-6">
                        <label for="description3">Description</label>
                        <textarea class="form-control" v-model="event.description" id="description3" rows="4" required></textarea>
                    </div>

                </div>

                <div class="form-row">

                    <div class="form-group col-md-6">
                        <label for="datetime3" class="form-label">Datetime</label>
                        <VueDatePicker class="form-control" v-model="event.datetime" id="datetime3" :placeholder="event.datetime || '06/12/2024, 13:00'" required></VueDatePicker>
                   
                    </div>

                    <div class="form-group col-md-6">
                        <label for="quota3">Quota</label>
                        <input 
                            type="number" 
                            class="form-control" 
                            v-model="event.quota" 
                            id="quota3" 
                            placeholder="10" 
                            required
                            min="2"
                        >  
                    </div>
                    
                    <div class="form-group col-md-6">
                        <label for="location3">Location</label>
                        <input type="text" class="form-control" v-model="event.location" id="location3" placeholder="Apartment, studio or floor" required>        
                    </div>

                    <div class="form-group col-md-6">
                        <label for="image3">Image Link</label>
                        <input type="text" class="form-control" v-model="event.image" id="image3" placeholder="http://image.com/example.png" required>        
                    </div>

                    <div class="form-group col-md-6">
                        <div class="form-check">
                            <input class="form-check-input" v-model="event.highlight" type="checkbox" id="highlight3">
                            <label class="form-check-label" for="highlight3">
                                Highlight
                            </label>

                        </div>
                    </div>
                    
                    <div class="form-group col-md-6" id="buttonR">

                        <button type="submit" class="btn btn-primary" v-on:click="submitEvent">Save</button>

                    </div>

                </div>
      
            </form>
        </div>
        <div v-else class="loading-container">
            <Square :loading="isLoading"></Square>
        </div>

    </main>
</template>

<style>
    
    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    #containerWhole{
        right:0;
        left:0;
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

    #buttonDel{
        text-align: right;
    }

    
    #headForm{
        position: relative;
        top: 5rem;

    }

    #buttonR{
        text-align: right;
    }

</style>