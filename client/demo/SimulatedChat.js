import { Card, Center, EditableText, Pad, PrimaryButton, WideScreen } from "../component/basics"
import {View} from 'react-native'
import { ExpandSection } from "../component/expand-section"
import { BottomScroller } from "../platform-specific/bottomscroller"
import { getAllData, modifyObject, setGlobalProperty, useCollection, useGlobalProperty, useObject } from "../util/localdata"
import { Message, QuietSystemMessage, sendMessage } from "../component/message"
import { gptProcessAsync } from "../component/chatgpt"
import { useState } from "react"

const persona = {
    one: {
        name: 'Lefty Larry',
        personality: 'Has strong left wing views. Sees people who disagree with him as evil. Insists on having the last say in an argument. Went to Harvard and insists on telling everyone about it.',
        face: 'face6.jpeg',
    },
    two: {
        name: 'Righty Rita',
        personality: 'Has strong right wing conservative Christian views. Thinks liberals are brainwashed by the media and are destroying America. Interprets all attempts of moderation as attempting to censor her views.',
        face: 'face7.jpeg',
    },
    three: {
        name: 'Moderator Millie',
        personality: 'Cares a lot about the group and wants to keep it together. Tries to keep the peace and find common ground. But gets irritable pretty quickly if people don\'t listen to her.',
        face: 'face5.jpeg'
    },
    four: {
        name: 'Annoying Andy',
        personality: 'A troll who likes to say things that will wind other people up, poking at their insecurities, and taking extreme positions to get a reaction.',
        face: 'face2.jpeg'
    }
}

export const SimulatedChat = {
    name: "Simulated Chat",
    author: "Rob Ennals",
    date: "2023-05-19",
    description: "Describe personas and have GPT simulate them chatting to each other",
    screen: SimulatedChatScreen,
    instance: [
        {key: 'politics', name: 'Politics', topic: 'Gun Control', message: {}, persona, '$personaKey':'one'}        
    ]
}



function SimulatedChatScreen() {    
    const messages = useCollection('message', {sortBy: 'time'});
    const [started, setStarted] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const personas = useGlobalProperty('persona');
    const topic = useGlobalProperty('topic');

    async function onGenerate() {
        setStarted(true);
        setInProgress(true);
        const params = {
            topic,
            oneName: personas.one.name,
            onePersonality: personas.one.personality,
            twoName: personas.two.name,
            twoPersonality: personas.two.personality,
            threeName: personas.three.name,
            threePersonality: personas.three.personality,
            fourName: personas.four.name,
            fourPersonality: personas.four.personality,
        }
        const gptMessages = await gptProcessAsync({promptKey:'simulatedchat', params});
        const newMessages = addPersonaKeysToMessages({personas, gptMessages});
        newMessages.forEach(message => {
            sendMessage(message);
        })
        setInProgress(false);
    }

    return (
        <WideScreen>
            <Pad />
            <EditableText value={topic} 
                label='Discussion Topic'
                onChange={text => setGlobalProperty('topic', text)} 
                multiline={false}
                placeholder='Enter topic of conversation' 
            />
            <Pad />
            <ExpandSection title='Personas'>
                <PersonaDescription personaKey='one' />
                <PersonaDescription personaKey='two' />
                <PersonaDescription personaKey='three' />
                <PersonaDescription personaKey='four' />
            </ExpandSection>
            {started ? null :
                <Center pad={8}>    
                    <PrimaryButton onPress={onGenerate}>Generate Simulated Conversation</PrimaryButton>
                </Center>
            }
            {inProgress ?
                <QuietSystemMessage>Generating (this may take over a minute)...</QuietSystemMessage>
            : null}
            <BottomScroller>
                <Pad size={8} />
                {messages.map(message => 
                    <Message key={message.key} messageKey={message.key}/>
                )}
            </BottomScroller>
        </WideScreen>
    )
}

function addPersonaKeysToMessages({personas, gptMessages}) {
    return gptMessages.map(message => {
        const personaName = message.fromName;
        const peronaKey = Object.keys(personas).find(key => personas[key].name === personaName);
        return {...message, from: peronaKey};
    })
}

function PersonaDescription({personaKey}) {
    function onSetName(name) {
        modifyObject('persona', personaKey, persona => ({...persona, name}))
    }
    function onSetPersonality(personality) {
        modifyObject('persona', personaKey, persona => ({...persona, personality}))
    }

    const persona = useObject('persona', personaKey);

    return <View>
        <Pad size={12} />
        <EditableText
            value={persona.name} 
            onChange={onSetName} 
            placrehoder={`Enter name of person ${personaKey}`}
            multiline={false}
            flatBottom
        />
        <EditableText 
            height={80}
            value={persona.personality} 
            onChange={onSetPersonality} 
            placeholder={`Enter personality of person ${personaKey}`} 
            flatTop
        />
    </View>
}