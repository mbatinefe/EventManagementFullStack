<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const searchValue = ref('');
const router = useRouter();
const userRole = ref(localStorage.getItem('userRole') || '');

const showVolunteersOption = ref(userRole.value == 'admin');  // Added a ref for conditional rendering
const showMyEventsOption = ref(userRole.value == 'volunteer');  // Added a ref for conditional rendering

const logoutA = function() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  location.reload()
}

const logoutV = function() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  location.reload()
}

const goToSearch = () => {
  router.push({ name: 'search-event', query: { title: searchValue.value } });

};

const goToLogin = () => {
  router.push({ name: 'login' });

};

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

</script>

<template>
  <header>
    <!-- Navbar -->
     <div class="fixed-top">
        <nav class="navbar fixed-top navbar-expand-sm navbar-light" id="navbar123">
        <a 
            href="#" 
            class="navbar-brand mb-0 h1">
                Navbar
        </a>
    
        <button 
            type="button" 
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            class="navbar-toggler"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
            >
                <span class="navbar-toggler-icon"></span>
        </button>
        
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item" :class="{ 'active': $route.path === '/'  && $route.path !== '/myevents' }">
                        <a href="/" class="nav-link">
                            Home
                        </a>
                    </li>
                    <li class="nav-item" :class="{ 'active': $route.path !== '/' && $route.path !== '/myevents' }">
                        <a href="/event" class="nav-link">
                            Events
                        </a>
                    </li>

                    <li class="nav-item" :class="{ 'active': $route.path === '/myevents' }" v-if="showMyEventsOption">
                        <a href="/myevents" class="nav-link">
                            My Events
                        </a>
                    </li>

                    <li class="nav-item" :class="darker-list-item"  v-if="!showVolunteersOption && !showMyEventsOption">
                        <a href="/become/volunteer" class="nav-link">
                            Become volunteer
                        </a>
                    </li>

                    <li id="vol-box" class="nav-item" :class="darker-list-item"  v-if="showVolunteersOption">
                        <a href="/volunteers" class="nav-link">
                            Volunteers
                        </a>
                    </li>
                </ul>

                <div class="ml-auto d-flex">
                    <div id="searchBox" class="input-group input-group-md">
                        <input
                            id="searchBox"
                            class="form-control"
                            aria-label="Search"
                            aria-describedby="inputGroup-sizing-sm"
                            v-model="searchValue"
                            placeholder="Search..."
                            />
                    </div>
                    
                    <button id="search-but" type="button" class="btn btn-outline-success" @click="goToSearch">Search</button>      
                </div>
                <div class="ml" v-if="showMyEventsOption">
                    <button id="logout-but-A" type="button" class="btn btn-outline-primary" @click="logoutA">Logout</button>      
                </div>
                <div class="ml" v-else-if="showVolunteersOption">
                    <button id="logout-but-V" type="button" class="btn btn-outline-primary" @click="logoutV">Logout</button>      
                </div>
                <div class="ml" v-else>
                    <button id="login-but" type="button" class="btn btn-primary" @click="goToLogin">Login</button>      
                </div>
            </div>
        </nav>
        </div>
    <RouterView />
  </header>

</template>

<style scoped>

#navbar123{
    background-color: #F8F9FA;
    position: sticky;
    
}

.btn-outline-success {
  border-color: green;
  
}

.btn-outline-primary{
    border-color: blue;
}
#search-but{
    margin-right: 10px;
}

#logout-but-A{
    margin-right: 10px;
    margin-left: 0;
}   

#logout-but-V{
    margin-right: 10px;
    margin-left: 0;
}

#login-but{
    margin-right: 10px;
    margin-left: 0;
}


#vol-box{
    padding-left: 30px;
}

#searchBox {
    padding-right: 5px;
}

#searchBox input {
  margin-right: 6px;
}

</style>
