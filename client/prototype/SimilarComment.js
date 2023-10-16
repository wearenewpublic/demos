import { View } from "react-native";
import { Article, MaybeArticleScreen } from "../component/article";
import { Card, Center, Clickable, HorizBox, ListItem, Narrow, Pad, Pill, PrimaryButton, ScrollableScreen, SmallTitle, SmallTitleLabel } from "../component/basics";
import { BasicComments } from "../component/comment";
import { Post } from "../component/post";
import { PostInput } from "../component/replyinput";
import { godzilla_article } from "../data/articles/godzilla";
import { authorRobEnnals } from "../data/authors";
import { godzilla_comments_threaded } from "../data/threaded";
import { useCollection, useDatastore, useGlobalProperty, useObject } from "../util/datastore";
import { expandDataList } from "../util/util";
import { pushSubscreen } from "../util/navigate";
import { QuietSystemMessage } from "../component/message";
import { gptProcessAsync } from "../component/chatgpt";
import { useState } from "react";
import { askGptToEvaluateMessageTextAsync } from "../component/chatgpt";
import { getTextEmbedding, useMessageEmbeddingMap, useTextEmbedding } from "../component/embeddings";
import { sortEmbeddingsByDistance } from "../util/cluster";

export const SimilarCommentPrototype = {
    key: 'similarcomment',
    name: "Similar Comment",
    date: 'Oct 16 2023 14:10:38 GMT-0700 (Pacific Daylight Time)',
    author: authorRobEnnals,
    description: 'AI shows you the most similar existing comment before you post yours, so you can see if you are saying something new.',
    screen: SimilarCommentScreen,
    instance: [
        {key: 'godzilla', name: 'Godzilla', article: godzilla_article, 
            country: 'The United States',
            post: expandDataList([
                {from: 'a', text: "Giant monsters don't exist", checkedStatus: 'most people'},
                {from: 'b', text: 'Giant Monsters shouldn\'t be allowed to rampage cities.', checkedStatus: 'almost everyone'}
            ])
        }
    ],
}



function SimilarCommentScreen() {
    const posts = useCollection('post', {sortBy: 'time', reverse: true});

    return <MaybeArticleScreen articleChildLabel='Comments'>
        <Narrow>
            <PostInput placeholder="Add a relevant fact" bottomWidgets={[EditCheckSimilarity]} getCanPost={getCanPost}/>
            {posts.map(post => <Post key={post.key} post={post} />)}
        </Narrow>
    </MaybeArticleScreen>
}

function EditCheckSimilarity({post, onPostChanged}) {
    async function checkNovelty() {
        onPostChanged({...post, checkedText: post.text, waiting: false});
    }

    if (post.checkedText == post.text) {
        return <NoveltyCheckResult text={post.checkedText} />
    } else {
        return <PrimaryButton label='Check Novelty' onPress={checkNovelty} />
    }
}

function NoveltyCheckResult({text}) {
    const embedding = useTextEmbedding(text);
    const posts = useCollection('post');
    const postEmbeddings = useMessageEmbeddingMap(posts);
    const sorted = sortEmbeddingsByDistance(null, embedding, postEmbeddings);
    const closestKey = sorted[0]?.key;
    const closestPost = useObject('post', closestKey);

    if (!embedding) {
        return <QuietSystemMessage label='Checking comment novelty...' />
    } else if (closestPost) {    
        return <View>
            <SmallTitle>Most Similar Comment</SmallTitle>
            <Post post={closestPost} />
        </View>
    } else {
        return null;
    }
}

function getCanPost({post}) {
    return post.text.length > 0 && post.checkedText == post.text
}

