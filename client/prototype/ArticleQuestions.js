import { ScrollView, View } from "react-native";
import { Article } from "../component/article";
import { BigTitle, BodyText, Card, Center, Clickable, ListBox, ListItem, Narrow, Pad, PadBox, ScreenTitleText, ScrollableScreen, SmallTitleLabel, WideScreen } from "../component/basics";
import { godzilla_article, godzilla_comments, godzilla_questions } from "../data/articles/godzilla";
import { authorRobEnnals } from "../data/authors";
import { pushSubscreen } from "../util/navigate";
import { expandDataList } from "../util/util";
import { BasicComments } from "../component/comment";
import { useCollection, useGlobalProperty, useObject } from "../util/datastore";
import { godzilla_article_german, godzilla_comments_german, godzilla_questions_german } from "../translations/german/articles_german";
import { godzilla_article_french, godzilla_comments_french, godzilla_questions_french } from "../translations/french/articles_french";
import { languageFrench, languageGerman, useTranslation } from "../component/translation";

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

export const ArticleQuestionsPrototype = {
    key: 'articlequestions',
    name: 'Article Questions',
    author: authorRobEnnals,
    date: 'Wed May 31 2023 12:40:00 GMT-0700 (Pacific Daylight Time)',
    description,
    screen: ArticleQuestionsScreen,
    subscreens: {
        question: {
            screen: QuestionScreen, 
            title: ArticleQuestionTitle
        }
    },
    instance: [
        {key: 'godzilla', name: 'Godzilla', article: godzilla_article, 
            question: expandDataList(godzilla_questions),
            comment: expandDataList(godzilla_comments)
        },
        {key: 'godzilla-german', name: 'German Godzilla', article: godzilla_article_german, 
            language: languageGerman,
            question: expandDataList(godzilla_questions_german),
            comment: expandDataList(godzilla_comments_german)
        },
        {key: 'godzilla-french', name: 'French Godzilla', article: godzilla_article_french, 
            language: languageFrench,
            question: expandDataList(godzilla_questions_french),
            comment: expandDataList(godzilla_comments_french)
        },
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

function ArticleQuestionTitle({questionKey}) {
    const question = useObject('question', questionKey);
    return <ScreenTitleText title={question?.text} />
}

export function ArticleQuestionsScreen() {
    const article = useGlobalProperty('article');

    return <ScrollableScreen maxWidth={800}>
        <Article article={article} embed={<QuestionList />}>
            <Narrow>
                <Center>
                    <SmallTitleLabel label='Questions'/>
                </Center>
                <Pad/>
                <QuestionList />
            </Narrow>
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
    const tResponses = useTranslation('responses');

    return <Clickable onPress={() => pushSubscreen('question', {questionKey})}>
        <ListItem title={question.text} subtitle={questionReplies.length + ' ' + tResponses} />
    </Clickable>
}

function QuestionScreen({questionKey}) {
    const question = useObject('question', questionKey);
    return <WideScreen pad>
        <Pad />
        <ScrollView>
            <BigTitle>{question?.text}</BigTitle>
            <BasicComments about={question?.key} />
        </ScrollView>
    </WideScreen>
}
