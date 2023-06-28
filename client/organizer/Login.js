import React from 'react';
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, auth } from '../util/firebase';
import { goBack } from '../util/navigate';
import { Center, Clickable, Pad } from '../component/basics';
import { Image, View } from 'react-native';


export function LoginScreen() {
    async function handleGoogleSignIn() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            goBack();
        } catch (error) {
            console.error(error);
        }
    };

  return (
    <View>
        <Pad/>
        <Center>
            <Clickable onPress={handleGoogleSignIn}>
                <Image source={require('../assets/google_signin.png')} style={{width: 200, height: 50}} />
            </Clickable>
        </Center>
    </View>
  );
};
