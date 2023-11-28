import { startTransition, useRef, useState } from "react";

import { Button, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { VibratingGif } from "./vibratingGif";
import { vibratingEmojis } from "./vibratingEmojiConfig";
import { Vibrator } from "./vibrationPlayer";
import { HapticTapPanel } from "./hapticTaps";
import { HapticScribbleScreen } from "./hapticScribbleScreen";

function Message({message}) {
    const s = MessageStyles;
    return <View style={[s.messageHolder, message.mine ? s.myMessageHolder : {}]}> 
        <View style={[
            s.messageBubble, message.mine ? s.myMessageBubble : s.theirMessageBubble,
            (message.taps !== undefined || message.scribble !== undefined) ? s.buttonMessage : null]
        }>
            {message.gif !== undefined ?
                <VibratingGif config={vibratingEmojis[message.gif]}/>
                : <></>
            }
            {message.taps !== undefined ?
                <TouchableOpacity onPress={() => message.play()}>
                    <Text style={s.buttonText}>▶️ PLAY TAPS</Text>
                </TouchableOpacity>
                : <></>
            }
            {message.scribble !== undefined ?              
                <TouchableOpacity onPress={() => message.play()}>
                    <Text style={s.buttonText}>▶️ PLAY SCRIBBLES</Text>
                </TouchableOpacity>
                : <></>
            }
            <Text>{message.text}</Text>
        </View>
    </View>
}

export function HapticChatScreen() {
    const [messages, setMessages] = useState([
        { text: "Hello! How are you?", mine: false },
        { text: "Very good. I aced my test today", mine: true },
        { text: "Congratulations!", gif: "clap", mine: false },
        { text: "Thank you!", mine: true, gif: "heart" },
    ])
    const [intensity, setIntensity] = useState(0);

    const [showTaps, setTaps] = useState([]);
    const [recordings, setRecordings] = useState(undefined)
    const [recordedTaps, setRecordedTaps] = useState([]);
    const [tapRecording, setTapRecording] = useState(false);

    const [showStrokes, setShowStrokes] = useState([]);
    const [recordedStrokes, setRecordedStrokes] = useState([]);
    const [strokeRecording, setStrokeRecording] = useState(false);

    const [currentEmoji, setCurrentEmoji] = useState(undefined);

    const [recordingCallback, setRecordingCallback] = useState(() => {})

    const scrollViewRef = useRef();

    function onSend(text, config) {
        
        if(config.live){
            if(config.type == "tap"){
                setTaps(config.recordings)
            }
            if(config.type == "scribble"){
                setShowStrokes(config.recordings)
            }
            return
        }
        setIntensity(intensity + 10)
        const newMessage = {text: text, mine: true}
        if(config.type == "tap"){
            newMessage.taps = config.recordings;
            newMessage.play = () => {setTaps(config.recordings)}
        }
        if(config.type == "scribble"){
            newMessage.scribble = config.recordings;
            newMessage.play = () => {setShowStrokes(config.recordings)}
        }
        if(config.type == "gif"){
            newMessage.gif = config.emoji;
        }
        setMessages([...messages, newMessage])
        setCurrentEmoji(undefined);
        Vibrator.SetConfig({pattern:[10, 0], delay: 10})
        Vibrator.Play()
    }

    function clearTaps(){
        setTaps([]);
    }

    function clearStrokes(){
        setShowStrokes([]);
    }

    function retrieveRecordings(recordings){
        setTapRecording(false);
        setCurrentEmoji(undefined);
        setRecordedTaps(recordings);
        setMessages([...messages, {text: '', mine: true, taps: recordings, play: (()=>{setTaps(recordings)})}])
    }

    function retrieveStrokeRecordings(recordings){
        setCurrentEmoji(undefined);
        setStrokeRecording(false);
        setRecordedStrokes(recordings);
        setMessages([...messages, {text: '', mine: true, scribble: recordings, play: (()=>{setShowStrokes(recordings)})}])
    }

    function onTapSelection(emoji){
        console.log("Set to recording" + emoji)
        setTapRecording(true)
        setCurrentEmoji(emoji)
    }

    function onScribbleSelection(){
        console.log("Recording scribbles")
        setStrokeRecording(true)
    }

    const startRecording = (config, callback) => {
        if(config.type == "tap"){
            setTapRecording(true)
            setCurrentEmoji(config.emoji)
        } else {
            setStrokeRecording(true)
        }
        setRecordingCallback(() => (recordings)=>{
            setCurrentEmoji(undefined);
            setStrokeRecording(false);
            setTapRecording(false);
            callback(recordings);
        });
    };

    return (
        <View style={{flex: 1}}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} ref={scrollViewRef} onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}>
                {messages.map((message, index) => 
                    <Message key={index} message={message}/>
                )}
            </ScrollView>
            <View></View>
            <ChatInput onSend={onSend} intensity={intensity} onTapSelection={onTapSelection} onScribbleSelection={onScribbleSelection} onStartRecord={startRecording}></ChatInput>
            {showTaps.length > 0 ?
                <HapticTapPanel emoji={currentEmoji} tapEvents={showTaps} onFinishPlayCallback={() => clearTaps()}></HapticTapPanel>
                : <></>
            }
            {tapRecording ?
                <HapticTapPanel emoji={currentEmoji} recording={true} onFinishRecordingCallback={recordingCallback}></HapticTapPanel>
                : <></>
            }
            {showStrokes.length > 0 ?
                <HapticScribbleScreen inputStamps={showStrokes} onFinishPlayCallback={() => clearStrokes()}></HapticScribbleScreen>
                : <></>
            }
            {strokeRecording ?
                <HapticScribbleScreen recording={true} onFinishRecordingCallback={(recordingCallback)}></HapticScribbleScreen>
                : <></>
            }
        </View>
    )
}

