/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  Alert
} from "react-native";
import firebase from "react-native-firebase";

const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\n" +
    "Shake or press menu button for dev menu"
});

type Props = {};
export default class App extends Component<Props> {
  async componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners();
  }

  componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
  }

  async createNotificationListeners() {
    // Triggered when a particular notifincation has been received in foreground
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        const { title, body } = notification;
        this.showAlert(title, body);
      });

    // If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        if (notificationOpen) {
          const { title, body } = notificationOpen.notification;
          this.showAlert(title, body);
        }
      });

    // If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
      this.showAlert(title, body);
    }

    // Triggered for data only payload in foreground
    this.messageListener = firebase.messaging().onMessage(message => {
      // process data message
      console.log(JSON.stringify(message));
    });
  }

  showAlert(title, body) {
    Alert.alert(
      title,
      body,
      [{ text: "OK", onPress: () => console.log("OK Pressed") }],
      { cancelable: false }
    );
  }

  // 1 In componentDidMount, we check if user has granted permission to receive push notifications.
  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  // 3. If token was fetched earlier, it can be retrieved from AsyncStorage. If no token is found, request Firebase and save it in AsyncStorage.
  async getToken() {
    let fcmToken = await AsyncStorage.getItem("fcmToken");
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem("fcmToken", fcmToken);
      }
    }
    console.log(fcmToken);
  }

  //  2. If permission hasn’t been granted to our app, request user in requestPermission method.
  //  If permission is successfully assigned, proceed towards token fetch, otherwise gracefully ignore the fact.
  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      //User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log("Permission rejected");
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
