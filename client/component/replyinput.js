import { StyleSheet, Text, TextInput, View } from "react-native";
import React, { useContext, useState } from "react";
import { AutoSizeTextInput, Card, PrimaryButton, SecondaryButton } from "./basics";
import { CommentContext } from "./comment";
import { gotoLogin } from "../util/navigate";
import { useDatastore, usePersonaKey } from "../util/datastore";
import { useTranslation } from "./translation";
import { Tone, BlingBouncerPending, BlingAcceptableTone, BlingQuestionableTone, BlingOutstandingTone } from "../prototype/CommentBouncer.js";
import { Tooltip } from "react-tooltip";


export function ReplyInput({commentKey=null, topLevel = false, topPad=true}) {
    const personaKey = usePersonaKey();
    const datastore = useDatastore();
    const [post, setPost] = useState({text: '', replyTo: commentKey});
    const {analyzeHandler, postHandler, authorFace, commentPlaceholder, replyWidgets, replyTopWidgets, bouncer} = useContext(CommentContext);
    const s = ReplyInputStyle;

    const placeholderText = useTranslation(commentPlaceholder);

    // bouncerStates: none, submitted, rejected, accepted, loved
    const [bouncerState, setBouncerState] = useState("none");

    // inputStates: unlocked, submissionLocked, feedbackLocked
    const [inputState, setInputState] = useState("unlocked");

    async function onAnalyze() {
        setBouncerState("submitted");
        setInputState("submissionLocked");

        let submission = await analyzeHandler({datastore, text: post.text, replyTo: commentKey});

        console.log("submission: ", submission);

        switch (submission.tone) {
            case "bad":
                setBouncerState("rejected");
                break;
            case "neutral":
                setBouncerState("accepted");
                break;
            case "good":
                setBouncerState("loved");
                break;
        }

        setInputState("feedbackLocked");
        // Displaying text with evaluation
        setPost({text: submission, replyTo: commentKey});
    }

    function onPost() {
        setBouncerState("none");
        setInputState("unlocked");

        let text2Post;
        if (bouncer) {
            // Using the pure comment text without the evaluation
            // setPost doesn't work?
            // setPost({text: post.text.text, replyTo: commentKey});
            text2Post = post.text.text;
        }
        else {
            text2Post = post.text;
        }

        console.log("post in onPost: ", post);

        if (postHandler) {
            const post = {text: text2Post, replyTo: commentKey};
            postHandler({datastore, post});
        } else {
            datastore.addObject('comment', post);
        }
        if (topLevel) {
            setPost({text: '', replyTo: commentKey});
        } else {
            hideReplyInput();
        }
    }

    function onEdit() {
        setBouncerState("none");
        setInputState("unlocked");
        // Using the pure comment text without the evaluation
        setPost({text: post.text.text, replyTo: commentKey});

        // TODO: It would be nice to delete rejected submissions from the datastore when they are being revised
    }

    function hideReplyInput() {
        setBouncerState("none");
        setInputState("unlocked");
        setPost({text: '', replyTo: commentKey})
        datastore.setSessionData('replyToComment', null);
    }

    if (!personaKey) {
        return <View style={{marginTop: topPad ? 16 : 0}}><LoginToComment /></View>
    }

    return <View style={[s.row, topPad ? {marginTop: 16} : null]}>
        {React.createElement(authorFace, {comment: {from: personaKey}})}
        <View style={s.right}>
            {((!topLevel || post.text) && replyTopWidgets.length > 0) ?
                <View style={s.widgetBar}>
                    {replyTopWidgets.map((widget, idx) => 
                        React.createElement(widget, {key: idx, replyTo: commentKey, post, onPostChanged:setPost})
                    )}
                </View>
            : null}
            {
                {
                    "unlocked": 
                        <AutoSizeTextInput style={s.textInput}
                            placeholder={placeholderText}
                            placeholderTextColor='#999'
                            value={post.text}
                            onChangeText={text => setPost({...post, text})}
                            multiline={true}
                        />,
                    "submissionLocked":
                        <AutoSizeTextInput style={s.textInput}
                            placeholder={placeholderText}
                            placeholderTextColor='#999'
                            value={post.text}
                            onChangeText={text => setPost({...post, text})}
                            multiline={true}
                            disabled={true}
                        />,
                    "feedbackLocked": <AnalyzedInput comment={post.text}></AnalyzedInput> 
                }[inputState]
            }
            {(!topLevel || post.text) ? 
                <View style={s.actions}>
                    {bouncer ? 
                        {
                            "none": null,
                            "submitted": <BlingBouncerPending/>,
                            "rejected": <BlingQuestionableTone/>,
                            "accepted": <BlingAcceptableTone/>,
                            "loved": <BlingOutstandingTone/>
                        }[bouncerState]
                        : null
                    }
                </View>
            : null}
            {(!topLevel || post.text) ?
                <View style={s.widgetBar}>
                    {replyWidgets.map((widget, idx) => 
                        React.createElement(widget, {key: idx, replyTo: commentKey, post, onPostChanged:setPost})
                    )}
                </View>
            : null}
            {(!topLevel || post.text) ? 
                <View style={s.actions}>
                    {bouncer ? 
                        { 
                            "none": <PrimaryButton onPress={onAnalyze} label='Analyze'/>,
                            "submitted": <PrimaryButton disabled={true} label='Analyzing...'/>,
                            "rejected": <PrimaryButton onPress={onEdit} label='Edit'/>,
                            "accepted": <PrimaryButton onPress={onPost} label='Post'/>,
                            "loved": <PrimaryButton onPress={onPost} label='Post'/>
                        }[bouncerState]
                        : <PrimaryButton onPress={onPost} label='Post'/>
                    }
                    <SecondaryButton onPress={hideReplyInput} label='Cancel'/>
                </View>
            : null}
        </View>
    </View>
}

const ReplyInputStyle = StyleSheet.create({
    textInput: {
        flex: 1,
        borderRadius: 8, 
        borderWidth: StyleSheet.hairlineWidth, 
        borderColor: '#ddd', padding: 8,
        marginHorizontal: 8,
        fontSize: 15, lineHeight: 20,
        height: 150,
    },
    textInputWrapper: {
        height: 150,
    },
    right: {
        flex: 1,
        maxWidth: 500
    },
    row: {
        flexDirection: 'row',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 8,
    },
    widgetBar: {
        marginLeft: 8,
        marginBottom: 8,
    }
});

export function AnalyzedInput({comment}) {
    if (comment === undefined) {
        console.error("AnalyzedInput: comment is undefined");
        return;
    }

    const styleA = AnalyzedInputStyle;
    const styleR = ReplyInputStyle;
    let allText = [];
    let key = 0;

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

export function TopCommentInput({about = null}) {
    return ReplyInput({commentKey: about, topLevel: true});
}

export function PostInput({placeholder = "What\'s on your mind?", topWidgets=[]}) {
    const commentContext = useContext(CommentContext);
    function postHandler({datastore, post}) {
        datastore.addObject('post', post)
    }
    return <CommentContext.Provider value={{...commentContext, postHandler, commentPlaceholder:placeholder, replyTopWidgets: topWidgets}}>
        <Card>
            <ReplyInput topLevel topPad={false} />
        </Card>
    </CommentContext.Provider>
}


function LoginToComment() {
    return <PrimaryButton onPress={gotoLogin} label='Log in to comment' />
}