<script setup>

import { ref, onMounted, watch, computed } from "vue";
import Square from "../components/SquareLoading.vue";

import { useRoute} from "vue-router";
import router from "../router";
const route = useRoute();

const isLoading = ref(true);
const events = ref([]);

// Get the token from local storage    
const token = localStorage.getItem('token');
const userRole = ref(localStorage.getItem('userRole') || '');

const isEditable = ref(true);

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

// Check if the email exist on the system
const checkEmail = async function () {
    var url = '/api/check/email';
    var method = 'POST';
    var header = {
                'Content-Type': 'application/json'
                }

    // post the booking to the backend
    const response = await fetch(url, {
        method: method,
        headers: header,
        body: JSON.stringify({email: volunteer.value.email})
    });
    // convert the response to json
    const json = await response.json();

    // Check for an error message in the JSON response
    if (json.error) {
        // Email exists in the system
        isLoading.value = false;
        return true;
    } else {
        // Email does not exist in the system
        return false;
    }
}

const submitVolunteer = async function () {
    isLoading.value = true;
    
    if(!route.params.id){
        // Check if the email exists
        const isEmailExist = await checkEmail();

        if (isEmailExist) {
            // If the email exists, alert the user and stop further processing
            alert("Email already exists. Please enter another email.");
            isLoading.value = false;
            return;
        }
    }

    var url = '/api/become/volunteers';
    var method = 'POST';

    var header = {
                'Content-Type': 'application/json'
                }
    if (route.params.id) {
        url = url + '/' + volunteer.value._id;
        method = 'PUT';
        header.Authorization = `Bearer ${token}`;
    }
    // post the booking to the backend
    const response = await fetch(url, {
        method: method,
        headers: header,
        body: JSON.stringify(volunteer.value)
    });
    // convert the response to json
    const json = await response.json();
    // log the json
    // console.log(json);
    // alert the user
    alert(JSON.stringify(json));
    router.push("/volunteers");
}

const getVolunteer = async function () {
    isLoading.value = true;
    try {
        // Check if route.params.id exists
        if (route.params.id) {
            const response = await fetch('/api/volunteer/' + route.params.id,
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
                // GET /api/ev/volunteer
                // Get name of the events.
                getVolunteerEvents();

            } else {
                // If no volunteer data, treat it as an empty form
                console.log('No volunteer data found for the given ID.');
            }
        } else {
            isEditable.value = false;
            if(userRole.value === "admin"){
                console.log('No ID provided. Treating as an empty form.');
                isLoading.value = false;
            } else{
                alert("Please login as admin to continue.")
                router.push("/login");
            }
        }
    } catch (error) {
        alert('Error fetching volunteer. Please Sign with Authorized Credentials.', error);
        router.push("/login");
    }
};

const getVolunteerEvents = async function () {
    
    isLoading.value = true;
    const eventsJoined = volunteer.value.eventsJoined || [];

    try {
        const response = await fetch(`/api/voladmin/event`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({eventsJoined}),
        })
        .then((response) => response.json())
        .then((result) => {
            events.value = result.events.map((item) => {
                return item;
            });
        })
        .catch((error) => {
            events.value = [];
            isLoading.value = false;
            throw error;
        });

    } catch (error) {
        alert('Error fetching volunteer event. Please Sign with Authorized Credentials.', error);
        router.push("/login");
    } finally {
        isLoading.value = false;
    }
    
};

const deleteVolunteer = async function () {
    isLoading.value = true;
    
    // console.log("Auth", token);
    const response = await fetch('/api/volunteer/delete/' + volunteer.value._id, {
        method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
    });
    
    //console.log("Response", response);
    if (!response.ok) {
        isLoading.value = false;
        throw new Error(response.statusText);
    }

    // convert the response to json
    const json = await response.json();
    // log the json
    // console.log(json);
    // alert the user
    isLoading.value = false;
    alert(JSON.stringify(json));

}

