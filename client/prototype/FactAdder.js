import { View } from "react-native";
import { Article } from "../component/article";
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

export const FactAdderPrototye = {
    key: 'factadder',
    name: "Fact Adder",
    date: 'Thu Aug 10 2023 09:39:21 GMT-0700 (Pacific Daylight Time)',
    author: authorRobEnnals,
    description: 'People can add facts to an article, and AI checks that facts are likely true',
    screen: FactAdderScreen,
    subscreens: {
        facts: {screen: FactListScreen, title: 'Facts'}
    },
    instance: [
        {key: 'godzilla', name: 'Godzilla', article: godzilla_article, 
            post: expandDataList([
                {from: 'a', text: "Giant monsters don't exist"},
                {from: 'b', text: 'Eight million people live in New York City'}
            ])
        }
    ],
    newInstanceParams: [
        {key: 'article.title', name: 'Article Title', type: 'shorttext'},
        {key: 'article.subtitle', name: 'Article Subtitle', type: 'shorttext'},
        {key: 'article.date', name: 'Article Date', type: 'shorttext'},
        {key: 'article.author', name: 'Article Author', type: 'shorttext'},
        {key: 'article.authorFace', name: 'Article Author Face URL', type: 'url'},
        {key: 'article.photo', name: 'Article Photo URL', type: 'url'},
        {key: 'article.photoCaption', name: 'Article Photo Caption', type: 'shorttext'},
        {key: 'article.rawText', name: 'Article Text', type: 'longtext'},
    ]   
}



function FactAdderScreen() {
    const article = useGlobalProperty('article');

    return <ScrollableScreen maxWidth={800}>
        <Article article={article} embed={<FactsPreview />}>
            <Narrow>
                <SmallTitleLabel label='Relevant Facts'/>
                <Pad />
                <FactList />
                <Pad size={32} />
            </Narrow>
        </Article>
    </ScrollableScreen>   
}

function FactsPreview() {
    const posts = useCollection('post', {sortBy: 'time', reverse: true});
    return <Card onPress={() => pushSubscreen('facts')}>
            <Center><SmallTitleLabel label='Facts'/></Center>
            <Pad size={4} />
        {posts.map(post => <ListItem key={post.key} title={post.text} />)}
    </Card>
}

function FactListScreen() {
    return <ScrollableScreen maxWidth={800}>
        <Narrow>
            <FactList />
        </Narrow>
    </ScrollableScreen>
}

function FactList() {
    const posts = useCollection('post', {sortBy: 'time', reverse: true});
    return <View>
        <PostInput placeholder="Add a relevant fact" bottomWidgets={[EditCheckFact]} getCanPost={getCanPost}/>
        {posts.map(post => <FactPost key={post.key} post={post} />)}
    </View>
}

function FactCheckStatus({checkedStatus}) {
    switch (checkedStatus) {
        case 'definitely true':
            return <Pill big label='Definitely True' color='green' />
        case 'probably true':
            return <Pill big label='Probably True' color='green' />
        case 'probably false':
            return <Pill big label='Probably False' color='red' />
        case 'definitely false':
            return <Pill big label='Definitely False' color='red' />
        case 'unknown':
            return <Pill big label='Unknown' color='grey' />
        return null;
    }
}

function EditCheckFact({post, onPostChanged}) {
    const datastore = useDatastore();
    const [inProgress, setInprogress] = useState(false);
    async function checkFact() {
        setInprogress(true);
        onPostChanged({...post, checkedText: post.text, waiting: true});
        const checkedStatus = await askGptToEvaluateMessageTextAsync({datastore, promptKey: 'checkfact', text: post.text});
        console.log('result', checkedStatus);
        onPostChanged({...post, checkedText: post.text, checkedStatus, waiting: false});
        setInprogress(false);
    }

    if (inProgress) {
        return <QuietSystemMessage label='Checking fact...' />
    } else if (post.checkedText == post.text) {
        return <FactCheckStatus checkedStatus={post.checkedStatus} />
    } else {
        return <PrimaryButton label='Check Fact' onPress={checkFact} />
    }
}

function getCanPost({post}) {
    return post.text.length > 0 && post.checkedText == post.text && 
        (post.checkedStatus == 'definitely true' || post.checkedStatus == 'probably true');
}

function FactPost({post}) {
    return <Post post={post} />
}

