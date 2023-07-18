import { AudioPost, transcribeAudioAsync } from "../component/audio";
import { BigTitle, Pad, ScrollableScreen } from "../component/basics";
import { authorRobEnnals } from "../data/authors";
import { statusTentative, tagAudioVideo, tagConversation } from "../data/tags";
import { angryFrench, boringFrench, peacemakerFrench } from "../translations/french/personas_french";
import { angryGerman, boringGerman, peacemakerGerman } from "../translations/german/personas_german";
import { AudioRecorder } from "../platform-specific/audiorecorder";
import { useCollection, useDatastore, useGlobalProperty } from "../util/datastore";
import { expandDataList } from "../util/util";


const description = `
Record an audio response to a question.

Some people feel more comfortable speaking an answer than writing it, particularly when using mobile
devices, or people who may have limited literacy.

Hearing someone's voice can also help you to feel more connected to them.

This prototype allows people to record short audio responses to questions, and to listen to the responses.

The prototype also shows an automatic text transcription of the audio. This can be helpful for people who
would rather not play sound (e.g. they are in a public place). It also makes it easier to quickly
tell which audio responses you might want to listen to.

NOTE: This prototype currently only works on Chrome, and not on Safari.
`

export const AudioResponsePrototype = {
    key: 'audioresponse',
    name: 'Audio Response',
    author: authorRobEnnals,
    date: '2023-05-30',
    description,
    tags: [tagAudioVideo, tagConversation],
    status: statusTentative,
    screen: AudioResponseScreen,
    instance: [
        {key: 'kid-names', name: 'How did you choose the names for your kids?', response: expandDataList([
            {
                from: 'boring', uri: 'https://new-public-demo.web.app/videos/one_two_three_four.webm', 
                text: 'One two three four'
            },
            {
                from: 'peacemaker', uri: 'https://new-public-demo.web.app/videos/Rob_Isaac_name.webm',
                text: 'My oldest son, we chose the name Isaac, because we wanted a name with the right associations, and we thought, maybe a scientist. And if you are choosing a scientist then Isaac Newton is the obvious person. And we middle-named him after Alexander Graham Bell, so his middle name is Graham.'
            },
        ])},        
        {key: 'bio', name: 'What is the 30 second story of your life?', response: expandDataList([
            {from: 'boring', uri: 'https://new-public-demo.web.app/videos/one_two_three_four.webm', text: 'One two three four'}
        ])},
        {
            key: 'kid-names-german', 
            personaList: [boringGerman, peacemakerGerman, angryGerman],
            name: 'Wie haben Sie die Namen für Ihre Kinder ausgewählt?', response: expandDataList([
            {
                from: 'boring', uri: 'https://new-public-demo.web.app/videos/one_two_three_four.webm', 
                text: 'Eins zwei drei vier'
            },
            {
                from: 'peacemaker', uri: 'https://new-public-demo.web.app/videos/Rob_Isaac_name.webm',
                text: 'Für meinen ältesten Sohn haben wir den Namen Isaac gewählt, weil wir einen Namen mit den richtigen Assoziationen wollten, und wir dachten, vielleicht ein Wissenschaftler. Und wenn man sich für einen Wissenschaftler entscheidet, dann ist Isaac Newton die naheliegende Person. Und wir haben ihn in der Mitte nach Alexander Graham Bell benannt, sein zweiter Vorname ist also Graham.'
            }
        ])},       
        {   
            key: 'kid-names-french', 
            personaList: [boringFrench, peacemakerFrench, angryFrench],
            name: 'Comment avez-vous choisi les prénoms de vos enfants?', response: expandDataList([
            {
                from: 'boring', uri: 'https://new-public-demo.web.app/videos/one_two_three_four.webm', 
                text: 'Un deux trois quatre'
            },
            {
                from: 'peacemaker', uri: 'https://new-public-demo.web.app/videos/Rob_Isaac_name.webm',
                text: "Pour mon fils aîné, nous avons choisi le nom d'Isaac, parce que nous voulions un nom avec les bonnes associations, et nous avons pensé, peut-être, à un scientifique. Et si vous choisissez un scientifique, Isaac Newton est la personne la plus évidente. Et nous lui avons donné le deuxième prénom d'Alexander Graham Bell, donc son deuxième prénom est Graham."
            }
        ])}, 

    ]
}

function AudioResponseScreen() {
    const responses = useCollection('response', {sortBy: 'time'});
    const name = useGlobalProperty('name');
    const datastore = useDatastore();

    async function onSubmitRecording({blob, url}){
        console.log('onSubmitRecording', blob, url);
        const key = datastore.addObject('response', {uri: url, text: 'Transcribing...'});
        const text = await transcribeAudioAsync({blob});
        datastore.modifyObject('response', key, response => ({...response, text}));
        console.log('done respose', key, text);
    }

    return <ScrollableScreen>
        <BigTitle>{name}</BigTitle>
        {responses.map(response => 
            <AudioPost key={response.key} post={response} />
        )}
        <Pad />
        <AudioRecorder onSubmitRecording={onSubmitRecording} action='Record Your Audio Response' />
    </ScrollableScreen>
}
