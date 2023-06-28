import { View } from "react-native";
import { Article } from "../component/article";
import { BigTitle, BodyText, Card, Center, Clickable, ListBox, ListItem, Pad, PadBox, ScrollableScreen, SmallTitle, WideScreen } from "../component/basics";
import { godzilla_article } from "../data/articles/godzilla";
import { authorRobEnnals } from "../data/authors";
import { statusTentative, tagArticle, tagConversation } from "../data/tags";
import { pushSubscreen } from "../util/navigate";
import { expandDataList } from "../util/util";
import { getObject, useCollection, useGlobalProperty, useObject } from "../util/localdata";
import { BasicComments } from "../component/comment";

const description = `
Respond to questions that relate to an article.

Comments on articles are often low quality. One reason for this is that the good comments get dispersed across a 
large number of articles, and good commenters don't feel motivated to put effort into writing a comment on an article
that will have dropped out of the news cycle within a few hours.

In this prototype, we explore the idea of connecting an article to questions that relate to it, and having the conversation
be about those questions rather than the article itself. Multiple articles might relate to the same questions, and the 
questions might be more "evergreen" than the article. Well chosen questions can also prompt people to provide
information that might be valuable to readers or to journalists who want to create future articles on the topic.
`

const godzilla_questions = [
    {key: 'you', text: 'Were you there? What was your experience of the Giant Lizard attack?'},
    {key: 'deal', text: 'How should we deal with the Giant Lizard?'},
    {key: 'prevent', text: 'How should New York better prepare for future giant monster threats?'},
    {key: 'future', text: 'Should we expect future giant monster attacks?'},
]

const godzilla_comments = [
    {replyTo: 'you', from: 'angry', text: 'I was there and saw the lizard. It stepped on the back of my car while I was sitting in the front seat. Would have killed me if it had stepped a few feet further forward. I was lucky to escape with my life.'},
    {replyTo: 'you', from: 'timid', text: 'I watched it from the window of my apartment. I was terrified that it was going to push my building over'},
    {replyTo: 'deal', from: 'angry', text: 'We should kill it with nuclear weapons. It might destroy the city, but it is more important to kill the lizard than to save ourselves.'},
    {replyTo: 'deal', from: 'timid', text: 'We should try to capture it and put it in a zoo. It is a rare and valuable creature.'},
    {replyTo: 'prevent', from: 'angry', text: 'We should build a giant wall around the city to keep the monsters out.'},
    {replyTo: 'future', from: 'boring', text: 'I think this was a one-off event. I don\'t think we need to worry about future attacks. I base that on the fact that there have been no other giant monster attacks in the last 50 years. \n\nIn fact I think we might just be imagining this one.'},
]

export const ArticleQuestionsPrototype = {
    key: 'articlequestions',
    name: 'Article Questions',
    author: authorRobEnnals,
    date: 'Wed May 31 2023 12:40:00 GMT-0700 (Pacific Daylight Time)',
    description,
    tags: [tagArticle, tagConversation],
    status: statusTentative,
    screen: ArticleQuestionsScreen,
    subscreens: {
        question: {screen: QuestionScreen, title: ({questionKey}) => getObject('question', questionKey).text},
    },
    instance: [
        {key: 'godzilla', name: 'Godzilla', article: godzilla_article, 
            question: expandDataList(godzilla_questions),
            comment: expandDataList(godzilla_comments)
        }
    ]
}


export function ArticleQuestionsScreen() {
    const article = useGlobalProperty('article');

    return <ScrollableScreen maxWidth={800}>
        <Article article={article} embed={<QuestionList />}>
            <Center>
                <SmallTitle>Questions</SmallTitle>
            </Center>
            <Pad/>
            <QuestionList />
        </Article>
    </ScrollableScreen>
}

function QuestionList() {
    const questions = useCollection('question', {sortBy: 'time', reverse: true});
    return <View>
        {questions.map(question => <QuestionSummary key={question.key} questionKey={question.key} />)}
    </View>
}

function QuestionSummary({questionKey}) {
    const question = useObject('question', questionKey);
    const questionReplies = useCollection('comment', {filter: {replyTo: questionKey}});

    return <Clickable onPress={() => pushSubscreen('question', {questionKey})}>
        <ListItem title={question.text} subtitle={questionReplies.length + ' responses'} />
    </Clickable>
}

function QuestionScreen({questionKey}) {
    const question = useObject('question', questionKey);
    return <WideScreen pad>
        <BigTitle>{question.text}</BigTitle>
        <BasicComments about={question.key} />
    </WideScreen>
}