<script type="module">    
  // Import the functions you need from the SDKs you need    
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";    
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";    
  // TODO: Add SDKs for Firebase products that you want to use    
  // https://firebase.google.com/docs/web/setup#available-libraries    
    
  // Your web app's Firebase configuration    
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional    
  const firebaseConfig = {    
    apiKey: "AIzaSyDKDO_xhyOpMIw_z-FWiubqeBcQdPcpbHY",    
    authDomain: "data365-98916.firebaseapp.com",    
    databaseURL: "https://data365-98916-default-rtdb.firebaseio.com",    
    projectId: "data365-98916",    
    storageBucket: "data365-98916.firebasestorage.app",    
    messagingSenderId: "1090776279878",    
    appId: "1:1090776279878:web:ce755f477bb98aa9019347",    
    measurementId: "G-WDEBPEGWL5"    
  };    
    
  // Initialize Firebase    
  const app = initializeApp(firebaseConfig);    
  const analytics = getAnalytics(app);    
</script>    This is the apiKey, but I did not see enable authentication