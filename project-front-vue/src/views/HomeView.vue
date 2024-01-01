<script setup>

import { ref, onMounted, watch, computed } from "vue";
import Square from "../components/SquareLoading.vue";

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

const joinEvent = async function (eventID) {
    isLoading.value = true;
    // Get the token from local storage    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/event/add/' + eventID,
        {   
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                 Authorization: `Bearer ${token}`,
            }
        }
      
      );
        
      if (!response.ok) {
        alert(response.message);
        throw new Error(response.message);
      } else{
        alert("Succesfully enrolled to the event.")
      }

    } catch (error) {
        alert(error);
        //alert('Error fetching to the event. Please try to Sign-in with Authorized Credentials.');
    } finally {
        isLoading.value = false;
    }
  }


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

const highlightedEvents = ref([]);
const recentEvents = ref([]);
const isLoading = ref(true);


// Fetch data from backend on component mount
onMounted(async () => {
  try {
    
    const response = await fetch("/api/");
    const data = await response.json();

    // console.log("Received data from backend:", data);

    highlightedEvents.value = data.events.filter((event) => event.highlight).slice(0, 3);

    const sortedEvents = data.events.sort((eventA, eventB) => {
      // Compare datetime strings
      return eventA.datetime.localeCompare(eventB.datetime);
    });

    // Get the lowest 3 events
    var lowest3Events = sortedEvents.slice(0, 3);

    // Assign the result to recentEvents.value
    recentEvents.value = lowest3Events;

    isLoading.value = false; 

  } catch (error) {
    console.error("Error fetching data:", error);
    isLoading.value = false; 

  }
});

</script>


<template>
    <div class="container" id="general" v-if="!isLoading">
      <!-- Carousel -->
      <div id="myCarousel" class="carousel slide carousel-fade" data-ride="carousel">
        <ol class="carousel-indicators">
          <li v-for="(event, index) in highlightedEvents" :key="index" :data-target="'#myCarousel'" :data-slide-to="index" :class="{ active: index === 0 }"></li>
        </ol>
        <div class="carousel-inner">
          <div v-for="(event, index) in highlightedEvents" :key="index" class="carousel-item" :class="{ active: index === 0 }" data-interval="500">
            <img class="d-block w-1000" style="object-fit: cover; height: 100%; width: 100%;" :src="event.image" :alt="'Slide ' + (index + 1)">
          </div>
        </div>
        <a class="carousel-control-prev" href="#myCarousel" role="button" data-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" href="#myCarousel" role="button" data-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="sr-only">Next</span>
        </a>
      </div>

      <!-- Menu -->
      <div class="container-medium" id="cardPos">
        <div class="card-group">
          <div class="container" id="recentWhole">
            <p class="border-bottom-0" style="color: rgb(104, 90, 90);" id="recentText">Recent</p>
            <div id="red" style="color:#817878">&nbsp;</div>
          </div>
          <div v-for="(event, index) in recentEvents" :key="index" class="card">
            <img class="card-img-top" :src="event.image" :alt="event.title + ' Image'">
            <div class="card-body">
              <h3 class="card-title">{{ event.title }}</h3>
              <p class="card-text">{{ event.description }}</p>
              <small class="text-muted">Last updated {{timeAgo(event.modifiedAt) }}</small>
            </div>
            <div class="container" id="buttonJoin" v-if="showMyEventsOption">
                <button class="btn btn-outline-primary btn-lg" v-on:click="joinEvent(event._id)">Join</button>
            </div>
                         
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading-container">
      <Square :loading="isLoading"></Square>
    </div>

</template>


<style scoped>
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  #buttonJoin{
    text-align: right;
    bottom: 3rem;
    margin-bottom: 1rem;

  }

  .container {
  width: 100%;

}

  #general {
    position: relative;

  }
  #myCarousel {
    top: 5rem;
  }

  .carousel-item {
    height: 30rem;
    background: #817878;
    color: rgb(78, 76, 76);
    background-position: center;
    background-size: cover;
  }

  .carousel img {
    max-height: 100%;
    max-width: 100%;
    width: fit-content;
    height: max-content;
  }



  #cardPos {
    position: relative;
    height: 45%;
    top: 6rem;
  }

  .card-img-top {
    height: 400px;
    background-color: #817878;
    background-position: center;
    background-size: cover;
  }

  #red{
    background: #817878;
    margin-top: -17px;
    margin-bottom: 3px;
    margin-left: 4.85rem;
    height: 1px;
    z-index: -1;
  }

  #recentText {
    font-size: 20px;
    width: fit-content;
    width: -webkit-fit-content;
    width: -moz-fit-content;
    padding: 0.5rem;
    left: 0;
    border-top: ridge;
    border-right: groove;
    border-left: ridge;
    border-style: 1px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
</style>
