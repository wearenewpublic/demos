import { View } from "react-native";
import { Article, MaybeArticleScreen, articleGodzilla } from "../component/article";
import { Card, Center, Clickable, HorizBox, ListItem, Narrow, Pad, Pill, PrimaryButton, ScrollableScreen, SmallTitleLabel } from "../component/basics";
import { BasicComments } from "../component/comment";
import { Post } from "../component/post";
import { PostInput } from "../component/replyinput";
import { godzilla_article } from "../data/articles/godzilla";
import { authorRobEnnals } from "../data/authors";
import { godzilla_comments_threaded } from "../data/threaded";
import { useCollection, useDatastore, useGlobalProperty } from "../util/datastore";
import { expandDataList } from "../util/util";
import { pushSubscreen } from "../util/navigate";
import { QuietSystemMessage } from "../component/message";
import { gptProcessAsync } from "../component/chatgpt";
import { useState } from "react";
import { askGptToEvaluateMessageTextAsync } from "../component/chatgpt";
import { videoGodzilla } from "../component/fakevideo";

export const OpinionPopularityPrototype = {
    key: 'opinionpopularity',
    name: "Opinion Popularity",
    date: 'Tue Oct 03 2023 15:06:20 GMT-0700 (Pacific Daylight Time)',
    author: authorRobEnnals,
    description: 'AI estimates what fraction of the population agrees with an opinion',
    screen: OpinionPopularityScreen,
    instance: [
        {key: 'godzilla', name: 'Godzilla', article: godzilla_article, 
            country: 'The United States',
            post: expandDataList([
                {from: 'a', text: "Giant monsters don't exist", checkedStatus: 'most people'},
                {from: 'b', text: 'Giant Monsters shouldn\'t be allowed to rampage cities.', checkedStatus: 'almost everyone'}
            ])
        },
        {key: 'godzilla-video', name: 'Godzilla - Video', videoKey: videoGodzilla, 
            country: 'The United States',
            post: expandDataList([
                {from: 'a', text: "Giant monsters don't exist", checkedStatus: 'most people'},
                {from: 'b', text: 'Giant Monsters shouldn\'t be allowed to rampage cities.', checkedStatus: 'almost everyone'}
            ])
        }
    ]
}

function OpinionPopularityScreen() {
    const posts = useCollection('post', {sortBy: 'time', reverse: true});

    return <MaybeArticleScreen articleChildLabel='Opinions with Estimated Popular Support'>
        <Narrow>
            <PostInput placeholder="Add a relevant fact" bottomWidgets={[EditCheckFact]} getCanPost={getCanPost}/>
            {posts.map(post => <FactPost key={post.key} post={post} />)}
        </Narrow>
    </MaybeArticleScreen>

}

function PopularityCheckStatus({checkedStatus}) {
    switch (checkedStatus?.toLowerCase()?.trim()) {
        case 'almost everyone':
            return <Pill big label='Almost Everyone' color='green' />
        case 'most people':
            return <Pill big label='Most People' color='green' />
        case 'some people':
            return <Pill big label='Some People' color='orange' />
        case 'few people':
            return <Pill big label='Few People' color='red' />
        case 'very few people':
            return <Pill big label='Very Few People' color='red' />    
        default: 
            return <Pill big label='Unknown' color='grey' />
    }
}

function EditCheckFact({post, onPostChanged}) {
    const datastore = useDatastore();
    const [inProgress, setInprogress] = useState(false);
    const country = useGlobalProperty('country');
    async function checkFact() {
        setInprogress(true);
        onPostChanged({...post, checkedText: post.text, waiting: true});
        const checkedStatus = await askGptToEvaluateMessageTextAsync({datastore, promptKey: 'checkpopularity', text: post.text, params: {country}});
        console.log('result', checkedStatus);
        onPostChanged({...post, checkedText: post.text, checkedStatus, waiting: false});
        setInprogress(false);
    }

    if (inProgress) {
        return <QuietSystemMessage label='Checking popularity...' />
    } else if (post.checkedText == post.text) {
        return <PopularityCheckStatus checkedStatus={post.checkedStatus} />
    } else {
        return <PrimaryButton label='Check Popularity' onPress={checkFact} />
    }
}

function getCanPost({post}) {
    return post.text.length > 0 && post.checkedText == post.text && post.checkedStatus
}

function FactPost({post}) {
    return <Post post={post} topBling={<PopularityCheckStatus checkedStatus={post.checkedStatus} />} />
}

