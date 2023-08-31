import { BigTitle, Pad, ScrollableScreen, WideScreen, WrapBox } from "../component/basics";
import { VideoPlayer, VideoPost } from "../component/video";
import { authorRobEnnals } from "../data/authors";
import { VideoCamera } from "../platform-specific/videocamera";
import { useCollection, useDatastore, useGlobalProperty } from "../util/datastore";
import { expandDataList } from "../util/util";
import { languageFrench, languageGerman } from "../component/translation";

const description = `
Record a video response to a question.

When you engage with someone entirely over text it can be hard to remember that you are dealing with
a real person.

For employer-based communities, this can be resolved by having people take part in regular video calls,
but that can be difficult for more casual communities, where people are not reliable available to talk
at the same time.

One way to compensate for that is to encourage community members to record short video responses
to questions and view the video responses left by other community members.

NOTE: This prototype currently only works on Chrome, and not on Safari.
`

export const VideoResponse = {
    key: 'videoresponse',
    name: 'Video Response',
    author: authorRobEnnals,
    date: '2023-05-18',
    description,
    screen: VideoResponseScreen,
    instance: [
        {key: 'kid-names', name: 'How did you choose the names for your kids?', response: expandDataList([
            {from: 'b', uri: 'https://new-public-demo.web.app/videos/one_two_three_four.webm'},
            {from: 'f', uri: 'https://new-public-demo.web.app/videos/Rob_Isaac_name.webm'}
        ])},        
        {key: 'bio', name: 'What is the 30 second story of your life?', response: expandDataList([
            {from: 'b', uri: 'https://new-public-demo.web.app/videos/one_two_three_four.webm'}
        ])},
        {key: 'bio-german', name: 'Was ist die 30-Sekunden-Geschichte deines Lebens? (German)', 
            language: languageGerman,
            response: expandDataList([
                {from: 'b', uri: 'https://new-public-demo.web.app/videos/one_two_three_four.webm'}
            ]
        )},
        {key: 'bio-french', name: "Quelle est l'histoire de votre vie en 30 secondes? (French)", 
            language: languageFrench,
            response: expandDataList([
                {from: 'b', uri: 'https://new-public-demo.web.app/videos/one_two_three_four.webm'}
            ]
        )},
    ],
    newInstanceParams: []
}

function VideoResponseScreen() {
    const responses = useCollection('response', {sortBy: 'time'});
    const name = useGlobalProperty('name');
    const datastore = useDatastore();

    function onSubmitRecording({blob, url}) {
        console.log('submitting recording', url);
        datastore.addObject('response', {uri: url});
    }

    return <ScrollableScreen>
        <BigTitle>{name}</BigTitle>
        <WrapBox>
            {responses.map(response => 
                <VideoPost key={response.key} post={response} />
            )}
        </WrapBox>
        <Pad/>
        <VideoCamera onSubmitRecording={onSubmitRecording} action='Record a Video Response' />
    </ScrollableScreen>
}