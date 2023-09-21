import { useContext, useState } from "react";
import { expandDataList } from "../util/util";
import { Pad, WideScreen, Pill, PrimaryButton } from "../component/basics";
import { gptProcessAsync } from "../component/chatgpt";
import { authorZDFDigital } from "../data/authors";
import { TopCommentInput } from "../component/replyinput";
import { ActionLike, ActionReply, Comment, CommentContext } from "../component/comment";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import { disco } from "../data/conversations";
import { useCollection, useDatastore } from "../util/datastore";
import { Tooltip } from "react-tooltip";
import { languageFrench, languageGerman } from "../component/translation";
import { disco_german } from "../translations/german/conversations_german";
import { disco_french } from "../translations/french/conversations_french";


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

export const CommentBouncerPrototype = {
    key: 'commentbouncer',
    name: 'Comment Bouncer',
    author: authorZDFDigital,
    date: '2023-08-29',
    description,
    screen: CommentBouncerScreen,
    instance: [
        {key: 'disco', name: 'Digital Disco', comment: expandDataList(disco)},
        {key: 'disco-german', name: 'Digital Disco (German)', comment: expandDataList(disco_german), language: languageGerman},
        {key: 'disco-french', name: 'Digital Disco (French)', comment: expandDataList(disco_french), language: languageFrench},
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
    const topLevelComments = comments.filter(comment => !comment.replyTo);

    const commentConfig = {...commentContext,
        getCanPost,
        actions: [ActionReply, ActionLike],
        replyWidgets: [BouncerWidget],
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

function toneToBouncerState(tone) {
    switch (tone) {
        case "bad":
            return BouncerState.Rejected;
        case "neutral":
            return BouncerState.Accepted;
        case "good":
            return BouncerState.Loved;
        default: 
            return BouncerState.Accepted
    }
}

function BouncerWidget({post, onPostChanged}) {
    const datastore = useDatastore();
    const canPost = getCanPost({post});
    const [inProgress, setInprogress] = useState(false);

    async function onAnalyze() {
        setInprogress(true);
        onPostChanged({...post, waiting: true, bouncerState: BouncerState.Submitted});
        const analysis = await analyzeCommentAsync({datastore, text: post.text, replyTo: post.replyTo});
        const bouncerState = toneToBouncerState(analysis.tone);
        setInprogress(false);
        onPostChanged({...post, waiting: false, analysis, bouncerState, checkedText: post.text});
    }

    return <View>
        <BouncerStateBling bouncerState={post.bouncerState} />
        {post.analysis && post.bouncerState == BouncerState.Rejected ? 
            <AnalyzedInput analyzedText={post.analysis.analyzedText} />
        : null}
        <Pad size={4} />
        {(!canPost && !inProgress) ? <PrimaryButton label='Analyze' onPress={onAnalyze} /> : null}
    </View>
}

function getCanPost({post}) {
    return post.text.length > 0 && post.checkedText == post.text && 
        (post.bouncerState == BouncerState.Accepted || post.bouncerState == BouncerState.Loved);
}


async function analyzeCommentAsync({datastore, text, replyTo}) {
    const response = await gptProcessAsync({datastore, promptKey: 'bouncer', params: {text}});

    var tone = Tone.Acceptable;

    response.every(submissionFragment => {
        if (submissionFragment.tone === Tone.Questionable) {
            tone = Tone.Questionable;
            return false;
        }
        else if (submissionFragment.tone === Tone.Outstanding) {
            tone = Tone.Outstanding;
            return true;
        }
        else if (submissionFragment.tone === Tone.Acceptable) {
            tone = Tone.Acceptable;
            return true;
        }
    });

    return {tone, analyzedText: response};
}

function BouncerStateBling({bouncerState}) {
    switch (bouncerState) {
        case BouncerState.Submitted:
            return <BlingBouncerPending />
        case BouncerState.Rejected:
            return <BlingQuestionableTone />
        case BouncerState.Accepted:
            return <BlingAcceptableTone />
        case BouncerState.Loved:
            return <BlingOutstandingTone />
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

export function AnalyzedInput({analyzedText}) {
    const s = AnalyzedInputStyle;
    let allText = [];
    let key = 0;

    analyzedText?.forEach(commentFragment => {
        let advice = "Here's how you can improve this comment.";
        if (commentFragment.advice) {
            advice = commentFragment.advice;
        }

        // Add space between comment fragments
        if (key !== 0) {
            allText.push(
                <Text key={key} style={s.text}> </Text>
            );
            key++;
        }

        if (commentFragment.tone === Tone.Questionable) {
            allText.push(
                <Text key={key}>
                    <Tooltip id="advice" multiline={true} style={{ backgroundColor: "black", color: "white", fontFamily: "sans-serif", maxWidth: "500px", zIndex: "10" }}/>
                    <Text style={[s.text, s.questionableText]}>
                        <a style={s.tooltip} data-tooltip-id="advice" data-tooltip-content={advice}>{commentFragment.text}</a>
                    </Text>
                </Text>
            );
            key++;
        }
        else {
            allText.push(
                <Text key={key} style={s.text}>{commentFragment.text}</Text>
            );
            key++;
        }
    });

    return <Text style={{marginVertical: 8}}>{allText}</Text>;
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
