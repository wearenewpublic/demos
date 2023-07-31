import { Text } from "react-native";
import { Card, Clickable, HorizBox, Narrow, Pad, Pill, ScreenTitleText, ScrollableScreen, WideScreen } from "../component/basics";
import { PostInput } from "../component/replyinput";
import { authorRobEnnals } from "../data/authors";
import { statusTentative } from "../data/tags";
import { useCollection, useData, useDatastore, useObject } from "../util/datastore";
import { expandDataList, toTitleCase } from "../util/util";
import { post_parents, post_parents_comments } from "../data/posts";
import { pushSubscreen } from "../util/navigate";
import { useTranslation } from "../component/translation";
import { BasicComments, CommentContext } from "../component/comment";
import { Post } from "../component/post";
import { useContext, useState } from "react";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { ChatInput } from "../component/chatinput";
import { Message, QuietSystemMessage } from "../component/message";
import { askGptToEvaluateConversationAsync } from "../component/chatgpt";

export const ConversationDashboardPrototype = {
    key: 'conversationdashboard',
    name: 'Conversation Dashboard',
    date: 'Wed Jul 26 2023 10:32:43 GMT-0700 (Pacific Daylight Time)',
    author: authorRobEnnals,
    description: 'Show how well different conversations are progressing',
    tags: [],
    status: statusTentative,
    screen: ConversationDashboardScreen,
    subscreens: {
        post: {screen: PostScreen, title: PostScreenTitle},
    },
    instance: [
        {
            key: 'parents', name: 'Sunnyvale Parents',
            post: expandDataList(post_parents),
            message: expandDataList(post_parents_comments),
            comment: expandDataList(post_parents_comments)
       }   
    ]
}

function ConversationDashboardScreen() {
    const posts = useCollection('post', {sortBy: 'time', reverse: true});

    return <ScrollableScreen grey>
        <PostInput />
        {posts.map(post =>
            <DashboardPost key={post.key} post={post} />
        )}
    </ScrollableScreen>
}

function DashboardPost({post}) {
    return <Clickable onPress={() => pushSubscreen('post', {postKey: post.key})}>
        <Card>
            <HorizBox spread>
                <Text numberOfLines={1} style={{fontWeight: '600'}}>{post.text}</Text>
                <GoodnessPill post={post} />
            </HorizBox>            
        </Card>   
    </Clickable>
}

const postTypeGoodness = {
    helpful: 'green',
    constructive: 'green',
    neutral: 'grey',
    dull: 'blue',
    awkward: 'orange',
    toxic: 'red'
}

function GoodnessPill({post}) {
    const goodness = post.goodness || 'dull';
    const color = postTypeGoodness[goodness];
    return <Pill color={color} label={toTitleCase(goodness)} />
}


function PostScreenTitle({postKey}) {
    const post = useObject('post', postKey);
    const author = useObject('persona', post?.from);
    const tPost = useTranslation('Post');
    return <HorizBox spread>
        <ScreenTitleText title={author.name + "'s " + tPost} />
        <Pad/>
        <GoodnessPill post={post} />
    </HorizBox>
}


function PostScreen({postKey}) {
    const post = useObject('post', postKey);
    const messages = useCollection('message', {sortBy: 'time', filter: {replyTo: postKey}});
    const [inProgress, setInProgress] = useState(false);
    const datastore = useDatastore();

    async function onSend(text) {       
        setInProgress(true);
        datastore.addObject('message', {text, replyTo: postKey});
        const goodness = await askGptToEvaluateConversationAsync({datastore, promptKey: 'goodness', messages, newMessageText: text, startPost: post});
        console.log('goodness', goodness);
        datastore.updateObject('post', postKey, {goodness});
        setInProgress(false);
    }

    return <WideScreen>
        <BottomScroller>
            <Narrow>
                <Post post={post} />
            </Narrow>
            <Pad size={8} />
            {messages.map(message => 
                <Message key={message.key} messageKey={message.key}/>
            )}
        </BottomScroller>
        {inProgress ? 
            <QuietSystemMessage label='Analyzing conversation mood...' />
        : null}
        <ChatInput onSend={onSend} />
    </WideScreen>
}


