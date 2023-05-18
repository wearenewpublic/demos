import { BigTitle, Pad, ScrollableScreen, WideScreen, WrapBox } from "../component/basics";
import { VideoPlayer, VideoPost } from "../component/video";
import { VideoCamera } from "../platform-specific/videocamera";
import { expandDataList } from "../shared/util";
import { addObject, getAllData, useCollection, useGlobalProperty } from "../util/localdata"

export const VideoResponse = {
    key: 'video-response',
    name: 'Video Response',
    description: 'Record a video response to a question.',
    screen: VideoResponseScreen,
    instance: [
        {key: 'kid-names', name: 'How did you choose the names for your kids?', response: expandDataList([
            {from: 'boring', uri: 'https://new-public-demo.web.app/videos/one_two_three_four.webm'},
            {from: 'peacemaker', uri: 'https://new-public-demo.web.app/videos/Rob_Isaac_name.webm'}
        ])},        
        {key: 'bio', name: 'What is the 30 second story of your life?', response: []},
    ]
}

function VideoResponseScreen() {
    const responses = useCollection('response', {sortBy: 'time'});
    const name = useGlobalProperty('name');

    function onSubmitRecording(uri) {
        console.log('submitting recording', uri);
        addObject('response', {uri});
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