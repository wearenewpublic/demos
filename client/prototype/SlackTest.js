import { useState } from "react";
import { BigTitle, BodyText, HorizBox, OneLineTextInput, Pad, PrimaryButton, ScrollableScreen } from "../component/basics";
import { authorRobEnnals } from "../data/authors";
import { callServerApiAsync } from "../util/servercall";
import { useDatastore } from "../util/datastore";

export const SlackTestPrototype = {
    name: 'SlackTest',
    author: authorRobEnnals,
    date: '2023-08-18',
    key: 'slacktest',
    description: 'Test of Slack integration',
    screen: SlackTestScreen,
    instance: [
        {key: 'test', name: 'Test'}
    ]
}

const channelBottest = 'C05NWQRQ1FB';

function SlackTestScreen() {
    const [text, setText] = useState('');
    const [plainText, setPlainText] = useState('');
    const [cipherText, setCipherText] = useState('');
    const [key, setKey] = useState('');
    const datastore = useDatastore();

    function onSend() {
        callServerApiAsync({datastore, component:'slack', funcname: 'message', params: {text, channel: channelBottest}});
    }
    async function onGenerate() {
        const result = await callServerApiAsync({datastore, component: 'encryption', funcname: 'generateKey', params: {}});
        setKey(result);
    }
    async function onEncrypt() {
        const result = await callServerApiAsync({datastore, component: 'encryption', funcname: 'encrypt', params: {text: plainText, key}});
        setCipherText(result);
    }
    async function onDecrypt() {
        const result = await callServerApiAsync({datastore, component: 'encryption', funcname: 'decrypt', params: {encryptedText: cipherText, key}});
        setPlainText(result);
    }

    return <ScrollableScreen pad>
        <BigTitle>Slack Test</BigTitle>

        <BodyText>
            Use the controls here to test Slack integration. Outputs will appear in the #bot-testing channel.
        </BodyText>
        <Pad size={16}/>

        <OneLineTextInput label="Message" placeholder="Type a message here" value={text} onChange={setText} />
        <Pad/>
        <PrimaryButton label="Send Message" onPress={onSend} />

        <Pad size={16}/>
        <OneLineTextInput label="Key" placeholder="Key goes here. Generate one or paste one." value={key} onChange={setKey} />
        <Pad/>
        <PrimaryButton label="Generate Key" onPress={onGenerate} />

        <Pad size={16}/>
        <OneLineTextInput label="Plaintext" placeholder="Enter plaintext to encrypt" value={plainText} onChange={setPlainText} />
        <Pad/>
        <OneLineTextInput label="Ciphertext" placeholder="Enter ciphertext to decrypt" value={cipherText} onChange={setCipherText} />
        <Pad/>
        <HorizBox center>
            <PrimaryButton label="Encrypt" onPress={onEncrypt} />
            <Pad />
            <PrimaryButton label="Decrypt" onPress={onDecrypt} />
        </HorizBox>


    </ScrollableScreen>   
}