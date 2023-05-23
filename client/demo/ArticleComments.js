import { Article } from "../component/article"
import { BodyText, Pad, ScrollableScreen, SmallTitle } from "../component/basics"
import { BasicComments } from "../component/comment";
import { godzilla_article } from "../data/articles/godzilla";
import { statusStartingPoint, tagArticle, tagConversation } from "../data/tags";
import { godzilla_comments_threaded } from "../data/threaded";
import { expandDataList } from "../shared/util";
import { useGlobalProperty } from "../util/localdata";


export const ArticleCommentsDemo = {
    key: 'article',
    name: 'Article Comments',
    author: 'Rob Ennals',
    date: '2023-05-22',
    description: 'A simple article with threaded comments.',
    tags: [tagArticle, tagConversation],
    status: statusStartingPoint,
    screen: ArticleCommentsScreen,
    instance: [
        {key: 'godzilla', name: 'Godzilla', article: godzilla_article, comment: expandDataList(godzilla_comments_threaded)}
    ]
}

export function ArticleCommentsScreen() {
    const article = useGlobalProperty('article');
    console.log('article', article);
    return <ScrollableScreen maxWidth={800}>
        <Article article={article}>
            <SmallTitle>Comments</SmallTitle>
            <BasicComments />
            <Pad size={32} />
        </Article>
    </ScrollableScreen>
}



