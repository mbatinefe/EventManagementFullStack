<script setup>
import { ref, onMounted, watch, computed } from "vue";
import Square from "../components/SquareLoading.vue";
import router from "../router";

const isLoading = ref(true);

// Get the token from local storage    
const token = localStorage.getItem('token');
const userRole = ref(localStorage.getItem('userRole') || '');
const total = ref(0);
const totalPages = ref(1);
const page = ref(1);
const events = ref([]);

const statDraft = ref([]);
const options = ref({
    chart: {
        type: 'donut',
    },
    legend: {
        show: false, // Set this to false to hide the legend
    },
    // ... (other chart options) ...
});

const series = ref([]);



const ageOptions = [];
// Generate age options from 16 to 70
for (let age = 16; age <= 50; age++) {
  const label = age === 50 ? '50+' : `${age}-${age + 2}`;
  age = age + 1;
  ageOptions.push({ label, value: label });
}

const volunteer = ref({
    email: '',
    password: '',
    name:'',
    phone:'',
    age:'',
    remark: '',
    terms: false,
    eventsJoined: []
})

const getVolunteer = async function () {
    try {
        // Check if route.params.id exists
        if (userRole.value == 'volunteer') {
            const response = await fetch('/api/getsingle/volunteer',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            
            );
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const json = await response.json();

            // Check if volunteer data exists in the response
            if (json.volunteer) {
                volunteer.value = json.volunteer;
            } else {
                // If no volunteer data, treat it as an empty form
                console.log('No volunteer data found for the given ID.');
            }
        } else {
            console.log('No ID provided. Treating as an empty form.');
        }
    } catch (error) {
        alert('Error fetching volunteer. Please Sign with Authorized Credentials.', error);
        router.push("/login");
    } 
};

onMounted(async () => {
    if(userRole.value !== 'volunteer'){
      alert("Only non-volunteer can see. Please logout to become volunteer!")
      router.push('/login');
    }
    isLoading.value = true;
    await getVolunteer();
    loadAsyncData();
});

