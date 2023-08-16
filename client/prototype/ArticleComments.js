import { Article } from "../component/article"
import { BodyText, Pad, ScrollableScreen, SmallTitleLabel } from "../component/basics"
import { BasicComments } from "../component/comment";
import { godzilla_article } from "../data/articles/godzilla";
import { authorRobEnnals } from "../data/authors";
import { godzilla_comments_threaded } from "../data/threaded";
import { useGlobalProperty } from "../util/datastore";
import { expandDataList } from "../util/util";

const description = `
This is a starting point for prototypes where comments revolve around an article.

In this example we attach threaded comments to the bottom of the article.
This is similar to the way that comments often appear in news articles.

Future prototypes could explore ways to reduce misbehavior
in the comments,
ways to connect comments on one article to larger conversations about the topic,
ways to comment with mechanisms other than text, ways for comments to 
come from a particlar community rather than just individuals, and other such ideas.
`

export const ArticleCommentsPrototype = {
    key: 'article',
    name: 'Article Comments',
    author: authorRobEnnals,
    date: '2023-05-22',
    description,
    screen: ArticleCommentsScreen,
    instance: [
        {key: 'godzilla', name: 'Godzilla', article: godzilla_article, comment: expandDataList(godzilla_comments_threaded)}
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

export function ArticleCommentsScreen() {
    const article = useGlobalProperty('article');

    return <ScrollableScreen maxWidth={800}>
        <Article article={article}>
            <SmallTitleLabel label='Comments'/>
            <BasicComments />
            <Pad size={32} />
        </Article>
    </ScrollableScreen>
}



