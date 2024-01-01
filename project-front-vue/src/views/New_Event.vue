<script setup>
import { ref, onMounted } from "vue";
import Square from "../components/SquareLoading.vue";
import router from '../router/index.js';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const userRole = localStorage.getItem('userRole') || '';
const isLoading = ref(false);


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

const submitEvent = async function () {
    isLoading.value = true;
    // Get the token from local storage    
    const token = localStorage.getItem('token');

    // post the booking to the backend
    const response = await fetch('/api/event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(event.value)
    });
 
    if (!response.ok) {
        alert('Please Sign-in with Authorized Credentials.', response.statusText);
        router.push({ name: 'login' });
        throw new Error(response.statusText);
    } else{
        // convert the response to json
        const json = await response.json();

        // Extract the inserted ID from the response
        const insertedId = json.message;

        // Add admin the booking to the backend
        const response2 = await fetch('/api/event/manager/' + insertedId, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        if (!response2.ok) {
            alert('Please Sign-in with Authorized Credentials.', response.statusText);
            router.push({ name: 'login' });
            throw new Error(response.statusText);
        } else{
            const json2 = await response2.json();
            // log the json
            alert(JSON.stringify(json2.message));
            isLoading.value = false;
            router.push("/event");
        }   
    }
}

onMounted(() => {
  if(userRole !== 'admin'){
    alert("Please login with admin credentials.")
    router.push('/login');
  }
});

</script>

<template>
    <main>
        <div class="container" id="containerWhole" v-if="!isLoading">
            <form id="headForm" action="/event" method="POST">
                        
                <div class="col" id="containerVol">
                    <span  style="color: blue;">Home / Events </span> / New Event   
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
                            <input class="form-check-input" v-model="event.highlight" type="checkbox" id="highlight3" required>
                            <label class="form-check-label" for="highlight3">
                                Highlight
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group col-md-6" id="buttonR">
                        <button type="submit" class="btn btn-primary" @click="submitEvent">Save</button>
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
    
    #headForm{
        position: relative;
        top: 5rem;

    }

    #buttonR{
        text-align: right;
    }

</style>