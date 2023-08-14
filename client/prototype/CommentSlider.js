import { useState } from "react";
import { BigTitle, Card, ScrollableScreen, SectionTitleLabel } from "../component/basics";
import { QuietSystemMessage } from "../component/message";
import { Post, PostActionEdit, PostActionLike } from "../component/post";
import { RatingSummary, RatingWithLabel, SpectrumRating } from "../component/rating";
import { PostInput } from "../component/replyinput";
import { authorRobEnnals } from "../data/authors";
import { post_starwars } from "../data/posts";
import { useCollection, useGlobalProperty, usePersonaKey } from "../util/datastore";
import { expandDataList } from "../util/util";
import { askGptToEvaluateMessageTextAsync, gptProcessAsync } from "../component/chatgpt";

export const CommentSliderPrototype = {
    key: 'commentsliderqa',
    date: 'Mon Jul 24 2023 20:50:03 GMT-0700 (Pacific Daylight Time)',
    name: 'CommentSlider Q&A',
    author: authorRobEnnals,
    description: 'When writing an opinion about a disputed topic, say where you stand on the spectrum of opinion',
    screen: CommentSliderScreen,
    instance: [
        {
            key: 'wars', name: 'Star Wars',
            question: 'Which is better. Star Wars or Star Trek?',
            sideOne: 'Pro Star Wars',
            sideTwo: 'Pro Star Trek',
            post: expandDataList(post_starwars)
        },
        {
            key: 'wars-auto', name: 'Star Wars (Auto-Slider)',
            auto: true,
            question: 'Which is better. Star Wars or Star Trek?',
            sideOne: 'Pro Star Wars',
            sideTwo: 'Pro Star Trek',
            post: expandDataList(post_starwars)
        }
    ],

    newInstanceParams: [
        {key: 'auto', name: 'Auto-Slider', type: 'boolean', default: false},
        {key: 'question', name: 'Question', type: 'shorttext'},
        {key: 'sideOne', name: 'Side One', type: 'shorttext'},
        {key: 'sideTwo', name: 'Side Two', type: 'shorttext'},
    ]
}

function CommentSliderScreen() {
    const posts = useCollection('post', {sortBy: 'time', reverse: true});
    const question = useGlobalProperty('question');
    const sideOne = useGlobalProperty('sideOne');
    const sideTwo = useGlobalProperty('sideTwo');
    const personaKey = usePersonaKey();
    const [selection, setSelection] = useState(null);
    const hasAnswered = posts.some(post => post.from == personaKey);
    const ratingLabels = getRatingLabels({sideOne, sideTwo});
    const ratingCounts = countRatings(posts);
    const auto = useGlobalProperty('auto') || false;
    var shownPosts = posts;
    if (selection) {
        shownPosts = posts.filter(post => post.slide == selection);
    }

    return <ScrollableScreen grey>
        <BigTitle>{question}</BigTitle>
        {hasAnswered ? 
            <QuietSystemMessage label='You have already written an opinion' />
        :
            <PostInput placeholder={"What's your opinion?" + (auto ? '' : ' (optional)')}
                getCanPost={getCanPost}
                topWidgets={auto ? [] : [EditRating]} 
                postHandler={auto ? postHandlerAsync : null} />
        }

        <Card>
            <SectionTitleLabel label='Filter by Opinion' />
            <RatingSummary labelSet={ratingLabels} ratingCounts={ratingCounts} selection={selection} onChangeSelection={setSelection} />
        </Card>

        {selection ?
            <QuietSystemMessage label='Showing only posts with selected opinion'/>
        :null}

        {shownPosts.map(post => 
            <Post key={post.key} post={post} actions={[PostActionLike, PostActionEdit]}
                saveHandler={auto ? postHandlerAsync : null}
                editWidgets={auto ? [] : [EditRating]}
                topBling={<RatingWithLabel value={post.slide} labelSet={ratingLabels} placeholder='Analysing Opinion...' />}
            />
        )}
    </ScrollableScreen>
}

function getCanPost({datastore, post}) {
    const auto = datastore.getGlobalProperty('auto');
    if (auto) {
        return post.text.length > 0;
    } else {
        return post.slide != null;
    }
}

async function postHandlerAsync({datastore, postKey, post}) {
    console.log('postHandlerAsync', post);
    const sideOne = datastore.getGlobalProperty('sideOne');
    const sideTwo = datastore.getGlobalProperty('sideTwo');
    var key;
    if (postKey) {
        key = postKey;
        await datastore.setObject('post', key, {...post, slide: null});
    } else {
        key = await datastore.addObject('post', post);
    }
    // const key = postKey ?? await datastore.addObject('post', post);
    const result = await gptProcessAsync({promptKey: 'slider', params: {text: post.text, sideOne, sideTwo}});
    console.log('result', result);
    const slide = result.judgement;
    await datastore.updateObject('post', key, {slide});
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
    const sideOne = useGlobalProperty('sideOne');
    const sideTwo = useGlobalProperty('sideTwo');
    const ratingLabels = getRatingLabels({sideOne, sideTwo});

    return <RatingWithLabel value={post.slide} editable labelSet={ratingLabels} 
        placeholder='Rate your opinion'
        onChangeValue={slide => onPostChanged({...post, slide})} />
}

