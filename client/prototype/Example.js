import { StyleSheet, Text, View } from 'react-native';
import { BigTitle, BodyText, Card, EditableText, HorizBox, Pad, PrimaryButton, ScrollableScreen, SectionTitle, Separator, SmallTitle, WideScreen } from '../component/basics';
import { callServerApiAsync, callServerMultipartApiAsync } from '../util/servercall';
import { useState } from 'react';
import { VideoPlayer } from '../component/video';
import { VideoCamera } from '../platform-specific/videocamera';
import { statusStartingPoint } from '../data/tags';
import { goBack, pushSubscreen } from '../util/navigate';
import { authorRobEnnals } from '../data/authors';
import { AudioPlayer, transcribeAudioAsync } from '../component/audio';
import { AudioRecorder } from '../platform-specific/audiorecorder';
import { Popup } from '../platform-specific/popup';
import { useGlobalProperty } from '../util/datastore';

const description = `
Examples of how to use the various parts of the prototype infrastructure.

If you want to build your own prototypes then this is a good place to see 
examples of the various things that the prototype environment can do.

More sections will be added to this prototype as more features are added to the prototype infrastructure.
`

export const ExamplePrototype = {
    key: 'example',
    name: "Example Prototype",    
    author: authorRobEnnals,
    date: "2023-05-04",
    description,
    screen: ExampleScreen,
    subscreens: {
        cat: {screen: CatScreen, title: ({name}) => `Cat ${name}`}, 
        dog: {screen: DogScreen, title: ({name}) => `Dog ${name}`},
    },
    tags: [],
    status: statusStartingPoint,
    instance: [
        {key: 'silly', name: 'Silly', message: 'I love silliness'},
        {key: 'sensible', name: 'Sensible', message: 'I love sensibleness'}
    ]
}

export function ExampleScreen() {   
    const name = useGlobalProperty('name');

    return (
        <ScrollableScreen pad>
            <BigTitle>Example Prototype ({name})</BigTitle>
            <BodyText>
                This is an example prototype. It shows how to use the various parts of the prototype infrastructure.
            </BodyText>
            <Separator />
            <ExampleInstanceData />
            <Separator />
            <ExampleCallBackend name={name} />
            <Separator />
            <ExamplePopup />
            <Separator />
            <ExampleVideoPlayer />
            <Separator />
            <ExampleVideoRecording />
            <Separator />
            <ExampleAudioPlayer />
            <Separator />
            <ExampleAudioRecorder />
            <Separator />
            <ExampleAudioTranscriber />
            <Separator />
            <ExampleSubscreens />
        </ScrollableScreen>
    );
}


function ExampleInstanceData() {
    const name = useGlobalProperty('name');
    const message = useGlobalProperty('message');
    const datastore = useDatastore();

    function setName(text) {
        datastore.setGlobalProperty('name', text)
    }
    function setMessage(text) {
        datastore.setGlobalProperty('message', text)
    }


    return <View>
        <SectionTitle>{name} Instance Data</SectionTitle>
        <BodyText>
            A prototype can have multiple different instances, each of which are initialized with different data.
            For example this prototype has the name "{name}" and the message "{message}", which you can change using the
            edit boxes below.
        </BodyText>
        <Pad/>
        <EditableText value={name} onChange={setName} multiline={false} placeholder='Change the name' action='Change Prototype Name' />
        <Pad/>
        <EditableText value={message} onChange={setMessage} multiline={false} placeholder='Change the message' action='Change Prototype Message' />
    </View>
}


function ExampleCallBackend({name}) {
    const [response, setResponse] = useState('');

    async function onCallBackend() {
        const result = await callServerApiAsync('chatgpt', 'hello', {name});
        setResponse(result);
    }

    async function onCallMultipartBackend() {
        const result = await callServerMultipartApiAsync('chatgpt', 'hello', {name});
        setResponse('Multipart: ' + result);
    }


    return <View>
        <SmallTitle>Backend Calls</SmallTitle>
        <BodyText> 
            A prototype can make calls to a back end. This can be useful for calling APIs like GPT.                   
        </BodyText>
        <Pad />
        <PrimaryButton onPress={onCallBackend}>Call Backend</PrimaryButton>
        <Pad />
        <PrimaryButton onPress={onCallMultipartBackend}>Call Multipart Backend</PrimaryButton>
        <Pad />
        <BodyText>{response}</BodyText>                
    </View>
}


