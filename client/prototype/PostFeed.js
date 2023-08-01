import { Narrow, Pad, ScreenTitleText, ScrollableScreen, WideScreen } from "../component/basics";
import { BasicComments } from "../component/comment";
import { Post, PostActionComment, PostActionEdit, PostActionLike } from "../component/post";
import { useTranslation } from "../component/translation";
import { authorRobEnnals } from "../data/authors";
import { post_parents, post_parents_comments } from "../data/posts";
import { useCollection, useObject } from "../util/datastore";
import { expandDataList } from "../util/util";
import { pushSubscreen } from "../util/navigate";
import { PostInput } from "../component/replyinput";

export const PostFeedPrototype = {
    key: 'postfeed',
    date: 'Thu Jul 20 2023 09:43:43 GMT-0700 (Pacific Daylight Time)',
    name: 'Post Feed',
    author: authorRobEnnals,
    description: 'Facebook-style feed of posts. Starting point for other prototypes',
    screen: PostFeedScreen,
    subscreens: {
        post: {screen: PostScreen, title: PostScreenTitle},
    },
    instance: [
        {key: 'parents', name: 'Sunnyvale Parents', 
            post: expandDataList(post_parents),
            comment: expandDataList(post_parents_comments)
        }
    ],
    newInstanceParams: []
}

export function PostFeedScreen() {
    const posts = useCollection('post', {sortBy: 'time', reverse: true});

    return <ScrollableScreen grey>
        <PostInput />
        {posts.map(post =>
            <Post key={post.key} post={post} actions={[PostActionLike, PostActionComment, PostActionEdit]}
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

function PostScreen({postKey}) {
    const post = useObject('post', postKey);
    return <WideScreen>
        <Narrow>
            <Post noCard post={post} />
            <Pad/>
            <BasicComments about={postKey} />
        </Narrow>
    </WideScreen>
}


