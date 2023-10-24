import { View } from "react-native";
import { Article, MaybeArticleScreen } from "../component/article";
import { BodyText, Card, Center, Clickable, HorizBox, ListItem, Narrow, Pad, PadBox, Pill, PrimaryButton, ScrollableScreen, SmallTitle, SmallTitleLabel } from "../component/basics";
import { BasicComments } from "../component/comment";
import { Post, PostActionComment, PostActionEdit, PostActionLike, PostScreenInfo } from "../component/post";
import { PostInput } from "../component/replyinput";
import { godzilla_article, godzilla_category_posts, godzilla_comments, godzilla_title_comments } from "../data/articles/godzilla";
import { authorRobEnnals } from "../data/authors";
import { godzilla_comments_threaded } from "../data/threaded";
import { useCollection, useDatastore, useGlobalProperty, useObject } from "../util/datastore";
import { expandDataList } from "../util/util";
import { pushSubscreen } from "../util/navigate";
import { QuietSystemMessage } from "../component/message";
import { getGptResponse, gptProcessAsync } from "../component/chatgpt";
import { useState } from "react";
import { askGptToEvaluateMessageTextAsync } from "../component/chatgpt";
import { getTextEmbedding, useMessageEmbeddingMap, useTextEmbedding } from "../component/embeddings";
import { sortEmbeddingsByDistance } from "../util/cluster";
import { TranslatableLabel } from "../component/translation";
import { post_starwars } from "../data/posts";
import { videoGodzilla, videoTrekWars } from "../component/fakevideo";

export const LikelyResponsePrototype = {
    key: 'likelyresponse',
    name: "Likely Response",
    date: 'Oct 17 2023 14:10:38 GMT-0700 (Pacific Daylight Time)',
    author: authorRobEnnals,
    description: 'AI shows a likely response that your comment would get, helping you refine it to be less easily picked apart.',
    screen: LikeleyResponseScreen,
    subscreens: {
        post: PostScreenInfo
    },
    instance: [
        {key: 'wars', name: 'Star Wars', articleKey: 'starwars', 
            post: expandDataList(post_starwars)
        },
        {key: 'godzilla', name: 'Godzilla', articleKey: 'godzilla', 
            post: expandDataList(godzilla_category_posts)
        },
        {key: 'wars-video', name: 'Star Wars - Video', videoKey: videoTrekWars, 
            post: expandDataList(post_starwars)
        },
        {key: 'godzilla-video', name: 'Godzilla - Video', videoKey: videoGodzilla, 
            post: expandDataList(godzilla_category_posts)
        }
    ],
}



function LikeleyResponseScreen() {
    const posts = useCollection('post', {sortBy: 'time', reverse: true});

    return <MaybeArticleScreen articleChildLabel='Comments'>
        <Narrow>
            <PostInput placeholder="Contribute something to the conversation" bottomWidgets={[EditAutoCrit]} getCanPost={getCanPost}/>
            {posts.map(post => 
                <Post hasComments key={post.key} post={post}
                    actions={[PostActionLike, PostActionComment, PostActionEdit]}
                />
            )}
        </Narrow>
    </MaybeArticleScreen>
}

function EditAutoCrit({post, onPostChanged}) {
    const datastore = useDatastore();
    const [inProgress, setInprogress] = useState(false);
    const [feedback, setFeedback] = useState(null);
    async function getFeedback() {
        setInprogress(true);
        onPostChanged({...post, waiting: true});
        const feedback = await getGptResponse({datastore, promptKey: 'feedback', params: {text: post.text}});
        console.log('feedback', feedback);
        onPostChanged({...post, waiting: false, checkedText: post.text});
        setFeedback(feedback);
        setInprogress(false);
    }

    if (inProgress) {
        return <QuietSystemMessage label='Generating likely response...' />
    } else {
        return <View>
            {feedback && <AIResponse text={feedback} />}
            {(post.checkedText != post.text) && <PrimaryButton label='See Likely Response before Posting' onPress={getFeedback} />}
        </View>
    }
}

function AIResponse({text}) {
    return <Card>
        <TranslatableLabel label='Likely respones to your comment:' style={{fontWeight: 'bold'}} />
        <Pad size={4} />
        <BodyText>{text}</BodyText>
    </Card>    
}

function getCanPost({post}) {
    return post.text.length > 0 && post.checkedText == post.text
}

