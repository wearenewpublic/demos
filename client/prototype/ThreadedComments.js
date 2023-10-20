import { ScrollView } from "react-native"
import { Narrow, Pad, WideScreen } from "../component/basics";
import { Comment } from "../component/comment";
import { expandDataList } from "../util/util"
import { TopCommentInput } from "../component/replyinput";
import { ecorp, soccer, trek_vs_wars } from "../data/conversations";
import { authorRobEnnals } from "../data/authors";
import { useCollection } from "../util/datastore";
import { MaybeArticleScreen, articleGodzilla, articleStarWars } from "../component/article";
import { videoTrekWars } from "../component/fakevideo";

const description = `
A starting point for future prototypes that involve threaded comments.

In this example, each comment can have other comments that appear as replies to it.

It is easy for other prototypes to customize threaded comments to change what actions are available,
how they are sorted, and what additional "bling" is attached to them.
`

export const ThreadedCommentsPrototype = {
    key: 'threadedcomments',
    name: 'Threaded Comments',
    author: authorRobEnnals,
    date: '2023-05-08',
    description,
    screen: ThreadedScreen,
    instance: [
        {key: 'ecorp', name: 'E-Corp Alumni', comment: expandDataList(ecorp)},
        {key: 'soccer', name: 'Soccer Team', comment: expandDataList(soccer)},
        {key: 'wars', name: 'Star Wars vs Star Trek', comment: expandDataList(trek_vs_wars)},
        {key: 'wars-article', name: 'Star Wars vs Trek - Article', 
            comment: expandDataList(trek_vs_wars),
            articleKey: articleStarWars
        },
        {key: 'wars-video', name: 'Star Wars vs Trek - Video', 
            comment: expandDataList(trek_vs_wars),
            videoKey: videoTrekWars
        },
    ],
    liveInstance: [
        {key: 'live', name: 'Live Conversation', comment: {}}
    ],
    newInstanceParams: []    
}

export function ThreadedScreen() {
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => !comment.replyTo);

    return (
        <MaybeArticleScreen articleChildLabel='Comments'>
            <Narrow>
                <TopCommentInput />
                {topLevelComments.map(comment => 
                    <Comment key={comment.key} commentKey={comment.key} />
                )}
            </Narrow>
        </MaybeArticleScreen>
    )
}