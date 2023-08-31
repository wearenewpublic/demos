import { View } from "react-native";
import { BigTitle, BodyText, Card, Clickable, HorizBox, OneLineText, Pad, PluralLabel, ScreenTitleText, ScrollableScreen, SectionTitleLabel, SmallTitle, WrapBox } from "../component/basics";
import { QuietSystemMessage } from "../component/message";
import { Post } from "../component/post";
import { PostInput } from "../component/replyinput";
import { UserFace } from "../component/userface";
import { VideoPlayer } from "../component/video";
import { authorRobEnnals } from "../data/authors";
import { VideoCamera } from "../platform-specific/videocamera";
import { useCollection, useDatastore, useGlobalProperty, useObject, usePersonaKey } from "../util/datastore";
import { pushSubscreen } from "../util/navigate";
import { expandDataList } from "../util/util";
import { useState } from "react";


export const VideoQAProfilePrototype = {
    key: "videoqaprofile",
    name: "Video Q&A Profile",
    author: authorRobEnnals,
    description: 'Answer a set of questions with videos. Helps people get a better sense of each other as people',
    date: 'Mon Aug 07 2023 13:24:16 GMT-0700 (Pacific Daylight Time)',
    screen: VideoQAProfileScreen,
    subscreens: {
        question: {screen: QuestionScreen, title: QuestionScreenTitle},
        person: {screen: PersonScreen, title: PersonScreenTitle}
    },
    hasAdmin: true,
    instance: [
        {
            key: 'cat-club', name: 'Cat Club',
            admin: 'a',
            question: expandDataList([
                {key: 'like', text: 'Why do you like cats?'},
                {text: "How did you choose your cat's name?"},
                {text: 'Show us your cat'},
            ]),
            post: expandDataList([
                {from: 'b', question: 'like', uri: 'https://new-public-demo.web.app/videos/one_two_three_four.webm'},
                {from: 'f', question: 'like', uri: 'https://new-public-demo.web.app/videos/Rob_Isaac_name.webm'}    
            ])
        }
    ],
    newInstanceParams: []
}

export function VideoQAProfileScreen() {
    const name = useGlobalProperty('name');
    const questions = useCollection('question', {sortBy: 'time', reverse: true});
    const people = useCollection('persona', {sortBy: 'name'});
    const personaKey = usePersonaKey();
    const admin = useGlobalProperty('admin');
    const datastore = useDatastore();

    return <ScrollableScreen grey>
        <BigTitle>{name}</BigTitle>

        <SectionTitleLabel label='Questions' />

        {admin == personaKey ? 
            <PostInput placeholder="Add a new question" postHandler={({post}) => datastore.addObject('question', post)} />
        : null}

        {questions.map(question =>
            <QuestionPreview key={question.key} question={question} />
        )}
        <Pad size={20} />
        <SectionTitleLabel label='People' />
        {people.map(person =>
            <PersonPreview key={person.key} person={person} />
        )}
    </ScrollableScreen>
}

function QuestionPreview({question}) {
    const answers = useCollection('post', {sortBy: 'time', filter: {question: question.key}});
    return <Card onPress={() => pushSubscreen('question', {questionKey: question.key})}>
        <SmallTitle>{question.text}</SmallTitle>
        <Pad size={8} />
        <HorizBox>
            {answers.map(answer =>
                <HorizBox key={answer.key}><UserFace key={answer.key} userId={answer.from} />
                    <Pad size={2} />
                </HorizBox>
            )}
        </HorizBox>
    </Card>
}

function PersonPreview({person}) {
    const posts = useCollection('post', {sortBy: 'time', filter: {from: person.key}, reverse: true});
    return <Card onPress={() => pushSubscreen('person', {personaKey: person.key})}>
        <HorizBox>
            <UserFace userId={person.key} size={40} />
            <Pad size={8} />
            <View>
                <SmallTitle pad={false} >{person.name}</SmallTitle>
                <Pad size={2} />
                {posts.length > 0 ?
                    <BodyText><PluralLabel count={posts.length} singular='answer' plural='answers' /></BodyText>
                : null}
            </View>

        </HorizBox>
    </Card>
}

function PersonScreenTitle({personaKey}) {
    const persona = useObject('persona', personaKey);
    return <ScreenTitleText title={persona.name} />
}

function PersonPost({post}) {
    const questionKey = post.question;
    const question = useObject('question', questionKey);
    const [hover, setHover] = useState(false); 

    return <Card fitted>
        <Clickable onPress={() => pushSubscreen('question', {questionKey: question.key})} onHoverChange={setHover}>
            <SmallTitle hover={hover} width={200}>{question.text}</SmallTitle>
        </Clickable>
        <Pad size={8} />
        <VideoPlayer uri={post.uri} size={200} />
    </Card>
}

function PersonScreen({personaKey}) {
    const persona = useObject('persona', personaKey);
    const posts = useCollection('post', {sortBy: 'time', filter: {from: personaKey}});

    return <ScrollableScreen grey>
        <HorizBox center>
            <UserFace userId={personaKey} size={56} />
            <Pad size={12} />
            <View>
                <BigTitle pad={false}>{persona.name}</BigTitle>
                <Pad size={2} />
                <BodyText><PluralLabel count={posts.length} singular='answer' plural='answers' /></BodyText>
            </View>
        </HorizBox>

        <Pad size={16} />

        <WrapBox>
            {posts.map(post =>
                <PersonPost key={post.key} post={post} />  
            )}
        </WrapBox>
    </ScrollableScreen>
}


function QuestionScreenTitle({questionKey}) {
    console.log('questionKey', questionKey);
    const question = useObject('question', questionKey);
    console.log('question', question);
    return <ScreenTitleText title={question.text} />
}


function QuestionScreen({questionKey}){
    const question = useObject('question', questionKey);
    const posts = useCollection('post', {sortBy: 'time', filter: {question: questionKey}, reverse: true});
    const personaKey = usePersonaKey();
    const datastore = useDatastore();

    const currentPost = posts.find(post => post.from == personaKey);

    function onSubmitRecording({url}) {
        console.log('onSubmitRecording', url);
        if (currentPost) {
            datastore.updateObject('post', currentPost.key, {uri: url});
        } else {
            datastore.addObject('post', {question: questionKey, uri: url});
        }
    }

    return <ScrollableScreen grey>
        <BigTitle>{question.text}</BigTitle>

        <VideoCamera onSubmitRecording={onSubmitRecording} action={currentPost ? 'Update your Video Response' : 'Record a Video Response'} />

        <WrapBox>
        {posts.map(post =>        
            <Post fitted key={post.key} post={post} onPressAuthor={() => pushSubscreen('person', {personaKey: post.from})}>
                <VideoPlayer uri={post.uri} />
            </Post>
        )}
        </WrapBox>
    </ScrollableScreen>    
}