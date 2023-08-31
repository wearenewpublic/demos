import { useContext, useState } from "react";
import { expandDataList } from "../util/util";
import { Pad, WideScreen, Pill } from "../component/basics";
import { gptProcessAsync } from "../component/chatgpt";
import { authorZDFDigital } from "../data/authors";
import { TopCommentInput, ReplyInputStyle } from "../component/replyinput";
import { ActionLike, ActionReply, Comment, CommentContext } from "../component/comment";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import { disco } from "../data/conversations";
import { useCollection, useDatastore } from "../util/datastore";
import { Tooltip } from "react-tooltip";


const description = `
All comments are judged by the comment bouncer before they can be published. If the comment bouncer is happy, your comment is good to go. If your comment is particularly thoughtful or polite, the comment bouncer's reaction will reflect that.

If the comment bouncer is not happy, you won't be able to post the comment until all problematic parts have been fixed. You will receive advice on how to improve your comment.

The comment bouncer is supposed to be a humorous way of filtering potentially harmful comments while also encouraging people who write good comments. The comment bouncer helps you recognize when your comment might be harmful and explains why.
`

const BouncerState = {
    None: "none",
    Submitted: "submitted",
    Rejected: "rejected",
    Accepted: "accepted",
    Loved: "loved"
}

// TODO: If you enter a top-level comment and a reply at the same time, the bouncerState always changes for both. But this is part of a bigger issue, you shouldn't be able to work on multiple comments at the same time anyway.
let bouncerState = BouncerState.None;
let submission = "";

