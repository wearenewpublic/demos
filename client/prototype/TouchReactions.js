import { BigTitle, Card, ListItem} from "../component/basics";
import { authorZDFDigital } from "../data/authors";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScrollView, Text, View} from 'react-native';
import { HapticEmojiScreen } from "../contrib/zdf/touchReactionsComponents/hapticEmoji";
import { HapticTapPanel} from "../contrib/zdf/touchReactionsComponents/hapticTaps";
import { HapticChatScreen } from "../contrib/zdf/touchReactionsComponents/hapticChat";
import { HapticScribbleScreen } from "../contrib/zdf/touchReactionsComponents/hapticScribbleScreen";
import { Vibrator } from "../contrib/zdf/touchReactionsComponents/vibrationPlayer";
import { useEffect, useState } from "react";

const description = `
A technical prototype that explores the possibilities of incorporating smartphone haptics into online interactions with the goal of making them feel more natural and personal. Currently, it contains the following interactive features:

- Haptic Emojis: Reaction gifs with an underlying fitting vibration pattern

- Haptic Taps: Record touch-based visual and haptic events

- Haptic Scribble: Draw a picture and send it as a message. The vibration pattern changes based on speed

These features are integrated in a simple chat screen, offering them in a more realistic use case.

Note: Currently, vibration is only working on mobile Android browsers. For more control over vibration patterns, a native implementation would be necessary.

Animations are taken from [https://googlefonts.github.io/noto-emoji-animation/](https://googlefonts.github.io/noto-emoji-animation/)`

export const TouchReactionsPrototype = {
    key: 'touchreactions',
    name: 'Touch Reactions',
    author: authorZDFDigital,
    date: '2023-11-15',
    description,
    screen: TouchFunctionsScreen,
    mobile: true,
    instance: [
        {key: 'touch', name: 'Touch Reactions', message: []}
    ],
    newInstanceParams: []
}

const Stack = createNativeStackNavigator();

export function TouchFunctionsScreen() {

    const [playing, setPlaying] = useState(false)
    const [showIndicator, setShowIndicator] = useState(false);
    Vibrator.setPlayerStatus = setPlaying;

    // Simple vibration indicator
    // {playing ? <Text style={{position: "absolute", bottom: 0, backgroundColor: "red", borderRadius:10}}> VIBRATING </Text> :  <></>}

    return (
        <NavigationContainer independent>
            <Stack.Navigator initialRouteName="Haptic Chat">
                <Stack.Screen name="Touch Reactions Overview" component={HomeScreen} />
                <Stack.Screen name="Haptic Scribble" component={HapticScribbleScreen} />
                <Stack.Screen name="Haptic Emoji" component={HapticEmojiScreen} />
                <Stack.Screen name="Haptic Taps" component={HapticTapPanel} />
                <Stack.Screen name="Haptic Chat" component={HapticChatScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

function HomeScreen( { navigation }) {
    return (
        <ScrollView>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Card>
                    <BigTitle>Haptic Chat</BigTitle>
                    <ListItem title={"Haptic Chat"} onPress={() => navigation.navigate('Haptic Chat')} ></ListItem>
                </Card>
                <Card>
                    <BigTitle>Haptic Emojis</BigTitle>
                    <ListItem title={"Heart Reaction"} onPress={() => navigation.navigate('Haptic Emoji', {emoji: "heart"})} ></ListItem>
                    <ListItem title={"Fire Reaction"} onPress={() => navigation.navigate('Haptic Emoji', {emoji: "fire"})} ></ListItem>
                    <ListItem title={"Clap Reaction"} onPress={() => navigation.navigate('Haptic Emoji', {emoji: "clap"})} ></ListItem>
                </Card>
                <Card>
                    <BigTitle>Haptic Taps</BigTitle>
                    <ListItem title={"Haptic Taps"} onPress={() => navigation.navigate('Haptic Taps', {emoji: "clap"})} ></ListItem>
                </Card>
                <Card>
                    <BigTitle>Haptic Scribbling</BigTitle>
                    <ListItem title={"Haptic Scribble"} onPress={() => navigation.navigate('Haptic Scribble')} ></ListItem>
                </Card>
            </View>
        </ScrollView>
    );
}

