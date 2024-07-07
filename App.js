/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import messaging from '@react-native-firebase/messaging';
import NotifService from './NotifServices';

const App = () => {
  const [registerToken, setRegisterToken] = useState('');
  const [fcmRegistered, setFcmRegistered] = useState(false);
  console.error('fcm token', registerToken);

  const onRegister = token => {
    setRegisterToken(token?.token);
    setFcmRegistered(true);
  };

  const onNotif = notif => {
    Alert.alert(notif?.title, notif?.message);
  };
  const notif = new NotifService(onRegister, onNotif);

  const handlePerm = perms => {
    Alert.alert('Permissions', JSON.stringify(perms));
  };

  const handleLogin = async () => {
    try {
      // Request permission to access the device's notifications
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        // Get the device token
        const fcmToken = await messaging().getToken();

        console.error('fcm token login', fcmToken);

        // Send the fcmToken to your backend API for storing or further processing
        // You can use your preferred HTTP library (e.g., axios, fetch) to send the token to your server
        // Example using fetch:
        // const response = await fetch('https://your-backend-api.com/store-fcm-token', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ fcmToken }),
        // });

        // if (response.ok) {
        //   console.log('FCM Token sent to the server successfully.');
        // } else {
        //   console.error('Failed to send FCM Token to the server.');
        // }
      } else {
        console.log('Permission denied');
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };

  useEffect(() => {
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      // Handle foreground notifications
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      // notif.localNotif();
    });

    const unsubscribeOnNotificationOpenedApp =
      messaging().onNotificationOpenedApp(remoteMessage => {
        // Handle notifications when the app is opened from a background state
        console.log(
          'Notification opened by tapping on it:',
          JSON.stringify(remoteMessage),
        );
        // notif.localNotif();
      });

    const unsubscribeOnBackgroundMessage =
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        // Handle background notifications (when the app is in the background or terminated)
        console.log(
          'Message handled in the background!',
          JSON.stringify(remoteMessage),
        );
        // notif.localNotif();
      });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
      unsubscribeOnBackgroundMessage();
    };
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Example app react-native-push-notification
      </Text>
      <Button title="Login" onPress={handleLogin} />
      <View style={styles.spacer}></View>
      <TextInput
        style={styles.textField}
        value={registerToken}
        placeholder="Register token"
      />
      <View style={styles.spacer}></View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          notif.localNotif();
        }}>
        <Text style={{color: 'white'}}>Local Notification (now)</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          notif.localNotif('sample.mp3');
        }}>
        <Text style={{color: 'white'}}>
          Local Notification with sound (now)
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          notif.scheduleNotif();
        }}>
        <Text style={{color: 'white'}}>Schedule Notification in 30s</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          notif.scheduleNotif('sample.mp3');
        }}>
        <Text style={{color: 'white'}}>
          Schedule Notification with sound in 30s
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          notif.cancelNotif();
        }}>
        <Text style={{color: 'white'}}>Cancel last notification (if any)</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          notif.cancelAll();
        }}>
        <Text style={{color: 'white'}}>Cancel all notifications</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          notif.checkPermission(handlePerm());
        }}>
        <Text style={{color: 'white'}}>Check Permission</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          notif.requestPermissions();
        }}>
        <Text style={{color: 'white'}}>Request Permissions</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          notif.abandonPermissions();
        }}>
        <Text style={{color: 'white'}}>Abandon Permissions</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          notif.getScheduledLocalNotifications(notifs => console.log(notifs));
        }}>
        <Text style={{color: 'white'}}>
          Console.Log Scheduled Local Notifications
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          notif.getDeliveredNotifications(notifs => console.log(notifs));
        }}>
        <Text style={{color: 'white'}}>
          Console.Log Delivered Notifications
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          notif.createOrUpdateChannel();
        }}>
        <Text style={{color: 'white'}}>Create or update a channel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          notif.popInitialNotification();
        }}>
        <Text style={{color: 'white'}}>popInitialNotification</Text>
      </TouchableOpacity>

      <View style={styles.spacer}></View>

      {fcmRegistered && <Text>FCM Configured !</Text>}

      <View style={styles.spacer}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  button: {
    borderWidth: 1,
    borderColor: '#000000',
    margin: 5,
    padding: 5,
    width: '70%',
    backgroundColor: 'black',
    borderRadius: 5,
  },
  textField: {
    borderWidth: 1,
    borderColor: '#AAAAAA',
    margin: 5,
    padding: 5,
    width: '70%',
  },
  spacer: {
    height: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default App;
