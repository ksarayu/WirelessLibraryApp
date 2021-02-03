import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';


import firebase from 'firebase';
import fs from '../Config';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal'
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }

    initiateBookIssue = async () => {
      fs.collection("Transaction").add({
        bookID : this.state.scannedBookId,
        studentID : this.state.scannedStudentId,
        date : firebase.firestore.TIMESTAMP.now().toDate(),
        transactionType : "Issue"
      })

      fs.collection("Books").doc(this.state.scannedBookId).update({
        Availability : false
      })

      fs.collection("Students").doc(this.state.scannedStudentId).update({
        BooksInPossesion : firebase.firestore.FieldValue.increment(1)
      })

      this.setState({
        scannedBookId : '',
        scannedStudentId : ''
      })

      //Alert.alert("Book Issue successful")
      ToastAndroid.show("Book Issue successful", ToastAndroid.LONG)
    }

    initiateBookReturn = async () => {
      fs.collection("Transaction").add({
        bookID : this.state.scannedBookId,
        studentID : this.state.scannedStudentId,
        date : firebase.firestore.TIMESTAMP.now().toDate(),
        transactionType : "Return"
      })

      fs.collection("Books").doc(this.state.scannedBookId).update({
        Availability : true
      })

      fs.collection("Students").doc(this.state.scannedStudentId).update({
        BooksInPossesion : firebase.firestore.FieldValue.increment(-1)
      })

      this.setState({
        scannedBookId : '',
        scannedStudentId : ''
      })

      //Alert.alert("Book Return successful")
      ToastAndroid.show("Book Return successful", ToastAndroid.LONG)
    }

    handleTransaction = async () => {
      fs.collection("Books").doc(this.state.scannedBookId).get()
      .then((doc) => {
        var book = doc.data();
        if(book.Availability){
          this.initiateBookIssue()
        }
        else{
          this.initiateBookReturn()
        }
      })
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView 
          style={styles.container}
          behavior = {'padding'}
          enabled = {true}>

            <View>
              <Image
                source={require("../assets/images/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}> Wireless Library </Text>
            </View>

            <View style={styles.inputView}>
              <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              value={this.state.scannedBookId}
              onChangeText = {(text) => {
                this.setState({
                  scannedBookId : text
                })
              }}/>

              <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputView}>
              <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              value={this.state.scannedStudentId}
              onChangeText = {(text) => {
                this.setState({
                  scannedStudentId : text
                })
              }}/>

              <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity
              style = {styling.submitButton}
              onPress = {async () => {
                this.handleTransaction
              }}>
                <Text style = {styling.submitButtonText}> Submit </Text>
              </TouchableOpacity>
            </View>

          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10,
      color : 'white'
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: 'cadetblue',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor: 'white',
      width: 50,
      borderWidth: 1.5,
      borderColor : "cadetblue"
    },
    submitButtonText : {
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10,
      color : 'cadetblue'
    }
  });