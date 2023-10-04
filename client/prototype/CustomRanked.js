import { EditableText, Narrow, Pad, PadBox, Pill, PrimaryButton, ScreenTitleText, ScrollableScreen, WideScreen } from "../component/basics";
import { BasicComments } from "../component/comment";
import { Post, PostActionComment, PostActionEdit, PostActionLike } from "../component/post";
import { useTranslation } from "../component/translation";
import { authorRobEnnals } from "../data/authors";
import { post_parents, post_parents_comments } from "../data/posts";
import { useCollection, useDatastore, useGlobalProperty, useObject } from "../util/datastore";
import { expandDataList } from "../util/util";
import { pushSubscreen } from "../util/navigate";
import { PostInput } from "../component/replyinput";
import { ExpandSection } from "../component/expand-section";
import { gptProcessAsync } from "../component/chatgpt";
import { useState } from "react";
import { QuietSystemMessage } from "../component/message";

const civilCriteria = 
`* Cite sources for any important facts
* All opinions are expressed in a civil way
* Even handed and empathetic when discussing politically partisan issues
* Assumes good intent from all parties
* Helpful towards others`

const helperCriteria = 
`* Either asking for help from others, providing help to others, or alerting others about something important
* Avoids discussions of politics
* All opinions expressed in a civil way`

export const CustomRankedPrototype = {
    key: 'customranked',
    date: 'Thu Oct 3 2023 20:21:43 GMT-0700 (Pacific Daylight Time)',
    name: 'Custom Ranked Feed',
    author: authorRobEnnals,
    description: 'Rank a feed of posts, based on criteria provided by the user',
    screen: CustomRankedScreen,
    subscreens: {
        post: {screen: PostScreen, title: PostScreenTitle},
    },
    instance: [
        {key: 'parents', name: 'Sunnyvale Parents', 
            criteria: helperCriteria,
            post: expandDataList(post_parents),
            comment: expandDataList(post_parents_comments)
        },
        {key: 'test', name: 'Test', 
            criteria: civilCriteria,
            post: expandDataList([
                {from: 'b', text: 'I have a lot of empathy for both the pro-choice and pro-life groups. There are people who I greatly respect who are pro-choice, and people who I greatly respect who are pro-life. And I think they actually have a lot in common. Both want the best for women, and for society.'},
                {from: 'a', text: 'All these people different to me are terrible and we should shout at them'},
            ]),
            comment: expandDataList([])
        }
    ],
    newInstanceParams: []
}

export function CustomRankedScreen() {
    const posts = useCollection('post', {sortBy: 'time', reverse: true});
    const criteria = useGlobalProperty('criteria');
    const datastore = useDatastore();
    const [scoreMap, setScoreMap] = useState({});
    const [inProgress, setInProgress] = useState(false);

    const rankedPosts = posts.slice().sort((a, b) => (scoreMap[b.key] ?? 0) - (scoreMap[a.key] ?? 0));

    async function onRank() {
        setInProgress(true);
        const pScores = posts.map(post => 
            gptProcessAsync({datastore, promptKey: 'customrank', params: {text: post.text, criteria}})
        );
        const scores = await Promise.all(pScores);
        console.log('scores', scores);
        var scoreMap = {};
        for (var i = 0; i < posts.length; i++) {
            scoreMap[posts[i].key] = scores[i]?.judgement || 0;
        }
        console.log('scoreMap', scoreMap);
        setScoreMap(scoreMap);
        setInProgress(false);
    }

    return <ScrollableScreen grey>
        <ExpandSection title='Ranking Criteria' defaultOpen>
            <EditableText value={criteria} 
            onChange={newCriteria => datastore.setGlobalProperty('criteria', newCriteria)} 
            placeholder='Enter ranking criteria' />
            
            <Pad />
            <PadBox>
                {inProgress && <QuietSystemMessage label='Computing Ranking...' />}
                {!inProgress && <PrimaryButton onPress={onRank} label='Compute Ranking' />}
            </PadBox>
        </ExpandSection>
        <PostInput />
        {rankedPosts.map(post =>
            <Post key={post.key} post={post} actions={[PostActionLike, PostActionComment, PostActionEdit]}
                topBling={<ScoreWidget score={scoreMap[post.key]} />}
               hasComments onComment={() => pushSubscreen('post', {postKey: post.key})}/>
        )}
    </ScrollableScreen>
}

function ScoreWidget({score}) {
    switch (score) {
        case 5: return <Pill big label='Very Good' color='green' />
        case 4: return <Pill big label='Good' color='green' />
        case 3: return <Pill big label='Okay' color='orange' />
        case 2: return <Pill big label='Bad' color='red' />
        case 1: return <Pill big label='Very Bad' color='red' />
        default: return <Pill big label='Unknown' color='grey' />
    }
}

function PostScreenTitle({postKey}) {
    const post = useObject('post', postKey);
    const author = useObject('persona', post?.from);
    const tPost = useTranslation('Post');
    return <ScreenTitleText title={author.name + "'s " + tPost} />
}

function PostScreen({postKey}) {
    const post = useObject('post', postKey);
    return <WideScreen>
        <Narrow>
            <Post noCard post={post} />
            <Pad/>
            <BasicComments about={postKey} />
        </Narrow>
    </WideScreen>
}


