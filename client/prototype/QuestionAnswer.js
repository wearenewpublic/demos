import { Card } from "../component/basics";
import { BigTitle, Narrow, Pad, ScreenTitleText, ScrollableScreen, WideScreen } from "../component/basics";
import { BasicComments } from "../component/comment";
import { QuietSystemMessage } from "../component/message";
import { Post, PostActionComment, PostActionEdit, PostActionLike, PostActionUpvate, PostActionUpvote } from "../component/post";
import { PostInput } from "../component/replyinput";
import { useTranslation } from "../component/translation";
import { answer_godzilla, answer_godzilla_comments } from "../data/answer";
import { authorRobEnnals } from "../data/authors";
import { statusStartingPoint } from "../data/tags";
import { useCollection, useGlobalProperty, useObject, usePersonaKey } from "../util/datastore";
import { pushSubscreen } from "../util/navigate";
import { expandDataList } from "../util/util";

export const QuestionAnswerPrototype = {
    key: 'questionanswer',
    date: 'Mon Jul 24 2023 13:27:04 GMT-0700 (Pacific Daylight Time)',
    name: 'Question & Answer', 
    author: authorRobEnnals,
    description: 'Quora-like feed of answers to a question. Starting point for other prototypes',
    tags: [],
    status: statusStartingPoint,
    screen: QuestionAnswerScreen,
    subscreens: {
        post: {screen: PostScreen, title: PostScreenTitle},
    },
    instance: [
        {
            key: 'godzilla', name: 'How should we deal with the Giant Monster?',
            question: 'How should we deal with the Giant Monster?',
            post: expandDataList(answer_godzilla),
            comment: expandDataList(answer_godzilla_comments)
        }
    ],
    newInstanceParams: [
        {key: 'question', name: 'Question', type: 'shorttext'}
    ]
}

function getRankScore(comment) {
    const upvoteCount = Object.keys(comment.upvotes || {}).length;
    return upvoteCount;
}

export function QuestionAnswerScreen() {
    const question = useGlobalProperty('question');
    const posts = useCollection('post', {sortBy: 'time', reverse: true});
    const personaKey = usePersonaKey();
    const sortedPosts = posts.sort((a, b) => getRankScore(b) - getRankScore(a));

    const hasAnswered = sortedPosts.some(post => post.from == personaKey);

    return <ScrollableScreen grey>
        {/* <Card>   */}
            <BigTitle>{question}</BigTitle>
        {/* </Card> */}
        {hasAnswered ? 
            <QuietSystemMessage label='You have already answered this question' />
        :
            <PostInput placeholder="What's your answer?" />
        }
        {sortedPosts.map(post =>
            <Post key={post.key} post={post} actions={[PostActionUpvote, PostActionComment, PostActionEdit]}
               hasComments onComment={() => pushSubscreen('post', {postKey: post.key})}/>
        )}
    </ScrollableScreen>   
}

function PostScreenTitle({postKey}) {
    const post = useObject('post', postKey);
    const author = useObject('persona', post?.from);
    const tPost = useTranslation('Post');
    return <ScreenTitleText title={author.name + "'s " + tPost} />
}

export function PostScreen({postKey}) {
    const post = useObject('post', postKey);
    return <WideScreen>
        <Narrow>
            <Post noCard post={post} />
            <Pad/>
            <BasicComments about={postKey} />
        </Narrow>
    </WideScreen>   
}