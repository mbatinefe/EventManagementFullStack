<script setup>

import { ref, onMounted } from "vue";
import Square from "../components/SquareLoading.vue";
import router from '../router/index.js';

const userRole = localStorage.getItem('userRole') || '';

const isLoading = ref(false);

const ageOptions = [];
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
    terms: ref(false),
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
    // Check if the email exists
    const isEmailExist = await checkEmail();

    if (isEmailExist) {
        // If the email exists, alert the user and stop further processing
        alert("Email already exists. Please enter another email.");
        isLoading.value = false;
        return;
    }

    // post the booking to the backend
    //console.log("Volunteer: ",volunteer);
    const response = await fetch('/api/become/volunteers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(volunteer.value)
    });
    // convert the response to json
    const json = await response.json();
    // log the json
    //console.log(json);
    // alert the user
    isLoading.value = false;
    alert(JSON.stringify(json));
    router.push("/login");
}

onMounted(() => {
  if(userRole === 'volunteer' || userRole === 'admin' ){
    alert("Only non-volunteer can see. Please logout to become volunteer!")
    router.push('/login');
  }
});

</script>

<template>
    <main>
    <!-- Become Volunteer Form Setup -->
        <form class="row g-10s" v-if="!isLoading" @submit.prevent="submitVolunteer">
            <div class="container mt-2" id="containerLeft">
                <div class="container mt-4">
                    <div class="col-md-7" id="containerVol">
                        <span style="color: blue;">Home</span> / Become volunteer! 
                    </div>
                </div>

                <div class="container mt-4">
                    <div class="container-fluid" id="containerRight">
                        <div class="card mb-3">
                            <img class="card-img-top" id="sss1" src="https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/HKBU_Logo.svg/1200px-HKBU_Logo.svg.png" alt="Card image cap">
                            <div class="card-body" id="sss2">
                            <h5 class="card-title" id="colorVol">Become a volunteer!</h5>
                            <p class="card-text"  id="colorText">You time and talent can make a real different in people's life.</p>
                            
                            </div>
                        </div>
                    </div>
                    <div class="col-12">
                        <label for="inputEmail4" class="form-label">Email</label>
                        <input type="email" class="form-control" v-model="volunteer.email" id="inputEmail4" required>
                    </div>
                    
                </div>

                <div class="container mt-3">
                    <div class="col-12">
                        <label for="inputPassword4" class="form-label">Password</label>
                        <input type="password" class="form-control" v-model="volunteer.password" id="inputPassword4" required>
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
                            <option v-for="age in ageOptions" :key="age.value" :value="age.value" >
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
                            <input class="form-check-input" v-model="volunteer.terms" type="checkbox" id="gridCheck" >
                            <label class="form-check-label" for="gridCheck">
                                Agree to terms and conditions
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="container mt-3">
                    <div class="col-12">
                        <button type="submit" class="btn btn-primary" v-on:click="submitVolunteer">Register</button>
                    </div>
                </div>

            </div>
        </form>
        <div v-else class="loading-container">
            <Square :loading="isLoading"></Square>
        </div>
    </main>
</template>

<style>

@media (max-width: 600px) {
    #containerLeft,
    #containerRight {
        width: 100%;
    }
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

#containerLeft{
    position: absolute;
    left: 0; 
    top: 3rem; 
    padding: 10px;
    width: 50%; 
}

#containerRight{
    position: fixed;
    right: 0;
    width: 50%; 
    
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