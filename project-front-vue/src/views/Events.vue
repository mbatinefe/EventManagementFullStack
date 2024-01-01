<script setup>

import { ref, onMounted, watch, computed } from "vue";
import Square from "../components/SquareLoading.vue";

const events = ref([]);

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
    const params = [
        `page=${page.value}`
    ].join("&");
    isLoading.value = true;
    fetch(`/api/event?${params}`)
        .then((response) => response.json())
        .then((result) => {
            let currentTotal = result.total;
            
            total.value = currentTotal;
            totalPages.value = result.totalPages;
            events.value = result.events.map((item) => {
                return item;
            });

            isLoading.value = false;
        })
        .catch((error) => {
            events.value = [];
            total.value = 0;
            isLoading.value = false;
            throw error;
        });
};

  const joinEvent = async function (eventID) {
    isLoading.value = true;
    
    // Get the token from local storage    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/event/add/' + eventID, {   
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });

        //console.log(response);

        if (!response.ok) {
            const data = await response.json(); // Parse the JSON response
            alert(data.error); // Access the error message from the response
            throw new Error(data.error);
        } else {
            alert("Successfully enrolled in the event.");
        }

    } catch (error) {
        alert(error);
        // Handle the error as needed
    } finally {
        isLoading.value = false;
    }
}

const onPageChange = (p) => {
        page.value = p;
        loadAsyncData();
  };

onMounted(() => {
      loadAsyncData();
});

// timeAgo.js function
function timeAgo(timestamp) {
  const now = new Date();
  const updatedTime = new Date(timestamp);

  const timeDifference = now - updatedTime;
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  } else if (months > 0) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (seconds > 0) {
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
  } else {
    return 'just now';
  }
}

const isFewEvents = computed(() => events.value.length <= 2);

</script>

<template>
  <div class="container" id="containerWhole" v-if="!isLoading">
    <div class="container" id="containerWhole2">
      <div class="row">
        <div class="container" id="containerVol">
          <span style="color: blue;">Home </span> / Events
        </div>
        <div class="col" id="buttonNew" >
          <router-link v-if="showVolunteersOption" to="/event/new" class="btn btn-primary btn-lg">New</router-link>
        </div>
      </div>
      <div class="container-medium" id="cardPos"
      :class="{ 'full-screen-card-group': isFewEvents }">
        <!-- Upper Container -->
          <div class="card-group" v-if="events.length > 0">
            <div v-for="(event, index) in events.slice(0, 3)" :key="index" class="card col-md-4 padding-1">
              <router-link v-if="event" :to="'/event/detail/' + event._id">
                <img class="card-img-top" :src="event.image" alt="Image cap">
              </router-link>
              <div class="card-body" v-if="event">
                <h3 class="card-title">{{ event.title }}</h3>
                <p class="card-text">{{ event.description }}</p>
                <small class="text-muted">Last updated {{ timeAgo(event.modifiedAt) }}</small>
              </div>

              <!-- v-if = event idi fakat degistiriyorum, also for homeview -->
              <div class="container" id="buttonEdit" v-if="showVolunteersOption">
                <router-link :to="'/event/edit/' + event._id" class="btn btn-outline-primary btn-lg">Edit</router-link>
              </div>
              <div class="container" id="buttonJoin" v-if="showMyEventsOption">
                <button class="btn btn-outline-primary btn-lg" v-on:click="joinEvent(event._id)">Join</button>
              </div>
            </div>
          </div>
          <div class="container" id="mid_cont">
            
          </div>
          <!-- Lower Container -->
          <div class="card-group" v-if="events.length > 3">
            <div v-for="(event, index) in events.slice(3)" :key="index" class="card col-md-4 padding-1">
              <router-link v-if="event" :to="'/event/detail/' + event._id">
                <img class="card-img-top" :src="event.image" alt="Image cap">
              </router-link>

              <div class="card-body" v-if="event">
                <h3 class="card-title">{{ event.title }}</h3>
                <p class="card-text">{{ event.description }}</p>
                <small class="text-muted">Last updated {{ timeAgo(event.modifiedAt) }}</small>
              </div>

              <!-- v-if = event idi fakat degistiriyorum, also for homeview -->
              <div class="container" id="buttonEdit" v-if="showVolunteersOption">
                <router-link :to="'/event/edit/' + event._id" class="btn btn-outline-primary btn-lg">Edit</router-link>
              </div>
              <div class="container" id="buttonJoin" v-if="showMyEventsOption">
                <button class="btn btn-outline-primary btn-lg" v-on:click="joinEvent(event._id)">Join</button>
              </div>
            </div>
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
  </div>

  <div v-else class="loading-container">
    <Square :loading="isLoading"></Square>
  </div>

</template>


<style scoped>
  .full-screen-card-group {
    display: flex;
  flex-direction: column;
  height: 100vh;
}
  .padding-1{
      padding-right:0.05rem;
      padding-left:0.05rem;
  }

  #mid_cont{
    margin: 15px;
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  #containerWhole{
      position: absolute;
      top:5rem;
      right: 0;
      left: 0;
  }

  #containerWhole2{
      position: absolute;
      top:1rem;
      right: 0;
      left: 0;
  }


  #containerVol{
      background-color: #E9ECEF;
      
      border-radius: 10px;
      left: 1rem;

      font-size:20px; 
      width:fit-content; 
      width:-webkit-fit-content; 
      width:-moz-fit-content;
      padding: .50rem;
      left:1rem;

  }

  #cardPos{
      position: relative;
      top: 2rem;
  }

  .card-img-top{
      height: 300px;
      background-color: rgb(92, 64, 64);
      background-position: center;
      background-size: cover;
  }

  #buttonNew{
    text-align: right;
  }

  #buttonEdit{
    text-align: right;
    bottom: 3rem;
    margin-bottom: 1rem;
  }

  #buttonJoin{
    text-align: right;
    bottom: 3rem;
    margin-bottom: 1rem;

  }

  #pages2{
    margin-top: 1rem;
    top:1rem;
    bottom: 0;
    left:0;
    
  }

</style>