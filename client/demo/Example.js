import { StyleSheet, Text, View } from 'react-native';
import { BigTitle, BodyText, EditableText, HorizBox, Pad, PrimaryButton, ScrollableScreen, SectionTitle, Separator, SmallTitle, WideScreen } from '../component/basics';
import { setGlobalProperty, useGlobalProperty } from '../util/localdata';
import { callServerApiAsync } from '../util/servercall';
import { useState } from 'react';
import { VideoPlayer } from '../component/video';
import { VideoCamera } from '../platform-specific/videocamera';
import { statusStartingPoint } from '../data/tags';
import { goBack, pushSubscreen } from '../shared/navigate';
import { authorRobEnnals } from '../data/authors';

const description = `
Examples of how to use the various parts of the demo infrastructure.

If you want to build your own demos then this is a good place to see 
examples of the various things that the demo environment can do.

More sections will be added to this demo as more features are added to the demo infrastructure.
`

export const ExampleDemo = {
    key: 'example',
    name: "Example Demo",    
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
            <BigTitle>Example Demo ({name})</BigTitle>
            <BodyText>
                This is an example demo. It shows how to use the various parts of the demo infrastructure.
            </BodyText>
            <Separator />
            <ExampleInstanceData />
            <Separator />
            <ExampleCallBackend />
            <Separator />
            <ExampleVideoPlayer />
            <Separator />
            <ExampleVideoRecording />
            <Separator />
            <ExampleSubscreens />
        </ScrollableScreen>
    );
}


function ExampleInstanceData() {
    const name = useGlobalProperty('name');
    const message = useGlobalProperty('message');

    function setName(text) {
        setGlobalProperty('name', text)
    }
    function setMessage(text) {
        setGlobalProperty('message', text)
    }


    return <View>
        <SectionTitle>{name} Instance Data</SectionTitle>
        <BodyText>
            A demo can have multiple different instances, each of which are initialized with different data.
            For example this demo has the name "{name}" and the message "{message}", which you can change using the
            edit boxes below.
        </BodyText>
        <Pad/>
        <EditableText value={name} onChange={setName} multiline={false} placeholder='Change the name' action='Change Demo Name' />
        <Pad/>
        <EditableText value={message} onChange={setMessage} multiline={false} placeholder='Change the message' action='Change Demo Message' />
    </View>
}


function ExampleCallBackend() {
    const [response, setResponse] = useState('');

    async function onCallBackend() {
        const result = await callServerApiAsync('chatgpt', 'hello', {name});
        setResponse(result);
    }

    return <View>
        <SmallTitle>Backend Calls</SmallTitle>
        <BodyText> 
            A demo can make calls to a back end. This can be useful for calling APIs like GPT.                   
        </BodyText>
        <Pad />
        <PrimaryButton onPress={onCallBackend}>Call Backend</PrimaryButton>
        <BodyText>{response}</BodyText>                
    </View>
}


function ExampleVideoPlayer() {
    return <View>
        <SmallTitle>Video Playing</SmallTitle>
        <BodyText>
            Demos can play video.
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
            Demos can record video.
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

function ExampleSubscreens() {
    return <View>
        <SmallTitle>Stacked Screens</SmallTitle>
        <BodyText>
            A demo can have multiple stacked screens.
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