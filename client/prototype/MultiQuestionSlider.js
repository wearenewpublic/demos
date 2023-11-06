import { Text, View } from "react-native";
import { BigTitle, Card, FormField, HorizBox, OneLineText, OneLineTextInput, Pad, ScreenTitleText, ScrollableScreen, SectionTitleLabel, SmallTitle } from "../component/basics";
import { PostInput } from "../component/replyinput";
import { authorRobEnnals } from "../data/authors";
import { useCollection, useDatastore, useGlobalProperty, useObject, usePersonaKey } from "../util/datastore";
import { UserFace } from "../component/userface";
import { pushSubscreen } from "../util/navigate";
import { expandDataList } from "../util/util";
import { QuietSystemMessage } from "../component/message";
import { RatingSelector, RatingSummary, RatingWithLabel } from "../component/rating";
import { Post, PostActionEdit, PostActionLike } from "../component/post";
import React, { useState } from "react";
import { PopupSelector } from "../platform-specific/popup.web";

export const MultiQuestionSlider = {
    key: 'multislide',
    date: 'Nov 3 2023',
    name: 'Multi-Question Slider',
    author: authorRobEnnals,
    description: 'Multi-Question version of Comment Slider',
    screen: MultiQuestionSliderScreen,
    subscreens: {
        question: {screen: QuestionScreen, title: QuestionScreenTitle},
    },
    instance: [
        {
            key: 'test', name: 'Test',
            admin: 'a', 
            question: expandDataList([
                {key: 'q1', text: 'Which is better, dogs or cats', sideOne: 'Dogs', sideTwo: 'Cats'},
                {key: 'q2', text: 'Is this a good question?', sideOne: 'Yes', sideTwo: 'No'},
                {key: 'q3', text: 'Should we destroy everything that exists?', sideOne: 'Yes', sideTwo: 'No'},
            ]),
        },
    ],
    newInstanceParams: []
}

function MultiQuestionSliderScreen() {
    const name = useGlobalProperty('name');
    const questions = useCollection('question', {sortBy: 'time', reverse: true});
    const admin = useGlobalProperty('admin');
    const personaKey = usePersonaKey();
    const datastore = useDatastore();

    return <ScrollableScreen grey>
        <BigTitle>{name}</BigTitle>
        {admin == personaKey ? 
            <PostInput placeholder="Add a new question" 
                bottomWidgets={[ProConWidget]}
                postHandler={({post}) => datastore.addObject('question', post)} />
        : null}

        {questions.map(question =>
            <QuestionPreview key={question.key} question={question} />
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

function ProConWidget({post, onPostChanged}) {
    return <View>
        <FormField label='Side One'>            
            <OneLineTextInput placeholder='Pro' value={post.sideOne ?? ''} onChange={sideOne => onPostChanged({...post, sideOne})} />
        </FormField>
        <FormField label='Side Two'>            
            <OneLineTextInput placeholder='Con' value={post.sideTwo ?? ''} onChange={sideTwo => onPostChanged({...post, sideTwo})} />
        </FormField>
    </View>
}


function QuestionScreenTitle({questionKey}) {
    const question = useObject('question', questionKey);
    return <ScreenTitleText title={question?.text} />
}

const QuestionContext = React.createContext({});

function QuestionScreen({questionKey}) {
    const posts = useCollection('post', {sortBy: 'time', reverse: true, filter: {question: questionKey}});
    const questionObj = useObject('question', questionKey);
    const question = questionObj.text;
    const sideOne = questionObj.sideOne;
    const sideTwo = questionObj.sideTwo;
    const personaKey = usePersonaKey();
    const [selection, setSelection] = useState(null);
    const hasAnswered = posts.some(post => post.from == personaKey);
    const ratingLabels = getRatingLabels({sideOne, sideTwo});
    const ratingCounts = countRatings(posts);
    const datastore = useDatastore();
    const auto = false;
    var shownPosts = posts;
    if (selection) {
        shownPosts = posts.filter(post => post.slide == selection);
    }

    function onPost({post}) {
        datastore.addObject('post', {...post, question: questionKey});
        setSelection(null);
    }

    return <ScrollableScreen grey>
        <QuestionContext.Provider value={{questionKey, sideOne, sideTwo}} >
        <BigTitle>{question}</BigTitle>
        {hasAnswered ? 
            <QuietSystemMessage label='You have already written an opinion' />
        :
            <PostInput placeholder={"Can you say more?" + (auto ? '' : ' (optional)')}
                getCanPost={getCanPost}
                topWidgets={[EditRating]} 
                bottomWidgets={[WarnIfMissingRating]}
                postHandler={onPost}
            />
        }

        <Card>
            <SectionTitleLabel label='Filter Responses by Opinion' />
            <RatingSummary labelSet={ratingLabels} ratingCounts={ratingCounts} selection={selection} onChangeSelection={setSelection} />
        </Card>

        {selection ?
            <QuietSystemMessage label='Showing only responses with selected opinion'/>
        :null}

        {shownPosts.map(post => 
            <Post key={post.key} post={post} actions={[PostActionLike, PostActionEdit]}
                editWidgets={[EditRating]}
                topBling={<RatingWithLabel value={post.slide} labelSet={ratingLabels} placeholder='Analysing Opinion...' />}
            />
        )}
        </QuestionContext.Provider>
    </ScrollableScreen>
}


function getCanPost({datastore, post}) {
    const auto = datastore.getGlobalProperty('auto');
    if (auto) {
        return post.text.length > 0;
    } else {
        return post.slide && post.slide != '0';
    }
}

function getRatingLabels({sideOne, sideTwo}) {
    const ratingLabels = [
        'Strongly ' + sideOne,
        sideOne + ' with reservations',
        "It's complicated",
        sideTwo + " with reservations",
        "Strongly " + sideTwo
    ]
    return ratingLabels;
}

function countRatings(posts) {
    var ratingCounts = [0,0,0,0,0];
    for (const post of posts) {
        ratingCounts[post.slide-1] += 1;
    }
    return ratingCounts;
}

function EditRating({post, onPostChanged}) {
    const {sideOne, sideTwo} = React.useContext(QuestionContext);
    const ratingLabels = getRatingLabels({sideOne, sideTwo});
    const selectorItems = ratingLabels.map((label, index) => ({label, key: index+1}))

    return <View>
        {/* <PopupSelector label='Rate your opinion' value={post.slide || 0} 
            items={[{label: 'Rate your opinion', key:0}, ...selectorItems]} onSelect={slide => onPostChanged({...post, slide})} /> */}
            <RatingSelector value={post.slide} sideOne={sideOne} sideTwo={sideTwo} 
                labelSet={ratingLabels} placeholder='Rate your opinion' onChangeValue={slide => onPostChanged({...post, slide})} />
        <Pad />
    </View>
}

function WarnIfMissingRating({post, onPostChanged}) {
    if (!post.slide || post.slide == '0') {
        return <QuietSystemMessage label='Please rate your opinion' />
    } else {
        return null;
    }   
}