const MessageStyles = StyleSheet.create({
    messageHolder: {
        flexDirection: 'row',
        marginHorizontal: 8,
        marginVertical: 4
    },
    myMessageText: {
        color: '#fff'
    },
    myMessageHolder: {
        justifyContent: 'flex-end',
    },
    theirMessageBubble: {
        backgroundColor: '#fff',
        marginRight: 64
    },
    myMessageBubble: {
        backgroundColor: '#96ff94',
        marginLeft: 64
    },
    messageBubble: {
        borderRadius: 16,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        paddingVertical: 6,
        maxWidth: 500,
        flexShrink: 1
    },
    buttonMessage: {
        backgroundColor: "#96ff94"
    },
    buttonText: {
        fontWeight: "bold",
        color: "#2196F3"
    }
})

function ChatInput({onSend, onStartRecord}) {
    const [text, setText] = useState('');
    const s = ChatInputStyle;
    const [hover, setHover] = useState(false);

    const [sendingConfiguration, setSendingConfiguration] = useState({
        live: false,
        media: undefined,
        type: undefined,
        text: "",
        emoji: undefined
    })

    const [selectedEmoji, setSelectedEmoji] = useState(undefined);

    const onPressSend = ()  => {
        setSendingConfiguration({
            live: false,
            media: false,
            mediaType: undefined,
            recording: undefined,
            text: "",
            emoji: undefined
        });
        setText("")
        onSend(text, sendingConfiguration);
    }

    const retrieveRecordings = (recs) => {
        setSendingConfiguration((prev) => ({...prev, recordings: recs}));
    }

    const startScribble = () => {
        const newConfig = {
            ...sendingConfiguration,
            type: "scribble"
        }
        setSendingConfiguration(newConfig);
        onStartRecord(newConfig, retrieveRecordings)
    }

    const startTaps = () => {
        const newConfig = {
            ...sendingConfiguration,
            type: "tap"
        }
        setSendingConfiguration(newConfig);
        onStartRecord(newConfig, retrieveRecordings)
    }

    const selectEmoji = (e) => {
        setSendingConfiguration((prev) => ({...prev, 
            recordings: undefined,
            emoji: e,
            type: e!== undefined ? "gif" : undefined
        }));
    }

    const toggleMedia = () => {
        if(sendingConfiguration.media){
            setSendingConfiguration({
                ...sendingConfiguration,
                live: false,
                media: false,
                type: undefined,
                recordings: undefined,
                text: "",
                emoji: undefined
            })
        } else {
            setSendingConfiguration({
                ...sendingConfiguration,
                media: true
            })
        }
    }

    return <View>
        {sendingConfiguration.media ?
            <>
                {sendingConfiguration.recordings ? <View style={s.row}>
                    <Text style={emojiPickerStyle.label}>Send as:</Text>
                    <View style={{ padding: 3 }}></View>
                    <Button title="Message" onPress={() => setSendingConfiguration({...sendingConfiguration, live: false})}
                    color={sendingConfiguration.live ? "lightgray" : ""}></Button>
                    <View style={{ padding: 3 }}></View>
                    <Button title="Live reaction" onPress={() => setSendingConfiguration({...sendingConfiguration, live: true})}
                    color={!sendingConfiguration.live ? "lightgray" : ""}></Button>
                </View> : <></>}
                {!sendingConfiguration.recordings ?
                    <>
                        <View style={s.row}>
                            <Button title="🔴 Record Scribbles" onPress={() => startScribble()}></Button>
                            <View style={{ padding: 3 }}></View>
                            {sendingConfiguration.emoji ? <Button title="🔴 Record Taps" onPress={startTaps}></Button> :
                                <></>}
                        </View>
                        <View style={s.row}>
                            <EmojiPicker emoji={sendingConfiguration.emoji} onSelect={(e) => { setSelectedEmoji(e), selectEmoji(e) }}>
                            </EmojiPicker>
                        </View>
                    </> :
                    <></>
                }
            </>
            :
            <></>
        }
        <View style={s.row}>
            
            <View style={[emojiPickerStyle.toggleOption, sendingConfiguration.media ? emojiPickerStyle.toggleOption_selected : {}]}>
                <TouchableOpacity onPress={()=>toggleMedia()}>
                    <Text style={{fontSize: 25, display: "flex"}}>
                        {sendingConfiguration.type == "tap" ? "👆" : ""}
                        {sendingConfiguration.type == "scribble" ? "✏️" : ""}
                        {!sendingConfiguration.type && !sendingConfiguration.recordings && !sendingConfiguration.emoji? "➕" : ""}
                        {sendingConfiguration.type == "gif" ? "🖼️" : ""}
                    </Text>
                </TouchableOpacity>
            </View> 
            
            
            <TextInput multiline={true} style={[s.textInput, hover ? s.hover : null]} 
                value={text}
                onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                onChangeText={setText}
                placeholderTextColor='#999'
            />
            <Button onPress={() => onPressSend(text, sendingConfiguration)} title={"Send"} ></Button>
        </View>
    </View>
    
    
}

