import { useContext } from "react";
import { expandDataList } from "../util/util";
import { Pad, WideScreen, Pill } from "../component/basics";
import { gptProcessAsync } from "../component/chatgpt";
import { authorZDFDigital } from "../data/authors";
import { TopCommentInput } from "../component/replyinput";
import { ActionLike, ActionReply, Comment, CommentContext } from "../component/comment";
import { ScrollView, View } from "react-native";
import { disco } from "../data/conversations";
import { useCollection, useDatastore } from "../util/datastore";


const description = `
All comments are judged by the comment bouncer before they can be published. If the comment bouncer is happy, your comment is good to go. If your comment is particularly thoughtful or polite, the comment bouncer's reaction will reflect that.

If the comment bouncer is not happy, you won't be able to post the comment until all problematic parts have been fixed. You will receive advice on how to improve your comment.

The comment bouncer is supposed to be a humorous way of filtering potentially harmful comments while also encouraging people who write good comments. The comment bouncer helps you recognize when your comment might be harmful and explains why.
`

export const CommentBouncerPrototype = {
    key: 'commentbouncer',
    name: 'Comment Bouncer',
    author: authorZDFDigital,
    date: '2023-07-24',
    description,
    screen: CommentBouncerScreen,
    instance: [
        {key: 'disco', name: 'Digital Disco', comment: expandDataList(disco)},
    ]
}

export const Tone = {
    Questionable: "bad",
    Acceptable: "neutral",
    Outstanding: "good"
}

export function CommentBouncerScreen() {
    const commentContext = useContext(CommentContext);
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const datastore = useDatastore();
    const topLevelComments = comments.filter(comment => !comment.replyTo && getIsVisible({datastore, comment}));

    const commentConfig = {...commentContext,
        analyzeHandler: analyzeHandlerAsync,
        postHandler: postHandlerAsync, 
        getIsVisible,
        actions: [ActionReply, ActionLike],
        // topBling: [BlingBouncerPending, BlingQuestionableTone, BlingAcceptableTone, BlingOutstandingTone],
        // replyWidgets: [BlingBouncerPending, BlingQuestionableTone, BlingAcceptableTone, BlingOutstandingTone],
        bouncer: true
    }

    return (
        <WideScreen pad>
            <ScrollView>
                <Pad size={8} />
                <CommentContext.Provider value={commentConfig}>
                    <TopCommentInput/>
                    {topLevelComments.map(comment => 
                        <Comment key={comment.key} commentKey={comment.key}/>
                    )}
                </CommentContext.Provider>
            </ScrollView>
        </WideScreen>
    )   
}

async function analyzeHandlerAsync({datastore, text, replyTo}) {
    const personaKey = datastore.getPersonaKey();
    // Adding an object of the type 'comment' to the datastore displays the comment immediately. Since we want to analyze it first, we're adding a 'submission' object first
    const submissionKey = datastore.addObject('submission', {
        from: personaKey, text, replyTo, pending: true
    })
    console.log('post: text, replyTo, submissionKey ', text, replyTo, submissionKey);

    const response = await gptProcessAsync({promptKey: 'bouncer', params: {text}});

    response.every(submissionFragment => {
        if (submissionFragment.tone === Tone.Questionable) {
            // Once the first questionable part is found, the whole comment will be rated as questionable
            datastore.modifyObject('submission', submissionKey, submission => ({...submission, tone: Tone.Questionable}));
            return false;
        }
        else if (submissionFragment.tone === Tone.Outstanding) {
            // Once the first outstanding part is found and there haven't been any questionable parts yet, the whole comment will be rated as outstanding.
            // Keep searching to see if there are any questionable parts though.
            datastore.modifyObject('submission', submissionKey, submission => ({...submission, tone: Tone.Outstanding}));
            return true;
        }
        else if (submissionFragment.tone === Tone.Acceptable) {
            // The comment is rated as acceptable for now. Keep searching to see if there are any parts with a different rating.
            datastore.modifyObject('submission', submissionKey, submission => ({...submission, tone: Tone.Acceptable}));
            return true;
        }
    });

    datastore.modifyObject('submission', submissionKey, submission => ({...submission, analyzedText: response, pending: false}));

    const submission = datastore.getObject('submission', submissionKey);
    return submission;
}

async function postHandlerAsync({datastore, post}) {
    const {text, replyTo} = post;
    const commentKey = datastore.addObject('comment', {...post, pending: true});

    console.log('post: text, replyTo, commentKey ', text, replyTo, commentKey);

    datastore.modifyObject('comment', commentKey, comment => ({...comment, pending: false}));    
}

function getIsVisible({datastore, comment}) {
    const personaKey = datastore.getPersonaKey();
    if (comment.pending) {
        return (comment.from == personaKey || personaKey == 'leader') 
    } else {
        return true;
    }
}

export function BlingBouncerPending() {
    return <BouncerLabel color="#f4a261" label='🤔 The comment bouncer is judging you...' />
}

export function BlingQuestionableTone() {
    return <BouncerLabel color='#e76f51' label="😡 The comment bouncer is not happy. Your comment needs improvement."/>
}

export function BlingAcceptableTone() {
    return <BouncerLabel color='#264652' label="😊 The comment bouncer is happy with your comment."/>
}

export function BlingOutstandingTone() {
    return <BouncerLabel color='#2a9d8f' label="💖 The comment bouncer is overjoyed! Contributions like yours are greatly appreciated!"/>
}

export function BouncerLabel({label, color='#666'}) {
    return <View style={{marginTop: 4, marginBottom: -4, marginLeft: 0}}><Pill label={label} color={color} /></View>
}