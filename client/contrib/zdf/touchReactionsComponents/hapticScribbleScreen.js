import { Animated, Button, PanResponder, StyleSheet, Text, View } from "react-native"
import React, { useEffect, useRef, useState } from "react";
import { Vibrator } from './vibrationPlayer';

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function measureComponent(viewRef) {
    return new Promise((resolve) => {
        viewRef.current.measure((x, y, width, height, pageX, pageY) => {
            resolve({ x, y, width, height, pageX, pageY });
        });
    });
};



export function HapticScribbleScreen({recording= false, inputStamps = [], onFinishPlayCallback=(()=>{}), onFinishRecordingCallback=((recordings)=>{})}) {
    const pan = useRef(new Animated.ValueXY()).current;
    const viewRef = useRef(null);
    const time = useRef(new Date())
    const [recordedStrokes, setRecordedStrokes] = useState([])

    const recordingStarted = useRef(false);


    Vibrator.SetConfig({pattern:[20], delay: 20}, "scribble")

    const[stamps, setStamps] = useState([])

    const onMoveStamp = async (gestureState, type = "move") => {
        const currentTime = new Date();
        let timeElapsed = currentTime.getTime() - time.current.getTime();
        let { x, y, width, height, pageX, pageY } = await measureComponent(viewRef);
        setStamps((prevStamps) => [...prevStamps, { x: gestureState.moveX, y: gestureState.moveY - pageY, delay: timeElapsed}]);

        if(recording) {
            const currentTime = new Date();
            let timeElapsed = currentTime.getTime() - time.current.getTime();
            if(!recordingStarted.current) {
                recordingStarted.current = true;
                time.current = new Date()
                timeElapsed = 0;
            }
            const recordedEvent = {x: gestureState.moveX, y: gestureState.moveY - pageY, delay: timeElapsed, type: type, vx: gestureState.vx, vy: gestureState.vy}
            setRecordedStrokes((prev) => 
                [...prev, recordedEvent]
            )
        }
    };

  const playStrokes = async () => {
    let lastPosition = { x: 0, y: 0 };
    const promises = [];
  
    for (let stamp of inputStamps) {
        const velocity = { vx: stamp.vx, vy: stamp.vy};
        const velocityMagnitude = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
    
        const promise = new Promise((resolve) => {
            setTimeout(() => {

            if(stamp.type == "start"){
                Vibrator.Play(true, "scribble");
            }
            if(stamp.type == "stop"){
                Vibrator.Stop();
            }
            if(stamp.type == "move"){
                setStamps((prevStamps) => [...prevStamps, { x: stamp.x, y: stamp.y }]);
                Vibrator.speed = clamp((1 / velocityMagnitude), 0.01, 10);
            }
            if(velocityMagnitude <= 0.1){
                Vibrator.Pause()
            } else {
                Vibrator.Resume();
            }
            resolve();
            }, stamp.delay);
        });
        lastPosition = {x: stamp.x, y: stamp.y}
        promises.push(promise);
    }
    await Promise.all(promises);
        
        Vibrator.Stop();
        onFinishPlayCallback();
    };

    useEffect(() => {
        playStrokes()

        return () => {
            Vibrator.Stop()
        }
    },[viewRef])


    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: async (e, gestureState) => {
                const velocityMagnitude = Math.sqrt(gestureState.vx * gestureState.vx + gestureState.vy * gestureState.vy);
                Vibrator.speed = clamp((1/velocityMagnitude), 0, 10);
                

                if(velocityMagnitude < 0.05){
                    Vibrator.Pause()
                    return
                }
                if(Vibrator.paused){
                    Vibrator.Resume()
                }
                onMoveStamp(gestureState)


            },
            onPanResponderGrant: (e, gestureState) => {
                console.log("GRANT", "panel")
                Vibrator.Play(true, "scribble")
                onMoveStamp(gestureState, "start")
            },
            
            onPanResponderRelease: (e, gestureState) => {
                console.log("REleased")
                Vibrator.Stop()
                pan.extractOffset();
                onMoveStamp(gestureState, "stop")
            },
        }),
    ).current;

    const renderStamps = () => {
        const size = 10;
        return stamps.map((position, index) => (
            <View
                key={index}
                style={{
                position: 'absolute',
                width: size,
                height: size,
                backgroundColor: 'red',
                borderRadius: 10,
                left: position.x - size/2,
                top: position.y - size/2,
                }}
            />
        ));
    };

    return (
        <View style={styles.panel} ref={viewRef}>
            {recording ?
                <View style={styles.recording}></View>
                : <></>
            }
            {recording ?
                <View style={{ position: "absolute", top: 0, alignItems: "center", width: "100%" }}>
                    <Text style={{fontSize: 20, color: "white"}}> Record your Scribble</Text>
                </View>
                : <></>
            }
        
        <View style={{position: "absolute", width:"100%", height:"100%"}} {...panResponder.panHandlers}>
            {renderStamps()}
        </View>
        {recording ?
            <View style={{position:"absolute",bottom: 0, width:"100%", justifyContent: "flex-end", alignContent:"center"}}>
                <View style={{bottom: 24, alignItems: "center", zIndex: 100}}>
                    <Button title="Done" color={"gray"} style={styles.elevated} onPress={() => {onFinishRecordingCallback(recordedStrokes)}}></Button>
                </View>
                </View>
            : <></>
        } 
        </View>
    );
};

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
    }
});
