import { Image, View } from "react-native";
import { godzilla_article } from "../data/articles/godzilla";
import { authorRobEnnals } from "../data/authors";
import { expandDataList, expandUrl } from "../util/util";
import { MaybeArticleScreen } from "../component/article";
import { BigTitle, BodyText, Card, Center, ListItem, MiniTitle, Narrow, Pad, PadBox, ScrollableScreen, SectionBox, Separator, SmallTitle, SmallTitleLabel } from "../component/basics";
import { useCollection, useGlobalProperty, useObject } from "../util/datastore";
import { useTranslation } from "../component/translation";
import { pushSubscreen } from "../util/navigate";
import { BasicComments, Comment } from "../component/comment";
import { Message, QuietSystemMessage } from "../component/message";

export const TopicChatPrototype = {
    key: 'topicchat',
    name: 'Topic Chat Prototype',
    description: "Connect an article to topics and chat about those topics rather than just about the article",
    author: authorRobEnnals,
    date: '2023-09-07',
    hasMembers: true,
    screen: TopicChatScreen,
    subscreens: {
        topic: {screen: TopicScreen, title: 'Topic'}
    },
    instance: [
        {key: 'godzilla-article', name: 'Godzilla Article', article: godzilla_article,
            topic: expandDataList([
                {key: 'monster', title: 'Giant Monster Attacks'},
                {key: 'attack', title: 'Aug 2023 Godzilla Attack on New York'},
                {key: 'safe', title: 'NYC Disaster Preparedness'},               
            ]), 
        },
    ],
}

function TopicChatScreen() {
    const topics = useCollection('topic', {sortBy: 'title'});
    return <MaybeArticleScreen articleChildLabel='Topic Conversations' embed={<TopicListEmbed/>}>
        <Narrow>
            <TopicListEmbed />
            {/* {topics.map(topic =>
                <PadBox key={topic.key} vert={16}>
                    <Card onPress={() => pushSubscreen('topic', {topicKey: topic.key})}>
                        <Center><SmallTitle>{topic.title}</SmallTitle></Center>
                        <TopicFirstMessages topic={topic} />
                    </Card>
                </PadBox>
            )}     */}
        </Narrow>
        {/* <Pad size={32} /> */}
        <Separator />
        <Narrow>
            <SmallTitleLabel label='Conversation about this article' />
            <BasicComments about={godzilla_article.key} />
        </Narrow>
    </MaybeArticleScreen>
}

function TopicListEmbed() {
    const topics = useCollection('topic', {sortBy: 'title'});
    return <View>        
        {topics.map(topic => <TopicPreview key={topic.key} topic={topic} />)}
    </View>
}

function TopicPreview({topic}) {
    const comments = useCollection('comment', {filter: {replyTo: topic.key}});
    const tComments = useTranslation('comments');
    return <ListItem onPress={() => pushSubscreen('topic', {topicKey: topic.key})}
        title={topic.title} subtitle={comments.length + ' ' +  tComments} />
}

function TopicFirstMessages({topic}) {
    const comments = useCollection('comment', {filter: {replyTo: topic.key}, 
        sortBy: 'time', reverse: true, limit: 3});
    return <View>
        {comments.map(comment => 
            <Comment key={comment.key} commentKey={comment.key} />
        )}
    </View>    
}


function TopicScreen({topicKey}) {
    const topic = useObject('topic', topicKey);
    const article = useGlobalProperty('article');

    return <ScrollableScreen>
        <BigTitle>{topic.title}</BigTitle>
        <SmallTitleLabel label='Articles'/>
        <ArticlePreview article={article} />
        {/* <QuietSystemMessage label='Other articles about this topic appear here, if there are any'/> */}
        <Pad size={16}/>
        <SmallTitleLabel label='Comments'/>
        <BasicComments about={topicKey} />
    </ScrollableScreen>
}

function ArticlePreview({article}) {
    console.log('article', article);
    return <Card pad={0} fitted>
        <Image source={{uri: expandUrl({url:article.photo, type:'photos'})}} style={{height: 100, width: 200}} />
        <PadBox>
            <MiniTitle width={150}>{article.title}</MiniTitle>        
        </PadBox>
    </Card>
}