const loadAsyncData = () => {
    isLoading.value = true;
    const eventsJoined = volunteer.value.eventsJoined || [];
    const params = [
        `page=${page.value}`
    ].join("&");

    fetch(`/api/vol/event?${params}`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({eventsJoined}),
    })
        .then((response) => response.json())
        .then((result) => {
            let currentTotal = result.total;
            total.value = currentTotal;
            totalPages.value = result.totalPages;
            statDraft.value = result.eventstat; 
    
            options.value = { labels: statDraft.value.map((item) => item._id) };
            series.value = statDraft.value.map((item) => item.total);
            console.log(options);
            console.log(series);

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

const submitVolunteer = async function () {
    isLoading.value = true;

    var url = '/api/become/volunteers';
    var method = 'POST';

    var header = {
                'Content-Type': 'application/json'
                }

    url = url + '/' + volunteer.value._id;
    method = 'PUT';
    header.Authorization = `Bearer ${token}`;

    // post the booking to the backend
    const response = await fetch(url, {
        method: method,
        headers: header,
        body: JSON.stringify(volunteer.value)
    });

    // convert the response to json
    const json = await response.json();
    // log the json
    //console.log(json);
    // alert the user
    isLoading.value = false;
    alert(JSON.stringify(json));

}

const onPageChange = (p) => {
    page.value = p;
    loadAsyncData();
};

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
    <div id="main" class="container" v-if="!isLoading">
        <div class="col-md-7" id="containerVol">
            <span style="color: blue;">Home /</span> My Events
        </div>

        <div class="container" id="topC">
            <div class="row" >
                <div class="col-md-6" id="formTopC">
                    <form class="row g-10s" >               
                        <div class="container mt-4">
                            <div class="col-12">
                                <label for="inputEmail4" class="form-label">Email</label>
                                <input type="email" class="form-control" v-model="volunteer.email" id="inputEmail4" required>
                            </div> 
                        </div>

                        <div class="container mt-3">
                            <div v-if="hasId" class="col-12">
                                <label for="inputPassword4" class="form-label">{{ labelForPassword }}</label>
                                <input :type="text" class="form-control" v-model="volunteer.password" id="inputPassword4" required>
                            </div>
                            <div v-else class="col-12">
                                <label for="inputPassword4" class="form-label">{{ labelForPassword }}</label>
                                <input :type="passwordInputType" class="form-control" v-model="volunteer.password" id="inputPassword4" required>
                            </div>
                        </div>
            
                        <div class="container mt-3">
                            <div class="col-12">
                                <label for="inputName4" class="form-label">Name</label>
                                <input type="text" class="form-control" v-model="volunteer.name" id="inputName4" required>
                            </div>
                        </div>
                        
                        <div class="container mt-3">
                            <div class="col-12">
                                <label for="inputPhone" class="form-label">Contact</label>
                                <input type="number" class="form-control" v-model="volunteer.phone" id="inputPhone" placeholder="85212345678" required>
                            </div>
                        </div>

                        <div class="container mt-3">   
                            <div class="col-12">
                                <label for="inputAge">Age group</label>
                                <select class="form-control" v-model="volunteer.age" id="inputAge">
                                    <option disabled value="">Dropdown...</option>
                                    <option v-for="age in ageOptions" :key="age.value" :value="age.value">
                                    {{ age.label }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div class="container mt-3">
                            <div class="col-12">
                                <label for="exampleFormControlTextarea1">About me and remark</label>
                                <textarea class="form-control" v-model="volunteer.remark" id="inputRemark" rows="3" required></textarea>
                            </div>
                        </div>

                        <div class="container mt-3">
                            <div class="col-12">
                                <div class="form-check">
                                    <input class="form-check-input" v-model="volunteer.terms" type="checkbox" id="gridCheck">
                                    <label class="form-check-label" for="gridCheck">
                                        Agree to terms and conditions
                                    </label>      
                                </div>
                            </div>
                        </div>
                        
                    </form>
                    <button type="submit" class="btn btn-primary" v-on:click="submitVolunteer">Save</button>
                </div>

                <div class="col-md-6" id="organizersTopC">
                    <p class="h1" id="eventOrganText">Event Organizers</p>
                    <apexchart type="donut" :options="options" :series="series" />
                </div>
            </div>
           </div>


        <div class="container" id="bottomC">
            <div class="row" id="cardPos">
                <div class="card-group">
                    <div v-for="(event, index) in events" :key="index" class="card">
                        <img class="card-img-top" :src="event.image" :alt="event.title + ' Image'">
                        <div class="card-body">
                            <h3 class="card-title">{{ event.title }}</h3>
                            <p class="card-text">{{ event.description }}</p>
                            <small class="text-muted">Last updated {{timeAgo(event.modifiedAt) }}</small>
                        </div>                                    
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

    <div v-else class="loading-container">
        <Square :loading="isLoading"></Square>
    </div>
    
</template>

<style>

#topC .row {
    display: flex;
    flex-wrap: wrap;
  }
  @media (max-width: 600px) {
    #topC .row {
      flex-direction: column;
    }

    #formTopC,
    #organizersTopC {
      width: 100%;
    }
  }

#eventOrganText{
    margin-bottom: 5px;
}
#pages2{
    margin-top: 2.5rem;
    top:1rem;
    bottom: 0;
    left:0;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh; 
  }

#main{
    position: relative;

    top:3rem;
}

#cardPos {
    position: relative;
    height: 45%;
    top: 2rem;
  }

.card-img-top {
    height: 400px;
    background-color: #817878;
    background-position: center;
    background-size: cover;
}

#containerVol{
    background-color: #E9ECEF;
    border-radius: 10px;
    position: relative;
    font-size:15px; 
    width:fit-content; 
    width:-webkit-fit-content; 
    width:-moz-fit-content;
    padding: 0.5rem;
    padding-left: 0.2rem;
}


#bottomC{
    background-color: rgb(0, 0, 0)67, 28, 28;
}

#update-profile{
    background-color: #E9ECEF;
    border-radius: 10px;
    position: relative;

    font-size:15px; 
    width:fit-content; 
    width:-webkit-fit-content; 
    width:-moz-fit-content;
    padding: 0.5rem;
    padding-left: 0.2rem;
}
</style>