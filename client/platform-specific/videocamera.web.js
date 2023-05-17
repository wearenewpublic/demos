import { Entypo } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Clickable, PrimaryButton } from "../component/basics";

export function VideoCamera({size, action='Record Video', onSubmitRecording}) {
    const s = VideoCameraStyle;
    const [cameraShown, setCameraShown] = useState(false);

    function onSubmit(url) {
        setCameraShown(false);
        onSubmitRecording(url);
    }

    if (cameraShown) {
        return <LiveVideoCamera size={size} onSubmitRecording={onSubmit} />
    } else {
        return <PrimaryButton 
            onPress={() => setCameraShown(true)}
            icon={<Entypo name='video-camera' size={24} color='white' />}>
            {action}
        </PrimaryButton>
        // return <Clickable onPress={() => setCameraShown(true)}>
        //     <View style={s.box}>
        //         <Entypo name='video-camera' size={32} color='#EA4335' />
        //         <Text style={s.label}>{action}</Text>
        //     </View>    
        // </Clickable>
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

export function LiveVideoCamera({size, onSubmitRecording}) {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedBlobsRef = useRef([]);

    useEffect(() => {
        initializeMedia();
      }, []);

    const startRecording = () => {
        recordedBlobsRef.current = [];
        const stream = videoRef.current.srcObject;
        console.log('stream', {stream, videoRef});
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });

        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
        mediaRecorderRef.current.onstop = handleStop;

        mediaRecorderRef.current.start();
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
        const blob = new Blob(recordedBlobsRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        recordedBlobsRef.current = [];
        console.log('recorderd video uri', url);
        onSubmitRecording(url);
        // videoRef.current.src = url;

      };

    // const handleStop = () => {
    //     const blob = new Blob(recordedBlobsRef.current, { type: 'video/webm' });
    //     const url = URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = 'recorded_video.webm';
    //     a.click();
    //     URL.revokeObjectURL(url);
    //     recordedBlobsRef.current = [];
    // };
    
    const handleSuccess = (stream) => {
        videoRef.current.srcObject = stream;
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
        <div>
            <video 
                ref={videoRef} 
                style={{width: size, height: size, objectFit: "cover"}} autoPlay muted 
            />
            <button onClick={startRecording}>Start Recording</button>
            <button onClick={stopRecording}>Stop Recording</button>
        </div>
    );
}