function ExampleVideoPlayer() {
    return <View>
        <SmallTitle>Video Playing</SmallTitle>
        <BodyText>
            Prototypes can play video.
        </BodyText>
        <Pad/>
        <HorizBox>
            <VideoPlayer 
                uri='https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' 
                posterUri='https://static.tvtropes.org/pmwiki/pub/images/BigBuckBunny.jpg'
                size={200} />
            <VideoPlayer 
                uri='https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' 
                posterUri='https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_s5_both.jpg/1200px-Elephants_Dream_s5_both.jpg'
                size={200} />
        </HorizBox>
    </View>
}


function ExampleVideoRecording() {
    const [video, setVideo] = useState(null);
    return <View>
        <SmallTitle>Video Recording</SmallTitle>
        <BodyText>
            Prototypes can record video.
        </BodyText>
        <Pad/>
        <VideoCamera size={400} onSubmitRecording={setVideo}/>
        {video ? 
            <VideoPlayer             
                uri={video}
                size={200}
            />
        : null }
    </View>
}

function ExampleAudioPlayer() {
    return <View>
        <SmallTitle>Sound Playing</SmallTitle>
        <BodyText>Prototypes can play sound.</BodyText>
        <Pad/>
        <AudioPlayer uri='https://upload.wikimedia.org/wikipedia/commons/b/b2/Ak-Bongo.ogg' />
    </View>
}

function ExampleAudioRecorder() {
    const [audio, setAudio] = useState(null);
    return <View>
        <SmallTitle>Sound Recording</SmallTitle>
        <BodyText>Prototypes can record sound.</BodyText>
        <Pad/>
        <AudioRecorder onSubmitRecording={({url}) => setAudio(url)} />
        {audio ?
            <AudioPlayer uri={audio} />
        : null}
    </View>
}

function ExampleAudioTranscriber() {
    const [audio, setAudio] = useState(null);
    const [transcription, setTranscription] = useState(null);
    
    async function onSubmitRecording({blob, url}) {
        setAudio(url);
        setTranscription('Transcribing...');
        const text = await transcribeAudioAsync({blob});
        setTranscription(text);
    }

    return <View>
        <SmallTitle>Speech Transcripton</SmallTitle>
        <BodyText>Prototypes can transribe speech to text.</BodyText>
        <Pad/>
        <AudioRecorder onSubmitRecording={onSubmitRecording} />
        {audio ?
            <AudioPlayer uri={audio} />
        : null}
        {transcription ?
            <BodyText>{transcription}</BodyText> 
        : null}
    </View>
}

function ExampleSubscreens() {
    return <View>
        <SmallTitle>Stacked Screens</SmallTitle>
        <BodyText>
            A prototype can have multiple stacked screens.
        </BodyText>
        <Pad/>
        <PrimaryButton onPress={() => pushSubscreen('cat', {name: 'Fluffy'})}>Show Cat Fluffy</PrimaryButton>
        <Pad/>
        <PrimaryButton onPress={() => pushSubscreen('cat', {name: 'Tiddles'})}>Show Cat Tiddles</PrimaryButton>
        <Pad/>
        <PrimaryButton onPress={() => pushSubscreen('dog', {name: 'Rover'})}>Show Dog Rover</PrimaryButton>
        <Pad/>
        <PrimaryButton onPress={() => pushSubscreen('dog', {name: 'Fido'})}>Show Dog Fido</PrimaryButton>
    </View>
}

function CatScreen({name}) {
    return <ScrollableScreen>
        <BigTitle>My Cat {name}</BigTitle>
        <BodyText>
            This is a stacked subscreen. 
        </BodyText>
        <Pad/>
        <PrimaryButton onPress={goBack}>Back</PrimaryButton>
        <Pad/>
        <PrimaryButton onPress={() => pushSubscreen('dog', {name: 'Rover'})}>Show Dog Rover</PrimaryButton>
        <Pad/>
        <PrimaryButton onPress={() => pushSubscreen('dog', {name: 'Fido'})}>Show Dog Fido</PrimaryButton>

    </ScrollableScreen>
}

function DogScreen({name}) {
    return <ScrollableScreen>
        <BigTitle>My Dog {name}</BigTitle>
        <BodyText>
            This is another stacked subscreen. 
        </BodyText>
        <Pad/>
        <PrimaryButton onPress={goBack}>Back</PrimaryButton>
    </ScrollableScreen>
}

export function ExamplePopup() {

    function popup() {
        return <BodyText>This is a popup. Click outside to make me go away</BodyText>
    }

    return <View>
        <SmallTitle>Popup</SmallTitle>
        <BodyText>Prototypes can show popup menus</BodyText>
        <Pad/>
        <HorizBox spread>
            <Popup popupContent={popup}>
                <Text>Press me</Text>
            </Popup>
            <Popup popupContent={popup}>
                <Text>Press me</Text>
            </Popup>
        </HorizBox>
    </View>
}



