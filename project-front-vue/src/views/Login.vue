<script setup>
// imports
import { ref, onMounted, watch, computed } from "vue";
import Square from "../components/SquareLoading.vue";

const isLoading = ref(true);
const userRole = ref(localStorage.getItem('userRole') || '');

// credentials
const credentials = ref({
    email: '',
    password: ''
});


// methods
const login = async () => {
    try {
        // fetch
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials.value)
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }
        
        // response
        const data = await response.json();

        //console.log(data);

        // Set login status to true in the shared state
        if(data.userRole === 'volunteer'){
            console.log('Welcome Volunteer'+ data.userRole);
            localStorage.setItem('userRole', data.userRole);
            userRole.value = data.userRole;

        }else{
            console.log('Welcome Admin:' + data.userRole);
            localStorage.setItem('userRole', data.userRole);
            userRole.value = data.userRole;

        }

        // save token to local storage
        localStorage.setItem('token', data.token);
        location.reload();

        //router.push("/");
        // alert the user
        alert("Welcome dear " + data.userRole + "!");

    } catch (error) {
        alert(error);
    }
}

</script>

<template>
    <main>
        <form @submit.prevent="login()">
            <div id="sss" class="container">
                <div class="mb-3 row">
                    <label for="exampleInputEmail1" class="col-sm-3 col-form-label">Email</label>
                    <div class="col-sm-9">
                        <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" v-model="credentials.email" required>
                    </div>
                </div>
                <div class="mb-3 row">
                    <label for="exampleInputPassword1" class="col-sm-3 col-form-label">Password</label>
                    <div class="col-sm-9">
                        <input type="password" class="form-control" id="exampleInputPassword1" v-model="credentials.password" required>
                        <button id="submit-button" type="submit" class="btn btn-primary" >Submit</button>       
                    </div>
                </div>   
            </div>
        </form>
    </main>
</template>



<style>

#sss{
    position: fixed;
    left: 0; 
    right: 0;
    top: 10rem;
}

#submit-button{
    margin-top: 12px;
}
</style>