export const CommentBouncerPrototype = {
    key: 'commentbouncer',
    name: 'Comment Bouncer',
    author: authorZDFDigital,
    date: '2023-08-29',
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

    const [inputLock, setInputLock] = useState(false);
    const [hideInputOnClick, setHideInputOnClick] = useState(false);

    const commentConfig = {...commentContext,
        postHandler: buttonClickHandlerAsync,
        cancelHandler: cancelHandlerAsync,
        getIsVisible,
        getCanPost,
        getPrimaryButtonLabel,
        actions: [ActionReply, ActionLike],
        replyWidgets: getReplyWidgets(),
        inputLock,
        hideInputOnClick,
        customTextInputWidget: getTextInputWidget()
    }

    async function buttonClickHandlerAsync({datastore, post}) {
        switch (bouncerState) {
            case BouncerState.None:
                // Submit comment to bouncer
                const {text, replyTo} = post;
                bouncerState = BouncerState.Submitted;
                setInputLock(true);
                let submission = await analyzeCommentAsync({datastore, text, replyTo});

                console.log("submission: ", submission);

                switch (submission.tone) {
                    case "bad":
                        bouncerState = BouncerState.Rejected;
                        break;
                    case "neutral":
                        bouncerState = BouncerState.Accepted;
                        setHideInputOnClick(true);
                        break;
                    case "good":
                        bouncerState = BouncerState.Loved;
                        setHideInputOnClick(true);
                        break;
                }
                break;
                
            case BouncerState.Submitted:
                // This case should never happen because the "Post" button should be disabled after submitting a comment for analysis
                break;

            case BouncerState.Rejected:
                setInputLock(false);
                bouncerState = BouncerState.None;
                break;

            case BouncerState.Accepted:
            case BouncerState.Loved:
                publishPost({datastore, post});
                setInputLock(false);
                setHideInputOnClick(false);
                break;
        }
    }

    async function cancelHandlerAsync() {
        // Reset everything when the user discards an unfinished comment
        bouncerState = BouncerState.None;
        setInputLock(false);
        setHideInputOnClick(false);
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

async function analyzeCommentAsync({datastore, text, replyTo}) {
    const personaKey = datastore.getPersonaKey();
    // Adding an object of the type 'comment' to the datastore displays the comment immediately. Since we want to analyze it first, we're adding a 'submission' object first
    const submissionKey = datastore.addObject('submission', {
        from: personaKey, text, replyTo, pending: true
    })
    console.log('post: text, replyTo, submissionKey ', text, replyTo, submissionKey);

    
    const response = await gptProcessAsync({promptKey: 'bouncer', params: {text}});

    // TODO: Why does this sometimes cause an error? When?
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

    submission = datastore.getObject('submission', submissionKey);
    return submission;

    // TODO: It would be nice to delete rejected submissions from the datastore when they are being revised
}


function publishPost({datastore, post}) {
    const {text, replyTo} = post;
    const commentKey = datastore.addObject('comment', {...post, pending: true});

    console.log('post: text, replyTo, commentKey ', text, replyTo, commentKey);

    datastore.modifyObject('comment', commentKey, comment => ({...comment, pending: false}));
    
    bouncerState = BouncerState.None;
}

function getIsVisible({datastore, comment}) {
    return true;
}

// This is triggered every time a character is entered. But sending requests to ChatGPT for unfinished comments would take way too long, so we're using an "Analyze" button instead of checking automatically
function getCanPost({datastore, post}) {
    if (post.text.length <= 0) {
        // Hide or disable button if text is empty
        return false;
    }
    else if (bouncerState === BouncerState.Submitted) {
        // TODO: How to disable the button while the post is being analyzed without hiding it?
        return true;
    }
    else {
        return true;
    }
}

function getPrimaryButtonLabel() {
    switch (bouncerState) {
        case BouncerState.None:
            return "Analyze";
        case BouncerState.Submitted:
            return "Analyzing...";
        case BouncerState.Rejected:
            return "Edit";
        case BouncerState.Accepted:
            return "Post";
        case BouncerState.Loved:
            return "Post";
    }
}

function getReplyWidgets() {
    switch (bouncerState) {
        case BouncerState.None:
            return [];
        case BouncerState.Submitted:
            return [BlingBouncerPending];
        case BouncerState.Rejected:
            return [BlingQuestionableTone];
        case BouncerState.Accepted:
            return [BlingAcceptableTone];
        case BouncerState.Loved:
            return [BlingOutstandingTone];
    }
}

function getTextInputWidget() {
    if (bouncerState === BouncerState.Rejected) {
        return AnalyzedInput;
    }
    else {
        return undefined;
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
    return <View style={{marginTop: 0, marginBottom: 0, marginLeft: 0}}><Pill label={label} color={color} /></View>
}

export function AnalyzedInput() {
    const comment = submission;
    console.log("AnalyzedInput: ", comment);
    if (comment === undefined) {
        console.error("AnalyzedInput: comment is undefined");
        return;
    }

    const styleA = AnalyzedInputStyle;
    const styleR = ReplyInputStyle;
    let allText = [];
    let key = 0;

    if (comment.analyzedText === undefined) {
        return <Text style={styleR.textInput}>{comment}</Text>;
    }

    comment.analyzedText?.forEach(commentFragment => {
        let advice = "Here's how you can improve this comment.";
        if (commentFragment.advice) {
            advice = commentFragment.advice;
        }

        // Add space between comment fragments
        if (key !== 0) {
            allText.push(
                <Text key={key} style={styleA.text}> </Text>
            );
            key++;
        }

        if (commentFragment.tone === Tone.Questionable) {
            allText.push(
                <Text key={key}>
                    <Tooltip id="advice" multiline={true} style={{ backgroundColor: "black", color: "white", fontFamily: "sans-serif", maxWidth: "500px", zIndex: "10" }}/>
                    <Text style={[styleA.text, styleA.questionableText]}>
                        <a style={styleA.tooltip} data-tooltip-id="advice" data-tooltip-content={advice}>{commentFragment.text}</a>
                    </Text>
                </Text>
            );
            key++;
        }
        else {
            allText.push(
                <Text key={key} style={styleA.text}>{commentFragment.text}</Text>
            );
            key++;
        }
    });

    console.log("AnalyzedInput allText", allText);

    return <Text style={styleR.textInput}>{allText}</Text>;
}

const AnalyzedInputStyle = StyleSheet.create({
    text: {
        fontSize: 15,
        color: '#545454',
        maxWidth: 500
    },
    questionableText: {
        color: "white",
        backgroundColor: '#e76f51'
    }
});
