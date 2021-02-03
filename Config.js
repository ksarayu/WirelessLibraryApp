import * as firebase from 'firebase';
//require('@firebase/firestore')

  var firebaseConfig = {
    apiKey: "AIzaSyBeze_XkX4c_soPNOaT-Vc9TW30WXsPO7Q",
    authDomain: "wireless-library-846ba.firebaseapp.com",
    projectId: "wireless-library-846ba",
    storageBucket: "wireless-library-846ba.appspot.com",
    messagingSenderId: "253716527990",
    appId: "1:253716527990:web:7dcbe3eafd576aba09d857"
  };

if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}
else{
  firebase.app()
}

//firebase.initializeApp(firebaseConfig);

export default firebase.firestore()