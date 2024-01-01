<!-- JS -->
<script setup>
import { ref, onMounted, watch, computed } from "vue";
import Square from "../components/SquareLoading.vue";

import { useRoute } from 'vue-router';
import NotFound from "../components/NotFound.vue";

const route = useRoute();

const events = ref([]);
const total = ref(0);
const isLoading = ref(true);
const isFound = ref(false);

const totalPages = ref(1);

const page = ref(1);
const title = ref('');

const loadAsyncData = () => {
    const params = [
        `title=${route.query.title || '' || title.value}`,
        `page=${page.value}`,
    ].join("&");
    isLoading.value = true;
    isFound.value = '';
    fetch(`/api/event/search?${params}`)
        .then((response) => response.json())
        .then((result) => {

            if(route.query.title != ''){
              title.value = route.query.title;
            }

            let currentTotal = result.total;

            total.value = currentTotal;
            totalPages.value = result.totalPages;

            if(totalPages.value == 0){
              isFound.value = false;
            } else{
              isFound.value = true;
            }

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

// Watch for changes in the search parameter
watch(() => route.query.title, (newTitle) => {
  title.value = newTitle || '';
  loadAsyncData();
});

/*
* Handle page-change event
*/
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

</script>

<template>

  <div class="container" id="containerWhole" v-if="!isLoading">
    <div class="container" id="containerWhole2">
      <div class="row">
        <div class="col-6" id="containerVol">
          <span style="color: blue;">Home </span> / search
        </div>
      </div>

      <div class="container-medium" id="cardPos" v-if="(route.query.title || title.value === '') && isFound">
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

              <div class="container" id="buttonEdit" v-if="event">   
                <router-link :to="'/event/edit/' + event._id" class="btn btn-outline-primary btn-lg">Edit</router-link>
              </div>
            </div>
          </div>
  
          <div class="container" id="pages2">
            <nav aria-label="Page navigation example">
              <ul class="pagination">
                <li v-for="i in totalPages" :key="i" class="page-item" :class="{ active: i === page}">
                  <!-- Use <a> tag with dynamic href attribute -->
                  <!-- <a class="page-link" :href="`/api/event?page=${i}`" @click="() => updateCurrentPage(i)">{{ i }}</a> -->
                  <a class="page-link" @click="() => onPageChange(i)">{{ i }}</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <div v-else>
          <NotFound :not_found ="isFound"> </NotFound>
        </div>
        
    </div>
  </div>

  <div v-else class="loading-container">
    <Square :loading="isLoading"></Square>
  </div>

</template>


<style scoped>
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

  #pages2{
    margin-top: 1rem;
    top:1rem;
    bottom: 0;
    left:0;
    
  }

</style>