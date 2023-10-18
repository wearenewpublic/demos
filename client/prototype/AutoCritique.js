import { View } from "react-native";
import { Article, MaybeArticleScreen } from "../component/article";
import { BodyText, Card, Center, Clickable, HorizBox, ListItem, Narrow, Pad, PadBox, Pill, PrimaryButton, ScrollableScreen, SmallTitle, SmallTitleLabel } from "../component/basics";
import { BasicComments } from "../component/comment";
import { Post } from "../component/post";
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

export const AutoCritiquePrototype = {
    key: 'autocrit',
    name: "Auto Critique",
    date: 'Oct 17 2023 14:10:38 GMT-0700 (Pacific Daylight Time)',
    author: authorRobEnnals,
    description: 'AI suggests ways that you can improve your post before you post it',
    screen: AutoCritiqueScreen,
    instance: [
        {key: 'wars', name: 'Star Wars', articleKey: 'starwars', 
            post: expandDataList(post_starwars)
        },
        {key: 'godzilla', name: 'Godzilla', articleKey: 'godzilla', 
            post: expandDataList(godzilla_category_posts)
        }
    ],
}



function AutoCritiqueScreen() {
    const posts = useCollection('post', {sortBy: 'time', reverse: true});

    return <MaybeArticleScreen articleChildLabel='Comments'>
        <Narrow>
            <PostInput placeholder="Contribute something to the conversation" bottomWidgets={[EditAutoCrit]} getCanPost={getCanPost}/>
            {posts.map(post => <Post key={post.key} post={post} />)}
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

    // return <AIResponse text='THis is a dumbd thing to say' />

    if (inProgress) {
        return <QuietSystemMessage label='Getting feedback...' />
    } else {
        return <View>
            {feedback && <AIResponse text={feedback} />}
            {(post.checkedText != post.text) && <PrimaryButton label='Get AI Feedback before Posting' onPress={getFeedback} />}
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

