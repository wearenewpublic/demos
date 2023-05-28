import React from "react";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Clickable, Pad, PrimaryButton } from "../component/basics";


export function AudioRecorder({action='Record Audio', onSubmitRecording}) {
    const s = VideoCameraStyle;
    const [recorderShown, setRecorderShown] = useState(false);

    function onSubmit(url) {
        setRecorderShown(false);
        onSubmitRecording(url);
    }

    if (recorderShown) {
        return <LiveAudioRecorder onSubmitRecording={onSubmit} />
    } else {
        return <PrimaryButton 
            onPress={() => setRecorderShown(true)}
            icon={<FontAwesome name='microphone' size={24} color='white' />}>
            {action}
        </PrimaryButton>
    }
}

const VideoCameraStyle = StyleSheet.create({
    box: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ddd',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 4,
        alignSelf: 'flex-start'
    },
    label: {
        fontSize: 15,
        marginLeft: 16,
        fontWeight: 'bold'
    }
})

export function LiveAudioRecorder({size, onSubmitRecording}) {
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedBlobsRef = useRef([]);
    const [recording, setRecording] = useState(false);  
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        initializeMedia();
      }, []);

    const startRecording = () => {
        recordedBlobsRef.current = [];
        const stream = streamRef.current;
        console.log('stream', {stream, streamRef});
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' });

        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
        mediaRecorderRef.current.onstop = handleStop;

        mediaRecorderRef.current.start();
        setRecording(true);
    };
    
    const stopRecording = () => {
        mediaRecorderRef.current.stop();
    };
    
    const handleDataAvailable = (event) => {
        if (event.data && event.data.size > 0) {
            recordedBlobsRef.current.push(event.data);
        }
    };

    const handleStop = () => {
        const blob = new Blob(recordedBlobsRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        recordedBlobsRef.current = [];
        console.log('recorderd audio uri', url);
        onSubmitRecording(url);
    };
    
    const handleSuccess = (stream) => {
        streamRef.current = stream;
        // videoRef.current.srcObject = stream;
        setInitialized(true);
    };
    
    const handleError = (error) => {
        console.error('Error accessing media devices:', error);
    };

    const initializeMedia = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(handleSuccess)
            .catch(handleError);
    };
    
    return (
        <View>
            {/* <video 
                ref={videoRef} 
                style={{width: size, height: size, objectFit: "cover"}} autoPlay muted 
            />
            <Pad /> */}
            {initialized ? 
                (recording ?
                    <PrimaryButton
                        icon={<Entypo name='controller-stop' size={24} color='white' />} 
                        onPress={stopRecording}>Stop Recording</PrimaryButton>
                :
                   <PrimaryButton 
                        icon={<Entypo name='controller-record' size={24} color='white' />} 
                        onPress={startRecording}>Start Recording</PrimaryButton>

                )
            : 
                <div>Initializing Microphone...</div>
            }
        </View>
    );
}