const ChatInputStyle = StyleSheet.create({
    textInput: {
        backgroundColor: 'lightgrey', borderRadius: 8, 
        borderWidth: StyleSheet.hairlineWidth, 
        borderColor: '#ddd', padding: 8,
        marginVertical: 8,
        marginHorizontal: 8,
        flexShrink: 0,
        fontSize: 16, lineHeight: 20, flexGrow: 1,
        bottom: 0
    },
    hover: {
        borderColor: '#999'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 10
    },
    intensity: {
        backgroundColor: "red",
        borderRadius: 10
    }
})

function EmojiPicker({emoji = undefined, onSelect, onDeselect, onTapSelection, children}) {
    return <View style={{flexDirection: "row", alignItems: "center", width:"100%", justifyContent: 'flex-start'}}>
        <View>
            <Text style={emojiPickerStyle.label}>Pick an emoji:</Text> 
        </View>
        {Object.keys(vibratingEmojis).map((key, i) => 
            <View key={key} style={[emojiPickerStyle.option,
                emoji == key ? emojiPickerStyle.option_selected : {}]}>
                <TouchableOpacity onPress={() => {
                    if(emoji == key){
                        onSelect(undefined);
                    } else{
                        onSelect(key)
                    }
                    
                }}>
                    <Image style={emojiPickerStyle.image} source={vibratingEmojis[key].stillImage}></Image>
                </TouchableOpacity>
            </View>
        )}
        {children}
    </View>
  }

const emojiPickerStyle = StyleSheet.create({
    label:{
        borderRadius: 24,
        backgroundColor: "lightgray",
        fontSize: 14,
        fontWeight: "bold",
        paddingVertical: 4,
        paddingHorizontal: 6
    },
    option: {
        width:40,
        height:40,
        borderRadius: 25,
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
    },
    toggleOption: {
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
        borderRadius: 5,

    },
    toggleOption_selected: {
        backgroundColor: "lightgray"
    },
    option_selected: {
        backgroundColor: "lightgray"
    },
    image: {
        width:30,
        height:30
    }
});