import { Button, Image, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native"
import React, { useEffect, useRef, useState } from "react";
import { vibratingEmojis } from "./vibratingEmojiConfig";
import { VibrationPlayerComponent } from "./vibrationPlayer";

function generateRandomId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomId += characters.charAt(randomIndex);
    }
    return randomId;
}

function randomOrientation() {
    return Math.random() * 180 - 90;
}

function measureComponent(viewRef){
    return new Promise((resolve) => {
        viewRef.current.measure((x, y, width, height, pageX, pageY) => {
            resolve({ x, y, width, height, pageX, pageY });
        });
    });
};


function TapImage({ imageConfig, style, size = 75, position={x:0, y:0}, rotation = 0}) {

    return <View>
            <Image  style={[styles.image, style, {height: size, width: size, left: (position.x - size/2), top: (position.y - size/2), transform: [{rotate:  rotation + "deg"}]}]} source={imageConfig.source}></Image>
            <VibrationPlayerComponent config={imageConfig}></VibrationPlayerComponent>
        </View>
}

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        flexDirection: "column-reverse"
    },
    panel:{
        position: "absolute",
        width: "100%",
        height: "100%"
    },
    recording:{
        position:"absolute",
        opacity:0.6,
        width: "100%",
        height: "100%",
        backgroundColor: "black"
    },
    image: {
        position: Platform.OS === "web" ? "absolute" : "absolute",
    },
    elevated:{
        zIndex: 10
    }
});

export function HapticTapPanel ({emoji="clap", recording = false, tapEvents = [], onFinishPlayCallback=(()=>{}),  onFinishRecordingCallback=((recordings)=>{})}) {

    const emojiConfig = vibratingEmojis[emoji];
    const viewRef = useRef(null);

    const [tapImages, setTapImages] = useState([]);
    const [recordedTapImages, setRecordedTapImages] = useState([]);
    const [time, setTime] = useState(new Date())
    const [recordingStarted, setRecordingStarted] = useState(false);

    const playTaps = async () => {

        const promises = tapEvents.map(async (element) => {
            await new Promise((resolve) => setTimeout(resolve, element.delay));
            const config = vibratingEmojis[element.emoji];
    
            const newTapImage = (
                <TapImage
                    key={generateRandomId(6)}
                    imageConfig={config}
                    size={50 + Math.random() * 100}
                    position={{x: element.x, y: element.y}}
                    rotation={!config.random ? 0 : randomOrientation()}
                />
            );
    
            setTapImages((prevTapImages) => [...prevTapImages, newTapImage]);
    
            await new Promise((resolve) => setTimeout(resolve, config.duration));
    
            setTapImages((prevTapImages) =>
                prevTapImages.filter((image) => image.key !== newTapImage.key)
            );
        });
    
        await Promise.all(promises);
    
        onFinishPlayCallback();
    }

    const handleTap = async (event) => {
        event.persist();

        let { x, y, width, height, pageX, pageY } = await measureComponent(viewRef);

        let locationX, locationY;
        if(Platform.OS == "android" || Platform.OS == "ios"){
            ({ locationX, locationY } = event.nativeEvent);
        } else {
            locationX = (event.clientX) - pageX;
            locationY = (event.clientY) - pageY;
        }

        if(recording){
            const currentTime = new Date();
            let timeElapsed = currentTime.getTime() - time.getTime();
            if(!recordingStarted) {
                setRecordingStarted(true)
                setTime(new Date());
                timeElapsed = 0;
            }
            const recordedEvent = {x: locationX, y: locationY, delay: timeElapsed, emoji:emoji}
            setRecordedTapImages((prev) => 
                [...prev, recordedEvent]
            )
        }

        const newTapImage = (
            <TapImage
                key={generateRandomId(6)}
                imageConfig = {emojiConfig}
                position={{x: locationX, y: locationY}}
                size={50 + Math.random() * 100}
                rotation={!emojiConfig.random ? 0 : randomOrientation()}
            />
        );

        

        setTapImages((prevTapImages) => [...prevTapImages, newTapImage]);
        
        // Remove the image
        setTimeout(() => {
            setTapImages((prevTapImages) =>
                prevTapImages.filter((image) => image.key !== newTapImage.key)
            );
        }, emojiConfig.duration);
    };

    useEffect(() => {
        playTaps()
    },[viewRef])

    return (
        <View style={styles.panel} ref={viewRef}>
            {recording ?
                <View style={styles.recording}></View>
                : <></>
            }  
            {recording ?
                <View style={{ position: "absolute", top: 0, alignItems: "center", width: "100%" }}>
                    <Text style={{fontSize: 20, color: "white"}}> Record your Taps</Text>
                </View>
                : <></>
            }
            {tapImages}
            <TouchableWithoutFeedback style={{position:"absolute"}} onPress={handleTap}>
                <View style={{position:"relative", width:"100%", height:"100%"}}></View>
            </TouchableWithoutFeedback> 
            
            {recording ?
                <View style={{position:"absolute",bottom: 0, width:"100%", justifyContent: "flex-end", alignContent:"center"}}>
                    <View style={{bottom: 24, alignItems: "center", zIndex: 100}}>
                        <Button title="Done" color={"gray"} style={styles.elevated} onPress={() => {onFinishRecordingCallback(recordedTapImages)}}></Button>
                    </View>
                </View>
                : <></>
            } 
        </View>
    );
}