const removeEvent = async function (eventID) {
    isLoading.value = true;
    // Get the token from local storage    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/event/remove/' + eventID,
        {   
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                 Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                volID: route.params.id,
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
    isLoading.value = true;
    await getVolunteer();
});
const isUpdateVolunteer = computed(() => route.params !== 'update-volunteer');
const passwordInputType = computed(() => isUpdateVolunteer.value ? 'password' : 'text');
const labelForPassword = computed(() => isUpdateVolunteer.value ? 'Password' : 'Reset Password' );
const hasId = computed(() => route.params.id !== undefined);

</script>

<template>
        <div class="row" v-if="!isLoading">
            <div class="col-md-6" id="containerLeft">
                <form class="row g-3s" @submit.prevent="submitVolunteer" >
                    <div class="container mt-4">
                        <div class="col-12" id="containerVol" v-if="isEditable">
                            <span style="color: blue;">Home / Volunteers </span> / Edit 
                        </div>
                        <div class="col-12" id="containerVol" v-else>
                            <span style="color: blue;">Home / Volunteers </span> / New 
                        </div>
                    </div>
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
                            <select class="form-control" v-model="volunteer.age" id="inputAge" required>
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
                            <textarea class="form-control" v-model="volunteer.remark" id="inputRemark" rows="3"></textarea>
                        </div>
                    </div>

                    <div class="container mt-3">
                        <div class="col-12">
                            <div class="form-check">
                                <input class="form-check-input" v-model="volunteer.terms" type="checkbox" id="gridCheck" required>
                                <label class="form-check-label" for="gridCheck">
                                    agree to terms and conditions
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="container mt-3">
                        <div class="col-12">

                                <button type="submit" class="btn btn-primary" v-on:click="submitVolunteer">Save</button>

                        </div>
                    </div>
                </form>
            </div>

            <div class="col-md-6" id="containerRight" v-if="(!isLoading) && (isEditable)">
                    <div class="container mt-5" id="buttonDel">


                        <router-link :to="'/volunteers'" v-if="hasId">
                            <button class="btn btn-danger btn-lg" type="button" v-on:click="deleteVolunteer">
                                Delete
                            </button>
                        </router-link>
                        <button v-else class="btn btn-danger btn-lg" type="button" disabled>
                            Delete
                        </button>
                    </div> 

                    <div class="container mt-5" id="eventsTitle">
                        <div class="row">
                            <div class="col-6">
                                <o-table :data="isEmpty ? [] : events" :mobile-cards="false">
                                    <o-table-column v-slot="props" field="title" label="Event title">
                                        {{ props.row.title !== '' ? props.row.title : '#NULL#' }}
                                    </o-table-column>
                                </o-table>
                            </div>
                            <div class="col-6" >
                                <o-table 
                                :data="isEmpty ? [] : events"
                                :mobile-cards=false
                                >
                                    <o-table-column 
                                        v-slot="props"
                                        field="edit-action"
                                        label="Action"
                                        id="buttonEditEvent">
                                        <router-link :to="'/event/edit/' + props.row._id" class="my-button">Edit</router-link>

                                    </o-table-column>

                                    <o-table-column 
                                        v-slot="props"
                                        field="delete-action"
                                        id="buttonDelVolEvent">
                                            <button @click="removeEvent(props.row._id)" class="btn btn-danger btn-sm">X</button>
                                    </o-table-column>

                                </o-table>

                            </div>
                        </div>

                    </div>
            </div>
        </div>
        <div v-else class="loading-container">
            <Square :loading="isLoading"></Square>
        </div>
</template>

<style>

#buttonDel{
    right: 0;
}

#containerRight{
    position: relative;
}
#containerLeft{
    position: relative;
}

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

#containerVol{
    background-color: #E9ECEF;
    border-radius: 10px;
    left: 0;

    font-size:20px; 
    width:fit-content; 
    width:-webkit-fit-content; 
    width:-moz-fit-content;
    padding: 0.5rem;
    left:0;
}


#buttonDel{
    position: relative;
    right: 0; 
}

#colorVol{
    color: rgb(128, 128, 128);
    text-wrap: wrap;
    
}
#colorText{
    color: rgb(167, 161, 161);
    text-wrap: wrap;
}

.form-group{
    left: 1rem;
    position: relative;
}

#sss1{
    height: 220px;
}
#sss2{
    height: 200px;
    border-top-color: solid;
    border-top-color: gray;
}
</style>