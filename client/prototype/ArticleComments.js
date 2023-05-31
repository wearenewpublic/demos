import { Article } from "../component/article"
import { BodyText, Pad, ScrollableScreen, SmallTitle } from "../component/basics"
import { BasicComments } from "../component/comment";
import { godzilla_article } from "../data/articles/godzilla";
import { authorRobEnnals } from "../data/authors";
import { statusStartingPoint, tagArticle, tagConversation } from "../data/tags";
import { godzilla_comments_threaded } from "../data/threaded";
import { expandDataList } from "../shared/util";
import { useGlobalProperty } from "../util/localdata";

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
    tags: [tagArticle, tagConversation],
    status: statusStartingPoint,
    screen: ArticleCommentsScreen,
    instance: [
        {key: 'godzilla', name: 'Godzilla', article: godzilla_article, comment: expandDataList(godzilla_comments_threaded)}
    ]
}

export function ArticleCommentsScreen() {
    const article = useGlobalProperty('article');

    return <ScrollableScreen maxWidth={800}>
        <Article article={article}>
            <SmallTitle>Comments</SmallTitle>
            <BasicComments />
            <Pad size={32} />
        </Article>
    </ScrollableScreen>
}



