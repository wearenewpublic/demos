import { Card, Center, EditableText, Pad, PrimaryButton, WideScreen } from "../component/basics"
import {View} from 'react-native'
import { ExpandSection } from "../component/expand-section"
import { BottomScroller } from "../platform-specific/bottomscroller"
import { Message, QuietSystemMessage, sendMessage } from "../component/message"
import { gptProcessAsync } from "../component/chatgpt"
import { useState } from "react"
import { authorRobEnnals } from "../data/authors"
import { useCollection, useDatastore, useGlobalProperty, useObject } from "../util/datastore"

const description = `
Describe a set of user personas and see what happens when they have a conversation with each other about a topic.

This isn't a prototype product to play with. Instead it lets you simulate different kinds of conversation
that might happen. This can be useful for producing concrete examples of how different kinds of people
might engage with each other about a topic, and the impact that a skilled facilitator or moderator can
have on how a conversation proceeds.

One signicant limitation with this prototype is that, due to GPT's alignment training, it is very reluctant
to simulate users who are rude and disrepsectful to each other, so it's hard to simulate a conversation
that goes as badly as real conversations on the internet often do.
`

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
        personality: 'A troll who likes to say things that will wind other people up, poking at their insecurities, and pointing out contradictions between their beliefs.',
        face: 'face3.jpeg'
    }
}

export const SimulatedChat = {
    key: 'simulatedchat',
    name: "Simulated Chat",
    author: authorRobEnnals,
    date: "2023-05-19",
    description,
    screen: SimulatedChatScreen,
    instance: [
        {key: 'politics', name: 'Politics', topic: 'Gun Control', message: {}, persona}        
    ]
}



function SimulatedChatScreen() {    
    const messages = useCollection('message', {sortBy: 'time'});
    const [started, setStarted] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const personas = useGlobalProperty('persona');
    const topic = useGlobalProperty('topic');
    const datastore = useDatastore();

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
            datastore.addObject('message', message);
        })
        setInProgress(false);
    }

    return (
        <WideScreen>
            <Pad />
            <EditableText value={topic || ''} 
                label='Discussion Topic'
                onChange={text => datastore.setGlobalProperty('topic', text)} 
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
                    <PrimaryButton onPress={onGenerate} label='Generate Simulated Conversation' />
                </Center>
            }
            {inProgress ?
                <QuietSystemMessage label='Generating (this may take over a minute)...'/>
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
    const datastore = useDatastore();

    function onSetName(name) {
        datastore.modifyObject('persona', personaKey, persona => ({...persona, name}))
    }
    function onSetPersonality(personality) {
        datastore.modifyObject('persona', personaKey, persona => ({...persona, personality}))
    }

    const persona = useObject('persona', personaKey);

    return <View>
        <Pad size={12} />
        <EditableText
            value={persona?.name || ''} 
            onChange={onSetName} 
            placrehoder={`Enter name of person ${personaKey}`}
            multiline={false}
            flatBottom
        />
        <EditableText 
            height={80}
            value={persona?.personality || ''} 
            onChange={onSetPersonality} 
            placeholder={`Enter personality of person ${personaKey}`} 
            flatTop
        />
    </View>
}